#!/usr/bin/env python3
"""
LMIA Check — Data Ingestion Script
====================================
Loads government LMIA data into Supabase.

Usage:
  # Positive LMIA employers (ESDC quarterly Excel):
  python scripts/ingest.py --file data/tfwp_2025q3_pos_en.xlsx --quarter 2025-Q3

  # Non-compliant employers (from scraper CSV or Excel):
  python scripts/ingest.py --file scraper/non_compliant_employers_2026-03-07_16-15.csv --type violators
  python scripts/ingest.py --file scraper/non_compliant_employers_2026-03-07_16-15.xlsx --type violators

Requirements:
  pip install pandas openpyxl supabase python-dotenv
"""

import argparse
import os
import re
import sys
from datetime import datetime

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

# Load .env.local from project root
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', '')

if not SUPABASE_URL:
    sys.exit('ERROR: SUPABASE_URL not set. Check your .env.local file.')

key = SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY
if not key:
    sys.exit('ERROR: SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY not set.')

supabase_client = create_client(SUPABASE_URL, key)

LEGAL_SUFFIXES = frozenset([
    'inc', 'ltd', 'corp', 'co', 'llc', 'limited', 'incorporated',
    'ltee', 'lte', 'plc', 'gmbh', 'sa', 'srl',
])


def normalize_name(name: str) -> str:
    """Normalise employer name for fuzzy matching."""
    if not isinstance(name, str):
        return ''
    name = name.lower()
    name = re.sub(r'[^\w\s]', ' ', name)   # remove punctuation
    name = re.sub(r'\s+', ' ', name).strip()
    words = [w for w in name.split() if w not in LEGAL_SUFFIXES]
    return ' '.join(words).strip()


def parse_compliance_status(raw_status: str):
    """
    Parse the raw Status column from the government non-compliant list.

    Returns (compliance_status, ineligible_until_date)

    Known raw values:
      "Eligible"
      "Ineligible until February 19, 2027"
      "Ineligible - unpaid monetary penalty"
      "Ineligible"
    """
    if not isinstance(raw_status, str):
        return 'INELIGIBLE_UNPAID', None

    s = raw_status.strip().lower()

    if s.startswith('eligible') and 'ineligible' not in s:
        return 'ELIGIBLE', None

    if 'ineligible until' in s:
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', raw_status)
        if not date_match:
            date_match = re.search(r'(\w+ \d{1,2},?\s*\d{4})', raw_status, re.IGNORECASE)
        if date_match:
            for fmt in ('%Y-%m-%d', '%B %d, %Y', '%B %d %Y', '%B %d,%Y'):
                try:
                    parsed = datetime.strptime(date_match.group(1).strip(), fmt).date()
                    return 'INELIGIBLE_UNTIL', parsed
                except ValueError:
                    continue
        return 'INELIGIBLE_UNTIL', None

    if 'unpaid' in s:
        return 'INELIGIBLE_UNPAID', None

    if s.strip() == 'ineligible':
        return 'INELIGIBLE', None  # treat as RED, no date

    # Unrecognised — fail safe to worst case
    return 'INELIGIBLE_UNPAID', None


def ingest_positive_lmia(file_path: str, quarter: str):
    """
    Ingest the ESDC quarterly Positive LMIA Excel file.

    The government Excel has:
    - Row 0: Long title (merged cells)
    - Row 1: Actual column headers (Province/Territory, Program Stream, Employer, ...)
    - Row 2+: Data rows
    """
    print(f'Reading {file_path}...')
    df = pd.read_excel(file_path, header=None)

    # Row 1 (index 1) has the actual column headers; row 0 is the title
    df.columns = df.iloc[1]
    df = df.iloc[2:].reset_index(drop=True)

    # Normalise column names (strip whitespace)
    df.columns = [str(c).strip() if pd.notna(c) else '' for c in df.columns]

    print(f'Columns found: {df.columns.tolist()}')
    print(f'Processing {len(df)} rows...')

    records = []
    skipped = 0

    for _, row in df.iterrows():
        employer = str(row.get('Employer', '') or '').strip()
        if not employer or employer.lower() == 'nan':
            skipped += 1
            continue

        address = str(row.get('Address', '') or '').strip()

        # Parse city from address (first part before comma)
        city = ''
        if ',' in address:
            city = address.split(',')[0].strip()

        # Parse postal code from address
        # Format: "St. John's, NL A1A 0R7"
        postal_match = re.search(r'([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)', address)
        postal_code = postal_match.group(1).upper() if postal_match else ''

        # Split NOC code from occupation title
        # Raw format: "72600-Air pilots, flight engineers and flying instructors"
        raw_occupation = str(row.get('Occupation', '') or '').strip()
        noc_code = ''
        occupation_title = raw_occupation
        if '-' in raw_occupation:
            parts = raw_occupation.split('-', 1)
            if parts[0].strip().isdigit():
                noc_code = parts[0].strip()
                occupation_title = parts[1].strip()

        try:
            approved_lmias = int(float(row.get('Approved LMIAs', 0) or 0))
        except (ValueError, TypeError):
            approved_lmias = 0

        try:
            approved_positions = int(float(row.get('Approved Positions', 0) or 0))
        except (ValueError, TypeError):
            approved_positions = 0

        records.append({
            'province':            str(row.get('Province/Territory', '') or '').strip(),
            'program_stream':      str(row.get('Program Stream', '') or '').strip(),
            'employer_name':       employer,
            'employer_normalized': normalize_name(employer),
            'address':             address,
            'city':                city,
            'noc_code':            noc_code,
            'occupation_title':    occupation_title,
            'incorporate_status':  str(row.get('Incorporate Status', '') or '').strip(),
            'approved_lmias':      approved_lmias,
            'approved_positions':  approved_positions,
            'postal_code':         postal_code,
            'quarter':             quarter,
        })

    print(f'Skipped {skipped} empty rows. Ingesting {len(records)} employer records...')

    # Upsert in batches of 500
    for i in range(0, len(records), 500):
        batch = records[i:i + 500]
        supabase_client.table('positive_lmia').upsert(batch).execute()
        print(f'  {min(i + 500, len(records))}/{len(records)} records ingested...')

    print(f'Done. {len(records)} employers loaded for quarter {quarter}.')


def ingest_violators(file_path: str):
    """
    Ingest the non-compliant employers list.

    Handles both CSV and Excel. The scraper produces these column names:
      Business operating name | Business legal name | Address |
      Reason(s) | Date of final decision | Penalty | Status
    """
    print(f'Reading {file_path}...')
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    # Normalise column names to lowercase for safe lookup
    col_map = {c: c for c in df.columns}  # keep original names
    # Build case-insensitive lookup
    col_lower = {c.lower().strip(): c for c in df.columns}

    def get_col(df, *names):
        """Try multiple column name variants (case-insensitive)."""
        for name in names:
            if name in df.columns:
                return name
            if name.lower() in col_lower:
                return col_lower[name.lower()]
        return None

    op_name_col    = get_col(df, 'Business operating name', 'Business Operating Name')
    legal_name_col = get_col(df, 'Business legal name', 'Business Legal Name')
    address_col    = get_col(df, 'Address')
    reasons_col    = get_col(df, 'Reason(s)', 'Reasons', 'Reason')
    date_col       = get_col(df, 'Date of final decision', 'Date of Final Decision')
    penalty_col    = get_col(df, 'Penalty')
    status_col     = get_col(df, 'Status')

    print(f'Columns: {df.columns.tolist()}')
    print(f'Processing {len(df)} rows...')

    records = []
    skipped = 0

    for _, row in df.iterrows():
        op_name = str(row[op_name_col] if op_name_col else '').strip()
        if not op_name or op_name.lower() == 'nan':
            skipped += 1
            continue

        raw_status = str(row[status_col] if status_col else '').strip()
        compliance_status, ineligible_until = parse_compliance_status(raw_status)

        # Parse decision date
        raw_date = str(row[date_col] if date_col else '').strip()
        decision_date = None
        for fmt in ('%Y-%m-%d', '%B %d, %Y', '%B %d,%Y', '%d/%m/%Y'):
            try:
                decision_date = datetime.strptime(raw_date, fmt).date()
                break
            except ValueError:
                continue

        # Parse penalty field
        raw_penalty = str(row[penalty_col] if penalty_col else '').strip()
        penalty_amount = ''
        ban_duration = None
        dollar_match = re.search(r'(\$[\d,]+)', raw_penalty)
        if dollar_match:
            penalty_amount = dollar_match.group(1)
        ban_match = re.search(r'(\d+[\-\s]year ban)', raw_penalty, re.IGNORECASE)
        if ban_match:
            ban_duration = ban_match.group(1)

        records.append({
            'business_operating_name': op_name,
            'business_legal_name':     str(row[legal_name_col] if legal_name_col else '').strip(),
            'employer_normalized':     normalize_name(op_name),
            'address':                 str(row[address_col] if address_col else '').strip(),
            'province':                '',  # extracted from address if needed
            'reasons':                 str(row[reasons_col] if reasons_col else '').strip(),
            'decision_date':           str(decision_date) if decision_date else None,
            'penalty_raw':             raw_penalty,
            'penalty_amount':          penalty_amount,
            'ban_duration':            ban_duration,
            'status_raw':              raw_status,
            'compliance_status':       compliance_status,
            'ineligible_until_date':   str(ineligible_until) if ineligible_until else None,
        })

    print(f'Skipped {skipped} empty rows. Ingesting {len(records)} violator records...')

    for i in range(0, len(records), 500):
        batch = records[i:i + 500]
        supabase_client.table('violators').upsert(batch).execute()
        print(f'  {min(i + 500, len(records))}/{len(records)} records ingested...')

    print(f'Done. {len(records)} violator records loaded.')


def main():
    parser = argparse.ArgumentParser(description='LMIA Check data ingestion script')
    parser.add_argument('--file', required=True, help='Path to the Excel or CSV file')
    parser.add_argument('--quarter', help='Quarter string for positive LMIA (e.g. 2025-Q3)')
    parser.add_argument('--type', choices=['positive', 'violators'], default='positive',
                        help='Type of data to ingest (default: positive)')

    args = parser.parse_args()

    if args.type == 'violators':
        ingest_violators(args.file)
    else:
        if not args.quarter:
            sys.exit('ERROR: --quarter is required for positive LMIA ingestion (e.g. --quarter 2025-Q3)')
        ingest_positive_lmia(args.file, args.quarter)


if __name__ == '__main__':
    main()
