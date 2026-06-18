#!/usr/bin/env python3
"""Small metrics harness for the JS SDK Gesserit static cache."""

from __future__ import annotations

import argparse
import sqlite3
import sys
from pathlib import Path


def connect(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


def rows(conn: sqlite3.Connection, query: str) -> list[sqlite3.Row]:
    return conn.execute(query).fetchall()


def summary(path: Path) -> int:
    if not path.exists():
        print(f"missing cache: {path}", file=sys.stderr)
        return 2
    conn = connect(path)
    try:
        total = conn.execute("SELECT COUNT(*) FROM static_route").fetchone()[0]
        print(f"routes: {total}")
        print("\nby subsystem:")
        for row in rows(conn, "SELECT subsystem, COUNT(*) AS n FROM static_route GROUP BY subsystem ORDER BY n DESC, subsystem"):
            print(f"  {row['subsystem']}: {row['n']}")
        print("\nby sink_role:")
        for row in rows(conn, "SELECT sink_role, COUNT(*) AS n FROM static_route GROUP BY sink_role ORDER BY n DESC, sink_role"):
            print(f"  {row['sink_role']}: {row['n']}")
        print("\nby impact_class:")
        for row in rows(conn, "SELECT impact_class, COUNT(*) AS n FROM static_route GROUP BY impact_class ORDER BY n DESC, impact_class"):
            print(f"  {row['impact_class']}: {row['n']}")
        trivial = conn.execute(
            """
            SELECT COUNT(*) FROM static_route
            WHERE lower(sink_symbol) IN ('get', 'set', 'toString', 'valueOf')
            """
        ).fetchone()[0]
        fraction = (100.0 * trivial / total) if total else 0.0
        print(f"\ntrivial sink fraction: {fraction:.1f}%")
    finally:
        conn.close()
    return 0 if total > 0 else 1


def route_ids(path: Path) -> set[str]:
    conn = connect(path)
    try:
        return {row[0] for row in conn.execute("SELECT route_id FROM static_route")}
    finally:
        conn.close()


def determinism(a: Path, b: Path) -> int:
    left = route_ids(a)
    right = route_ids(b)
    missing = sorted(left - right)
    added = sorted(right - left)
    print(f"a routes: {len(left)}")
    print(f"b routes: {len(right)}")
    print(f"missing_from_b: {len(missing)}")
    print(f"added_in_b: {len(added)}")
    for route_id in missing[:20]:
        print(f"  missing {route_id}")
    for route_id in added[:20]:
        print(f"  added {route_id}")
    return 0 if not missing and not added else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("summary")
    s.add_argument("cache", type=Path)
    d = sub.add_parser("determinism")
    d.add_argument("a", type=Path)
    d.add_argument("b", type=Path)
    args = parser.parse_args()
    if args.cmd == "summary":
        return summary(args.cache)
    return determinism(args.a, args.b)


if __name__ == "__main__":
    raise SystemExit(main())