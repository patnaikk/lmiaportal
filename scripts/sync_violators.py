#!/usr/bin/env python3
# Run with: python3 scripts/sync_violators.py
"""
LMIA Portal — Weekly Non-Compliant Employers Sync
==================================================
Schedule: Every Monday at 06:00 UTC  (cron: 0 6 * * 1)

Behaviour:
  1. Load IRCC page (first page only) and extract total record count.
  2. Compare with last synced count stored in sync_logs. If unchanged → exit.
  3. Scrape every page via Playwright (headless Chromium).
  4. Upsert all records: update changed fields for existing employers,
     insert new ones. Uses (business_operating_name, decision_date) as the
     natural key — requires the unique constraint from add_sync_logs.sql.
  5. Write a row to sync_logs with counts, duration, and status.
  6. Send an email notification (success or failure).

Run manually:
  python scripts/sync_violators.py

Requirements:
  pip install playwright python-dotenv supabase
  playwright install chromium
"""

import json
import logging
import os
import re
import smtplib
import sys
import time
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

# ── Dependency check ──────────────────────────────────────────
_missing = []
try:
    from playwright.sync_api import sync_playwright, Page
except ImportError:
    _missing.append("playwright")
try:
    from dotenv import load_dotenv
except ImportError:
    _missing.append("python-dotenv")
try:
    from supabase import create_client
except ImportError:
    _missing.append("supabase")

if _missing:
    print(f"Missing packages: {', '.join(_missing)}")
    print(f"Install: pip install {' '.join(_missing)}")
    if "playwright" in _missing:
        print("Then:    playwright install chromium")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
load_dotenv(ROOT / ".env.local")

IRCC_URL = (
    "https://www.canada.ca/en/immigration-refugees-citizenship"
    "/services/work-canada/employers-non-compliant.html"
)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_ANON_KEY", "")
)
EMAIL_TO   = os.environ.get("SYNC_EMAIL_TO", "")
EMAIL_FROM = os.environ.get("SYNC_EMAIL_FROM", EMAIL_TO)
SMTP_HOST  = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT  = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER  = os.environ.get("SMTP_USER", "")
SMTP_PASS  = os.environ.get("SMTP_PASS", "")

EXPECTED_COLUMNS = [
    "Business Operating Name",
    "Business Legal Name",
    "Address",
    "Reason(s)",
    "Date of Final Decision",
    "Penalty",
    "Status",
]

LEGAL_SUFFIXES = frozenset([
    "inc", "ltd", "corp", "co", "llc", "limited", "incorporated",
    "ltee", "lte", "plc", "gmbh", "sa", "srl",
])

# ── Logging ───────────────────────────────────────────────────
log_file = ROOT / "scripts" / "sync.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("sync_violators")


# ── Name normalisation (mirrors ingest.py) ────────────────────
def normalize_name(name: str) -> str:
    if not isinstance(name, str):
        return ""
    name = name.lower()
    name = re.sub(r"[^\w\s]", " ", name)
    name = re.sub(r"\s+", " ", name).strip()
    words = [w for w in name.split() if w not in LEGAL_SUFFIXES]
    return " ".join(words).strip()


# ── Status parsing (mirrors ingest.py) ───────────────────────
def parse_compliance_status(raw_status: str):
    """Return (compliance_status, ineligible_until_date)."""
    if not isinstance(raw_status, str):
        return "INELIGIBLE_UNPAID", None

    s = raw_status.strip().lower()

    if s.startswith("eligible") and "ineligible" not in s:
        return "ELIGIBLE", None

    if "ineligible until" in s:
        date_match = re.search(r"(\d{4}-\d{2}-\d{2})", raw_status)
        if not date_match:
            date_match = re.search(r"(\w+ \d{1,2},?\s*\d{4})", raw_status, re.IGNORECASE)
        if date_match:
            for fmt in ("%Y-%m-%d", "%B %d, %Y", "%B %d %Y", "%B %d,%Y"):
                try:
                    parsed = datetime.strptime(date_match.group(1).strip(), fmt).date()
                    return "INELIGIBLE_UNTIL", parsed
                except ValueError:
                    continue
        return "INELIGIBLE_UNTIL", None

    if "unpaid" in s:
        return "INELIGIBLE_UNPAID", None

    if s.strip() == "ineligible":
        return "INELIGIBLE", None

    return "INELIGIBLE_UNPAID", None


# ── Playwright helpers ────────────────────────────────────────
def wait_for_table(page: Page):
    try:
        page.wait_for_function(
            """() => {
                const rows = document.querySelectorAll('table tbody tr');
                return rows.length > 0 &&
                       rows[0].querySelectorAll('td')[0]?.innerText.trim().length > 0;
            }""",
            timeout=20_000,
        )
    except Exception:
        time.sleep(3)


def extract_page_rows(page: Page) -> list[list[str]]:
    return page.eval_on_selector_all(
        "table tbody tr",
        """rows => rows.map(row =>
            Array.from(row.querySelectorAll('td'))
                .map(td => td.innerText.trim())
        )""",
    )


def find_next_button(page: Page):
    selectors = [
        "a[aria-label='Next page']",
        "a[aria-label='next page']",
        "button[aria-label='Next page']",
        "li.next a",
        "a.next",
        "[class*='next'] a",
        "[class*='pagination'] a[rel='next']",
        "a:has-text('Next')",
        "button:has-text('Next')",
    ]
    for sel in selectors:
        try:
            el = page.query_selector(sel)
            if el and el.is_visible():
                return el
        except Exception:
            continue
    return None


def is_next_disabled(page: Page) -> bool:
    disabled_selectors = [
        "li.next.disabled",
        "li[class*='next'][class*='disabled']",
        "a[aria-label='Next page'][aria-disabled='true']",
        ".pagination .next.disabled",
    ]
    for sel in disabled_selectors:
        try:
            if page.query_selector(sel):
                return True
        except Exception:
            continue
    return False


def extract_total_count(page: Page) -> Optional[int]:
    """
    Try to read the total record count from the page without scraping all rows.
    Checks several common patterns Canada.ca uses in paginated tables.
    """
    try:
        body_text = page.inner_text("body").lower()
    except Exception:
        return None

    patterns = [
        r"total\s+records?[:\s]+(\d[\d,]*)",
        r"(\d[\d,]+)\s+total\s+records?",
        r"showing\s+\d[\d,]*\s*[–\-]\s*\d[\d,]*\s+of\s+([\d,]+)",
        r"(\d[\d,]+)\s+results?",
        r"(\d[\d,]+)\s+employers?",
        r"of\s+([\d,]+)\s+results?",
    ]
    for pattern in patterns:
        m = re.search(pattern, body_text)
        if m:
            try:
                count = int(m.group(1).replace(",", ""))
                if count > 100:  # sanity check — real list is >1000
                    return count
            except ValueError:
                continue

    # Fallback: try to read pagination "Page X of Y" × items-per-page
    try:
        # Look for per-page selector value
        per_page_el = page.query_selector("select[name*='length'], select[name*='per_page']")
        per_page = int(per_page_el.input_value()) if per_page_el else None

        # Look for last page number in pagination
        page_nums = page.eval_on_selector_all(
            ".pagination a, [class*='pagination'] a",
            "els => els.map(e => e.innerText.trim()).filter(t => /^\\d+$/.test(t))",
        )
        if page_nums and per_page:
            last_page = max(int(n) for n in page_nums if n.isdigit())
            return last_page * per_page
    except Exception:
        pass

    return None


# ── DB helpers ────────────────────────────────────────────────
def get_last_known_count(supabase) -> Optional[int]:
    """Read the most recent successful sync's record count from sync_logs."""
    try:
        result = (
            supabase.table("sync_logs")
            .select("last_known_count")
            .eq("source", "ircc_non_compliant")
            .in_("status", ["success", "skipped"])
            .order("synced_at", desc=True)
            .limit(1)
            .execute()
        )
        if result.data:
            return result.data[0]["last_known_count"]
    except Exception as e:
        log.warning(f"Could not read last known count from DB: {e}")
    return None


def write_sync_log(supabase, *, status: str, total_scraped: Optional[int],
                   records_added: int, records_updated: int,
                   last_known_count: Optional[int], message: str,
                   duration_secs: float):
    try:
        supabase.table("sync_logs").insert({
            "source":           "ircc_non_compliant",
            "status":           status,
            "total_scraped":    total_scraped,
            "records_added":    records_added,
            "records_updated":  records_updated,
            "last_known_count": last_known_count,
            "message":          message,
            "duration_secs":    round(duration_secs, 1),
        }).execute()
    except Exception as e:
        log.warning(f"Could not write sync_log: {e}")


def build_record(raw: dict, headers: list[str]) -> dict:
    """Convert a scraped row dict into a violators table record."""
    col = {h.lower().strip(): raw.get(h, "") for h in headers}

    def g(*keys) -> str:
        for k in keys:
            v = col.get(k.lower().strip(), "")
            if v and str(v).strip().lower() != "nan":
                return str(v).strip()
        return ""

    op_name     = g("Business Operating Name")
    raw_status  = g("Status")
    raw_penalty = g("Penalty")
    raw_date    = g("Date of Final Decision", "Date of final decision")

    compliance_status, ineligible_until = parse_compliance_status(raw_status)

    decision_date = None
    for fmt in ("%Y-%m-%d", "%B %d, %Y", "%B %d,%Y", "%d/%m/%Y"):
        try:
            decision_date = datetime.strptime(raw_date.strip(), fmt).date()
            break
        except ValueError:
            continue

    penalty_amount = ""
    ban_duration   = None
    dollar_m = re.search(r"(\$[\d,]+)", raw_penalty)
    if dollar_m:
        penalty_amount = dollar_m.group(1)
    ban_m = re.search(r"(\d+[\-\s]year ban)", raw_penalty, re.IGNORECASE)
    if ban_m:
        ban_duration = ban_m.group(1)

    legal_name = g("Business Legal Name")
    return {
        "business_operating_name": op_name,
        "business_legal_name":     legal_name,
        "employer_normalized":     normalize_name(op_name),
        "legal_name_normalized":   normalize_name(legal_name),
        "address":                 g("Address"),
        "province":                "",
        "reasons":                 g("Reason(s)", "Reasons"),
        "decision_date":           str(decision_date) if decision_date else None,
        "penalty_raw":             raw_penalty,
        "penalty_amount":          penalty_amount,
        "ban_duration":            ban_duration,
        "status_raw":              raw_status,
        "compliance_status":       compliance_status,
        "ineligible_until_date":   str(ineligible_until) if ineligible_until else None,
    }


def upsert_records(supabase, records: list[dict]) -> tuple[int, int]:
    """
    Upsert all records.

    Primary strategy: ON CONFLICT (business_operating_name, decision_date)
    — requires the unique constraint from add_sync_logs.sql.

    Fallback (if constraint is missing): full-replace — delete all rows then
    re-insert.  Safe because we always scrape the complete government list.
    Run add_sync_logs.sql in Supabase to upgrade to proper upsert.

    Returns (inserted_count, updated_count).
    """
    BATCH = 100

    # Snapshot current row count before upsert
    count_before = 0
    try:
        r = supabase.table("violators").select("id", count="exact").execute()
        count_before = r.count or 0
    except Exception:
        pass

    # Strip columns that don't exist in the DB yet (pre-migration runs).
    # Detected by PGRST204 "Could not find the column".
    extra_cols: set[str] = set()

    def _strip(batch: list[dict]) -> list[dict]:
        if not extra_cols:
            return batch
        return [{k: v for k, v in r.items() if k not in extra_cols} for r in batch]

    def _do_upsert(batch: list[dict], use_conflict: bool):
        b = _strip(batch)
        if use_conflict:
            supabase.table("violators").upsert(
                b, on_conflict="business_operating_name,decision_date"
            ).execute()
        else:
            supabase.table("violators").insert(b).execute()

    def _handle_unknown_col(e: Exception) -> bool:
        """Return True if error is a missing column; record the column name."""
        es = str(e)
        if "PGRST204" in es or "Could not find the" in es:
            # Extract column name from message like "Could not find the 'foo' column"
            m = re.search(r"find the '(\w+)' column", es)
            col = m.group(1) if m else None
            if col:
                extra_cols.add(col)
                log.warning(
                    f"Column '{col}' not in DB yet — skipping it for now.\n"
                    "  ACTION NEEDED: Run supabase/add_legal_name_search.sql in Supabase SQL editor."
                )
                return True
        return False

    constraint_missing = False

    def _run_batches(use_conflict: bool):
        nonlocal constraint_missing
        all_batches = [records[i : i + BATCH] for i in range(0, len(records), BATCH)]
        for idx, batch in enumerate(all_batches):
            done = False
            while not done:
                try:
                    _do_upsert(batch, use_conflict)
                    log.info(f"  {'upserted' if use_conflict else 'inserted'} "
                             f"{min((idx + 1) * BATCH, len(records))}/{len(records)} records")
                    done = True
                except Exception as e:
                    es = str(e)
                    if "42P10" in es or "no unique or exclusion constraint" in es.lower():
                        constraint_missing = True
                        log.warning(
                            "Unique constraint not found — falling back to full-replace.\n"
                            "  ACTION NEEDED: Run supabase/add_sync_logs.sql in Supabase SQL editor."
                        )
                        return  # will retry below as full-replace
                    elif _handle_unknown_col(e):
                        continue  # retry same batch without the unknown column
                    else:
                        raise

    _run_batches(use_conflict=True)

    if constraint_missing:
        log.info("Full-replace: deleting existing violators rows...")
        supabase.table("violators").delete().neq("id", 0).execute()
        log.info("Inserting all scraped records...")
        _run_batches(use_conflict=False)

    # Snapshot after
    count_after = 0
    try:
        r = supabase.table("violators").select("id", count="exact").execute()
        count_after = r.count or 0
    except Exception:
        pass

    if constraint_missing:
        # Full replace: all records are "inserted", 0 updated
        return len(records), 0

    inserted = max(0, count_after - count_before)
    updated  = max(0, len(records) - inserted)
    return inserted, updated


# ── Email notification ────────────────────────────────────────
def send_email(subject: str, body: str):
    if not EMAIL_TO or not SMTP_USER or not SMTP_PASS:
        log.info("Email skipped (SYNC_EMAIL_TO / SMTP_USER / SMTP_PASS not configured).")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = EMAIL_FROM
        msg["To"]      = EMAIL_TO
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASS)
            smtp.sendmail(EMAIL_FROM, EMAIL_TO, msg.as_string())
        log.info(f"Notification email sent to {EMAIL_TO}")
    except Exception as e:
        log.warning(f"Failed to send email: {e}")


# ── Main sync logic ───────────────────────────────────────────
def run_sync():
    started = time.monotonic()
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    log.info("=" * 60)
    log.info(f"  Non-Compliant Employers Sync  —  {now_utc}")
    log.info("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        msg = "SUPABASE_URL / SUPABASE_SERVICE_KEY not set in .env.local"
        log.error(msg)
        send_email("[LMIA Sync] ERROR — config missing", msg)
        sys.exit(1)

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # ── Step 1: Quick count check (page 1 only) ───────────────
    live_count: Optional[int] = None
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0.0.0 Safari/537.36"
                )
            )
            page = context.new_page()
            log.info("Fetching page 1 for count check...")
            page.goto(IRCC_URL, wait_until="domcontentloaded", timeout=60_000)
            wait_for_table(page)
            live_count = extract_total_count(page)
            browser.close()
    except Exception as e:
        log.warning(f"Count-check failed: {e} — proceeding with full scrape anyway.")

    last_count = get_last_known_count(supabase)
    log.info(f"Live count: {live_count}   Last synced count: {last_count}")

    # ── Step 2: Skip if count unchanged ──────────────────────
    if (
        live_count is not None
        and last_count is not None
        and live_count == last_count
    ):
        duration = time.monotonic() - started
        msg = f"Count unchanged ({live_count} records) — skipping sync."
        log.info(msg)
        write_sync_log(
            supabase,
            status="skipped",
            total_scraped=None,
            records_added=0,
            records_updated=0,
            last_known_count=live_count,
            message=msg,
            duration_secs=duration,
        )
        send_email(
            "[LMIA Sync] Skipped — no new records",
            f"Weekly sync ran at {now_utc}.\n\n{msg}\nDuration: {duration:.1f}s",
        )
        log.info("Done.")
        return

    # ── Step 3: Full scrape ───────────────────────────────────
    log.info("Count changed or unknown — starting full scrape...")
    try:
        all_rows: list[list[str]] = []
        headers: list[str] = EXPECTED_COLUMNS[:]

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0.0.0 Safari/537.36"
                )
            )
            page = context.new_page()
            page.goto(IRCC_URL, wait_until="domcontentloaded", timeout=60_000)
            wait_for_table(page)

            # Refresh count from fully-loaded first page
            if live_count is None:
                live_count = extract_total_count(page)

            detected = page.eval_on_selector_all(
                "table thead th",
                "els => els.map(e => e.innerText.trim()).filter(t => t.length > 0)",
            )
            if detected:
                headers = detected
            log.info(f"Columns: {headers}")

            current_page = 1
            while True:
                rows_raw = extract_page_rows(page)
                rows = [r for r in rows_raw if any(cell for cell in r)]
                all_rows.extend(rows)
                log.info(
                    f"Page {current_page:>2}  →  {len(rows):>3} rows  "
                    f"(running total: {len(all_rows)})"
                )

                if is_next_disabled(page):
                    log.info("Last page reached.")
                    break
                next_btn = find_next_button(page)
                if not next_btn:
                    log.info("No Next button — assuming last page.")
                    break
                next_btn.click()
                time.sleep(1.5)
                wait_for_table(page)
                time.sleep(0.5)
                current_page += 1

            browser.close()

        total_scraped = len(all_rows)
        if live_count is None:
            live_count = total_scraped
        log.info(f"Scraped {total_scraped} records across {current_page} pages.")

    except Exception as e:
        duration = time.monotonic() - started
        msg = f"Scrape failed: {e}"
        log.exception(msg)
        write_sync_log(
            supabase,
            status="error",
            total_scraped=None,
            records_added=0,
            records_updated=0,
            last_known_count=live_count,
            message=msg,
            duration_secs=duration,
        )
        send_email("[LMIA Sync] ERROR — scrape failed", f"Error at {now_utc}:\n\n{msg}")
        sys.exit(1)

    # ── Step 4 & 5: Parse + upsert ────────────────────────────
    try:
        records = []
        for row in all_rows:
            while len(row) < len(headers):
                row.append("")
            raw = {headers[i]: row[i] for i in range(len(headers))}
            rec = build_record(raw, headers)
            if rec["business_operating_name"]:
                records.append(rec)

        log.info(f"Upserting {len(records)} parsed records...")
        inserted, updated = upsert_records(supabase, records)
        log.info(f"Done: {inserted} new, {updated} updated.")

    except Exception as e:
        duration = time.monotonic() - started
        msg = f"DB upsert failed: {e}"
        log.exception(msg)
        write_sync_log(
            supabase,
            status="error",
            total_scraped=total_scraped,
            records_added=0,
            records_updated=0,
            last_known_count=live_count,
            message=msg,
            duration_secs=duration,
        )
        send_email("[LMIA Sync] ERROR — DB upsert failed", f"Error at {now_utc}:\n\n{msg}")
        sys.exit(1)

    # ── Step 6: Log + notify ──────────────────────────────────
    duration = time.monotonic() - started
    summary = (
        f"Sync complete at {now_utc}\n"
        f"  Scraped:  {total_scraped} records\n"
        f"  New:      {inserted}\n"
        f"  Updated:  {updated}\n"
        f"  Duration: {duration:.1f}s"
    )
    log.info(summary)

    write_sync_log(
        supabase,
        status="success",
        total_scraped=total_scraped,
        records_added=inserted,
        records_updated=updated,
        last_known_count=live_count,
        message=summary,
        duration_secs=duration,
    )

    send_email(
        f"[LMIA Sync] {inserted} new, {updated} updated — {now_utc}",
        summary,
    )
    log.info("=" * 60)


if __name__ == "__main__":
    run_sync()
