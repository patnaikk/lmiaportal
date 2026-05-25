# LMIA Portal Project Instructions

## Recurring Maintenance Tasks

### Non-Compliant Employer List Updates
**Frequency:** Twice per week (Monday & Thursday mornings recommended)
**Complete Update Procedure:**
1. Scrape latest data: `python3 scraper/scrape_non_compliant.py`
2. Ingest to database: `python3 scripts/ingest.py --file scraper/non_compliant_employers_<DATE>_<TIME>.csv --type violators`
3. **Homepage automatically refreshes** - "Recently Banned" section displays 5 most recent bans dynamically
4. Check "New ban:" banner at top of homepage to verify latest addition

**Important Notes:**
- Always use `python3` (not `python`)
- New records are live immediately after ingest
- Homepage shows 5 most recent bans in the "Recently Banned Employers" section
- Latest ban appears in the red "New ban:" banner
- Data source: https://www.canada.ca/en/employment-social-development/services/foreign-workers/report-abuse/non-compliant-employers.html

### Data Sources
- **Positive LMIA**: Updated quarterly from ESDC (Q3 2025 data in `tfwp_2025q3_pos_en.xlsx`)
- **Non-Compliant Employers**: Updated twice weekly from Canada.ca
- **Database**: Supabase PostgreSQL at https://kkazqaiigdhhqielyvas.supabase.co

### Key Setup Details
- Service role key needed in `.env.local` for data ingestion
- RPC functions: `search_violators` and `search_positive_lmia` (auto-created from schema.sql)
- All data ingestion is server-side only

## Navigation Fix (April 5, 2026)
- Created reusable Navigation component to prevent menu jumping
- Added scrollbar-gutter: stable CSS to prevent layout shift
- All pages now use consistent 5-link navigation (Verify offer, Guide, FAQ, About, What's new)
