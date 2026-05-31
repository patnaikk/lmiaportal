#!/usr/bin/env python3
"""
One-time backfill: populate violators.province from violators.address.
======================================================================
The `violators` table was ingested with an empty `province` column, but
the 2-letter province/territory code is present inside `address`, e.g.:
    "7480 Broadway\nBurnaby, BC\nV5A 1S4" -> "BC"

This script reads every violator row, parses the province out of the
address (using the same parse_province logic now used at ingest time),
and writes it back. Rows whose address is missing/malformed are left with
province = NULL and logged.

Usage:
  python scripts/backfill_province.py            # apply the backfill
  python scripts/backfill_province.py --dry-run  # report only, no writes

Requirements:
  pip install supabase python-dotenv
"""

import argparse
from collections import Counter

# Reuse the shared Supabase client and parser from ingest.py.
from ingest import supabase_client, parse_province


def fetch_all_violators():
    """Page through the full violators table (Supabase caps each request)."""
    rows = []
    page_size = 1000
    start = 0
    while True:
        resp = (
            supabase_client.table('violators')
            .select('id, address, province')
            .range(start, start + page_size - 1)
            .execute()
        )
        batch = resp.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
    return rows


def backfill(dry_run: bool):
    print('Fetching all violator rows...')
    rows = fetch_all_violators()
    print(f'Fetched {len(rows)} rows.\n')

    updates = []          # (id, province)
    unparseable = []      # rows we could not parse
    dist = Counter()

    for row in rows:
        province = parse_province(row.get('address') or '')
        if province is None:
            unparseable.append(row)
            dist['NULL'] += 1
            continue
        dist[province] += 1
        # Only write if it actually changes.
        if (row.get('province') or '').strip().upper() != province:
            updates.append((row['id'], province))

    print('Parsed province distribution:')
    for code, count in sorted(dist.items(), key=lambda kv: (-kv[1], kv[0])):
        print(f'  {code:>5}: {count}')
    print()

    if unparseable:
        print(f'{len(unparseable)} rows could not be parsed (left NULL):')
        for row in unparseable:
            addr = (row.get('address') or '').replace('\n', ' / ').strip()
            print(f'  id={row["id"]}  address={addr!r}')
        print()

    print(f'{len(updates)} rows need updating.')
    if dry_run:
        print('Dry run — no writes performed.')
        return

    for n, (row_id, province) in enumerate(updates, 1):
        supabase_client.table('violators').update(
            {'province': province}
        ).eq('id', row_id).execute()
        if n % 200 == 0 or n == len(updates):
            print(f'  {n}/{len(updates)} updated...')

    print('\nBackfill complete. Re-querying province distribution from DB...\n')
    verify()


def verify():
    """Re-query the live table and print the province distribution."""
    rows = fetch_all_violators()
    dist = Counter()
    for row in rows:
        code = (row.get('province') or '').strip().upper() or 'NULL/empty'
        dist[code] += 1
    total = sum(dist.values())
    print(f'Province distribution in DB ({total} rows):')
    for code, count in sorted(dist.items(), key=lambda kv: (-kv[1], kv[0])):
        print(f'  {code:>10}: {count}')


def main():
    parser = argparse.ArgumentParser(description='Backfill violators.province from address')
    parser.add_argument('--dry-run', action='store_true',
                        help='Report what would change without writing')
    parser.add_argument('--verify-only', action='store_true',
                        help='Just print the current DB province distribution')
    args = parser.parse_args()

    if args.verify_only:
        verify()
    else:
        backfill(args.dry_run)


if __name__ == '__main__':
    main()
