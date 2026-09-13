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

import hashlib
import html
import json
import logging
import os
import re
import smtplib
import subprocess
import sys
import time
import unicodedata
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

# The page renders its table client-side from this static JSON feed — reading
# it directly is far cheaper and more reliable than scraping rendered DOM text
# for a "total records" string (the page never actually shows one).
#
# NOTE (2026-09-13): this MUST stay in sync with the filename the page actually
# loads. ESDC moved the table from `non_compliant_new.json` to
# `non_compliant.json` around 2026-07-15 and left the old file frozen in place
# rather than deleting it — so the old URL kept returning HTTP 200 and a
# plausible-looking 1355 records while the real list grew to 1401. Every change
# check between 2026-07-15 and 2026-09-07 compared against that fossil, which
# is why 47 decisions (all of August) went unseen for weeks, and why two
# employers published after the freeze looked like they had been "retracted".
# `verify_feed_url()` below re-derives this from the page on every run so a
# future rename surfaces as a loud warning instead of silent staleness.
NON_COMPLIANT_JSON_URL = (
    "https://www.canada.ca/content/dam/ircc/documents/json/non_compliant.json"
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
    # Strip possessive 's before punctuation removal (mirrors JS normalizer).
    name = re.sub(r"[\u2019\u0027]s\b", "", name)
    # Strip diacritics (é→e, à→a, etc.) to match JS normalizer behaviour.
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
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


def verify_feed_url() -> Optional[str]:
    """
    Re-derive the table's JSON URL from the page itself and compare it to
    NON_COMPLIANT_JSON_URL.

    Guards against the failure that hid all of August 2026: ESDC renamed the
    feed and left the old file served, frozen, at its original URL. A stale
    feed does not 404 and does not look broken — it just quietly stops
    changing, and a change-detection sync built on it stops detecting.

    Returns the URL found on the page, or None if it could not be read.
    """
    try:
        result = subprocess.run(
            [
                "curl", "-sS", "--max-time", "20",
                "-A", "Mozilla/5.0 (compatible; lmia-portal-sync/1.0)",
                IRCC_URL,
            ],
            capture_output=True, text=True, timeout=25, check=True,
        )
    except (subprocess.SubprocessError, OSError) as e:
        log.warning(f"Could not fetch page to verify feed URL: {e}")
        return None

    found = re.findall(
        r"[\w./-]*non_compliant[\w-]*\.json", result.stdout
    )
    if not found:
        log.warning(
            "Could not find a non_compliant*.json reference on the page — "
            "the table may no longer be JSON-driven. Verify manually: "
            f"{IRCC_URL}"
        )
        return None

    page_url = "https://www.canada.ca" + found[0] if found[0].startswith("/") else found[0]
    if page_url.rsplit("/", 1)[-1] != NON_COMPLIANT_JSON_URL.rsplit("/", 1)[-1]:
        log.error(
            "FEED URL CHANGED — the page now loads %s but this script polls %s. "
            "Change detection is comparing against a stale file; update "
            "NON_COMPLIANT_JSON_URL before trusting any 'unchanged' result.",
            page_url, NON_COMPLIANT_JSON_URL,
        )
    return page_url



def fetch_feed_state() -> tuple[Optional[int], Optional[str], Optional[list[dict]]]:
    """
    Read the JSON feed that backs the page's table and return
    (record_count, content_fingerprint, raw_records).

    Shells out to curl rather than using requests/urllib: canada.ca's bot
    mitigation (Akamai) silently hangs plain Python HTTP clients — even with
    a browser User-Agent — while curl's TLS/HTTP fingerprint passes through
    fine. Playwright (used for the full scrape below) also passes since it's
    a real browser engine.

    The fingerprint exists because a record COUNT cannot detect an
    add+remove. In August 2026 ESDC published 2 decisions and withdrew 2
    others; the count returned to its previous value and the sync skipped for
    a month while two retracted employers stayed live on the site. Hashing the
    row contents makes any substantive change visible.
    """
    try:
        result = subprocess.run(
            [
                "curl", "-sS", "--max-time", "20",
                "-A", "Mozilla/5.0 (compatible; lmia-portal-sync/1.0)",
                NON_COMPLIANT_JSON_URL,
            ],
            capture_output=True, text=True, timeout=25, check=True,
        )
        records = json.loads(result.stdout).get("list")
        if isinstance(records, list) and len(records) > 100:  # sanity check
            return len(records), fingerprint_records(records), records
    except (subprocess.SubprocessError, OSError, ValueError) as e:
        log.warning(f"Could not fetch feed state from JSON feed: {e}")
    return None, None, None


def fingerprint_records(records: list[dict]) -> str:
    """
    Stable SHA-256 over the fields that carry meaning for us: who, when, how
    much, and what status. Sorted so feed reordering alone doesn't force a
    pointless scrape, while any add, removal or edit does.
    """
    rows = sorted(
        "\x1f".join((
            (r.get("bn_operating") or "").strip(),
            (r.get("date") or "").strip(),
            (r.get("penalty_en") or "").strip(),
            (r.get("status_en") or "").strip(),
        ))
        for r in records
    )
    return hashlib.sha256("\x1e".join(rows).encode("utf-8")).hexdigest()


def canonical_name(name: Optional[str]) -> str:
    """
    Reduce an employer name to a form comparable between the JSON feed and the
    scraped table. They are not the same text: the feed carries HTML source
    (``A&amp;W``, ``Résidence Le\xa0Coulongeois``) while the table gives us the
    rendered result (``A&W``, with a normal space). Comparing them raw marks
    ~5% of the database as withdrawn — every name containing an ampersand.
    """
    n = html.unescape(name or "")
    n = unicodedata.normalize("NFKC", n)      # NBSP → space, ligatures, etc.
    n = n.replace("\u2019", "'").replace("\u2018", "'")
    return re.sub(r"\s+", " ", n).strip().casefold()


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


def get_last_fingerprint(supabase) -> Optional[str]:
    """Most recent feed fingerprint we recorded, or None (incl. pre-migration)."""
    try:
        result = (
            supabase.table("sync_logs")
            .select("feed_fingerprint")
            .eq("source", "ircc_non_compliant")
            .in_("status", ["success", "skipped"])
            .not_.is_("feed_fingerprint", "null")
            .order("synced_at", desc=True)
            .limit(1)
            .execute()
        )
        if result.data:
            return result.data[0]["feed_fingerprint"]
    except Exception as e:
        log.warning(f"Could not read last fingerprint from DB: {e}")
    return None


def reconcile_removals(supabase, feed_records: list[dict]) -> tuple[int, int]:
    """
    ESDC withdraws records as well as adding them — a decision can be published
    and pulled days later. Our upsert never deletes, so without this pass a
    retracted employer stays on the site accused of a penalty the government no
    longer publishes.

    Flags rows whose employer no longer appears in the feed with
    removed_from_source, and clears the flag for any that reappear. We flag
    rather than delete: people arrive from older links and newsletters and need
    the page to explain what changed.

    Matching is on employer NAME only, not name+date, and that is deliberate.
    The failure modes are not symmetric: wrongly flagging a row silently
    retracts a real ban and under-warns a worker, while missing one leaves a
    stale record we would catch by other means. So we only clear an accusation
    when the employer has left the government list altogether — a blanked or
    re-dated row (ESDC does that too: see Armour Trucking, whose date, penalty
    and status were emptied in place) keeps its warning.

    Returns (newly_flagged, unflagged).
    """
    if not feed_records:
        log.warning("No feed records available — skipping reconciliation.")
        return 0, 0

    live_names = {canonical_name(r.get("bn_operating")) for r in feed_records}
    live_names.discard("")
    today = datetime.now(timezone.utc).date().isoformat()

    # PostgREST caps a response at 1000 rows. Paginate — reading a truncated
    # table would make every unread row look absent from the feed.
    rows: list[dict] = []
    PAGE = 1000
    try:
        offset = 0
        while True:
            batch = (
                supabase.table("violators")
                .select("id, business_operating_name, removed_from_source")
                .order("id")
                .range(offset, offset + PAGE - 1)
                .execute()
            ).data or []
            rows.extend(batch)
            if len(batch) < PAGE:
                break
            offset += PAGE
    except Exception as e:
        log.warning(f"Could not read violators for reconciliation: {e}")
        return 0, 0

    to_flag, to_clear = [], []
    for r in rows:
        present = canonical_name(r.get("business_operating_name")) in live_names
        if not present and not r.get("removed_from_source"):
            to_flag.append(r["id"])
        elif present and r.get("removed_from_source"):
            to_clear.append(r["id"])

    # A wholesale mismatch means the scrape or the name normalisation is broken,
    # not that ESDC emptied its list. Bail out rather than flag the database.
    if rows and len(to_flag) > len(rows) * 0.05:
        log.error(
            f"Reconciliation aborted: {len(to_flag)}/{len(rows)} rows look absent from the "
            "feed (>5%). Refusing to mass-flag — check the scrape and canonical_name()."
        )
        return 0, 0

    by_id = {r["id"]: r for r in rows}

    def _update(ids: list[int], value: Optional[str]):
        for i in range(0, len(ids), 100):
            supabase.table("violators").update(
                {"removed_from_source": value}
            ).in_("id", ids[i : i + 100]).execute()

    try:
        if to_flag:
            _update(to_flag, today)
            names = [by_id[i]["business_operating_name"] for i in to_flag[:10]]
            log.warning(
                f"{len(to_flag)} record(s) withdrawn by ESDC — flagged: {', '.join(names)}"
            )
        if to_clear:
            _update(to_clear, None)
            log.info(f"{len(to_clear)} previously-withdrawn record(s) reappeared — flag cleared.")
    except Exception as e:
        if "PGRST204" in str(e) or "Could not find the" in str(e):
            log.warning(
                "Column 'removed_from_source' not in DB yet — skipping reconciliation.\n"
                "  ACTION NEEDED: Run supabase/migrations/20260905_add_removed_from_source.sql."
            )
        else:
            log.warning(f"Could not update removal flags: {e}")
        return 0, 0

    return len(to_flag), len(to_clear)


def write_sync_log(supabase, *, status: str, total_scraped: Optional[int],
                   records_added: int, records_updated: int,
                   last_known_count: Optional[int], message: str,
                   duration_secs: float, feed_fingerprint: Optional[str] = None):
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
            "feed_fingerprint": feed_fingerprint,
        }).execute()
    except Exception as e:
        # feed_fingerprint ships in 20260905_add_removed_from_source.sql. Until
        # that migration lands, retry without it so logging degrades instead of
        # going dark.
        if "PGRST204" in str(e) or "Could not find the" in str(e):
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
                return
            except Exception as e2:
                e = e2
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

    # ── Step 1: Read the JSON feed (no browser needed) ──
    # Confirm we are still polling the file the page actually uses. A renamed
    # feed is the one failure mode this whole step cannot otherwise see: the
    # old URL keeps returning 200 with stale data, so "unchanged" stays true
    # forever. Logged, not fatal — a scrape on a stale pointer is still safer
    # than no scrape at all.
    verify_feed_url()

    log.info("Fetching feed state from JSON feed...")
    live_count, live_fingerprint, feed_records = fetch_feed_state()

    last_count = get_last_known_count(supabase)
    last_fingerprint = get_last_fingerprint(supabase)
    log.info(f"Live count: {live_count}   Last synced count: {last_count}")

    # ── Step 2: Skip only if the feed's CONTENTS are unchanged ──
    # Deliberately not a count comparison: a count cannot see an equal-sized
    # add+remove. (The August 2026 incident that prompted this turned out to be
    # a stale feed URL rather than a retraction — see verify_feed_url() — but
    # the reasoning holds regardless.) Until we have a fingerprint to compare
    # against we always scrape.
    if (
        live_fingerprint is not None
        and last_fingerprint is not None
        and live_fingerprint == last_fingerprint
    ):
        duration = time.monotonic() - started
        msg = f"Feed unchanged ({live_count} records, fingerprint {live_fingerprint[:12]}) — skipping sync."
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
            feed_fingerprint=live_fingerprint,
        )
        send_email(
            "[LMIA Sync] Skipped — no new records",
            f"Weekly sync ran at {now_utc}.\n\n{msg}\nDuration: {duration:.1f}s",
        )
        log.info("Done.")
        return

    # ── Step 3: Full scrape ───────────────────────────────────
    log.info("Feed changed or fingerprint unknown — starting full scrape...")
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

        # The upsert only ever adds and edits. Records ESDC has WITHDRAWN have
        # to be flagged separately or they linger on the site as live
        # accusations — see reconcile_removals().
        withdrawn, restored = reconcile_removals(
            supabase, feed_records if feed_records is not None else []
        )

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
        f"  Scraped:   {total_scraped} records\n"
        f"  New:       {inserted}\n"
        f"  Updated:   {updated}\n"
        f"  Withdrawn: {withdrawn}\n"
        f"  Restored:  {restored}\n"
        f"  Duration:  {duration:.1f}s"
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
        feed_fingerprint=live_fingerprint,
    )

    send_email(
        f"[LMIA Sync] {inserted} new, {updated} updated, {withdrawn} withdrawn — {now_utc}",
        summary,
    )
    log.info("=" * 60)


if __name__ == "__main__":
    run_sync()
