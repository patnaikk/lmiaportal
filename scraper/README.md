# 🇨🇦 IRCC Non-Compliant Employers — Downloader
### Downloads the full employer list from Canada.ca into Excel + CSV

---

## What this does

Visits the Government of Canada's non-compliant employers page, waits for all
the data to load, then saves everything into two files in the same folder:

- `non_compliant_employers_YYYY-MM-DD.xlsx` — formatted Excel with filters
- `non_compliant_employers_YYYY-MM-DD.csv`  — plain CSV for any other tool

---

## Requirements

- **Python 3.9 or newer** — check by opening a terminal and typing:
  ```
  python --version
  ```
  If Python isn't installed, download it from: https://www.python.org/downloads/
  ✅ Check "Add Python to PATH" during install on Windows.

---

## One-time setup (do this once only)

Open a terminal (Command Prompt or PowerShell on Windows, Terminal on Mac),
navigate to the folder where you unzipped this, then run:

```
pip install playwright pandas openpyxl
playwright install chromium
```

This installs the tools needed to control a browser automatically.
It may take a couple of minutes.

---

## How to run it

Every time you want a fresh download, just run:

**Windows:**
```
python scrape_non_compliant.py
```

**Mac / Linux:**
```
python3 scrape_non_compliant.py
```

The script will open a hidden browser, load the page, wait for all the data,
and save the files. You'll see progress messages like:

```
==========================================================
  IRCC Non-Compliant Employers Scraper
==========================================================
🌐  Launching browser...
📄  Loading: https://www.canada.ca/...
⏳  Waiting for table data to render...
✅  347 employer records found.
📊  Excel saved  →  non_compliant_employers_2026-03-07_14-32.xlsx
📄  CSV saved    →  non_compliant_employers_2026-03-07_14-32.csv

✅  Done!
==========================================================
```

---

## The Excel file includes

- **Formatted table** with colour-coded rows and auto-filters on every column
- **Status column** highlighted in red for easy scanning
- **Summary sheet** with a count of records and status breakdown
- Timestamp and source URL embedded in the header

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `python` not found | Try `python3` instead, or reinstall Python with "Add to PATH" checked |
| `ModuleNotFoundError` | Run the pip install command again |
| `0 records found` | The page may be slow — run the script again |
| Page won't load | Check your internet connection |

---

## Notes

- Each run creates a **new timestamped file** — old files are not overwritten
- Requires an internet connection
- The Government of Canada page updates periodically; re-run whenever you need fresh data
