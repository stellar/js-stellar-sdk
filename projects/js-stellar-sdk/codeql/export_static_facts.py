#!/usr/bin/env python3
"""Export decoded JS SDK CodeQL CSVs into Gesserit v2 static facts."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sqlite3
from pathlib import Path


SUBSYSTEM_BY_PREFIX: tuple[tuple[str, str], ...] = (
    ("src/rpc/", "rpc"),
    ("src/horizon/", "horizon"),
    ("src/contract/", "contract"),
    ("src/bindings/", "bindings"),
    ("src/webauth/", "webauth"),
    ("src/federation/", "federation"),
    ("src/stellartoml/", "stellartoml"),
    ("src/http-client/", "http-client"),
    ("src/cli/", "cli"),
    ("src/friendbot/", "friendbot"),
    ("src/errors/", "errors"),
)

IMPACT_BY_SINK_ROLE = {
    "network_request": "network_integrity",
    "transaction_submission": "transaction_integrity",
    "transaction_serialization": "transaction_integrity",
    "transaction_signing": "authorization_integrity",
    "xdr_decode": "parse_integrity",
    "xdr_encode": "transaction_integrity",
    "json_deserialization": "parse_integrity",
    "toml_deserialization": "trust_config_integrity",
    "contract_wasm_parse": "contract_interface_integrity",
    "contract_spec_conversion": "contract_interface_integrity",
    "code_generation": "generated_code_integrity",
    "buffer_decode": "encoding_integrity",
    "bounded_response_read": "resource_exhaustion",
    "random_challenge": "authentication_integrity",
    "https_policy_gate": "network_integrity",
}


def subsystem_for(symbol: str, file: str, sink_role: str = "") -> str:
    normalized = file.replace("\\", "/")
    for prefix, subsystem in SUBSYSTEM_BY_PREFIX:
        if normalized.startswith(prefix):
            return subsystem
    if normalized in {"src/utils.ts", "src/config.ts", "src/index.ts", "src/browser.ts"}:
        return "core-utils"
    if normalized.startswith("bin/"):
        return "cli"
    return "core-utils"


def impact_for(sink_role: str) -> str:
    return IMPACT_BY_SINK_ROLE.get(sink_role, "sdk_integrity")


def route_id_for(
    route_kind: str,
    subsystem: str,
    root_symbol: str,
    root_file: str,
    sink_symbol: str,
    sink_role: str,
) -> str:
    stable = "|".join(
        ["typescript", route_kind, subsystem, root_symbol, root_file, sink_symbol, sink_role]
    )
    return "js-sdk-" + hashlib.sha256(stable.encode("utf-8")).hexdigest()[:24]


def is_header(row: list[str]) -> bool:
    lowered = [cell.strip().lower() for cell in row]
    header_cells = {
        "kind",
        "col0",
        "col1",
        "col2",
        "col3",
        "col4",
        "col5",
        "col6",
        "col7",
        "col8",
        "sinkrole",
        "impactclass",
        "trustboundary",
        "inputshape",
    }
    return bool(lowered) and all(cell in header_cells for cell in lowered)


def rows(path: Path | None, expected: int) -> list[list[str]]:
    if path is None or not path.exists():
        return []
    parsed: list[list[str]] = []
    with path.open(newline="") as handle:
        reader = csv.reader(handle)
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            if is_header(row):
                continue
            if len(row) < expected:
                continue
            parsed.append([cell.strip() for cell in row[:expected]])
    return parsed


SCHEMA = """
CREATE TABLE IF NOT EXISTS static_symbol (
  role TEXT NOT NULL,
  kind TEXT NOT NULL,
  subsystem TEXT NOT NULL,
  symbol TEXT NOT NULL,
  file TEXT NOT NULL,
  line INTEGER NOT NULL,
  trust_boundary TEXT NOT NULL,
  input_shape TEXT NOT NULL,
  source_fingerprint TEXT NOT NULL,
  UNIQUE(role, kind, subsystem, symbol, file, line)
);

CREATE TABLE IF NOT EXISTS static_sink (
  kind TEXT NOT NULL,
  subsystem TEXT NOT NULL,
  symbol TEXT NOT NULL,
  file TEXT NOT NULL,
  line INTEGER NOT NULL,
  sink_role TEXT NOT NULL,
  impact_class TEXT NOT NULL,
  source_fingerprint TEXT NOT NULL,
  UNIQUE(kind, subsystem, symbol, file, line, sink_role)
);

CREATE TABLE IF NOT EXISTS static_call_edge (
  kind TEXT NOT NULL,
  caller_symbol TEXT NOT NULL,
  caller_file TEXT NOT NULL,
  caller_line INTEGER NOT NULL,
  callee_symbol TEXT NOT NULL,
  callee_file TEXT NOT NULL,
  callee_line INTEGER NOT NULL,
  call_file TEXT NOT NULL,
  call_line INTEGER NOT NULL,
  source_fingerprint TEXT NOT NULL,
  UNIQUE(kind, caller_symbol, caller_file, caller_line, callee_symbol, call_file, call_line)
);

CREATE TABLE IF NOT EXISTS static_route (
  route_id TEXT PRIMARY KEY,
  language TEXT NOT NULL,
  route_kind TEXT NOT NULL,
  subsystem TEXT NOT NULL,
  root_symbol TEXT NOT NULL,
  root_file TEXT NOT NULL,
  path_symbols_json TEXT NOT NULL,
  path_locations_json TEXT NOT NULL,
  sink_symbol TEXT NOT NULL,
  sink_role TEXT NOT NULL,
  impact_class TEXT NOT NULL,
  route_family TEXT NOT NULL,
  source_fingerprint TEXT NOT NULL,
  language_segments_json TEXT NOT NULL,
  bridge_edges_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS static_guard (
  guard_kind TEXT NOT NULL,
  caller_symbol TEXT NOT NULL,
  guard_symbol TEXT NOT NULL,
  file TEXT NOT NULL,
  line INTEGER NOT NULL,
  source_fingerprint TEXT NOT NULL,
  UNIQUE(guard_kind, caller_symbol, guard_symbol, file, line)
);

CREATE INDEX IF NOT EXISTS idx_static_route_subsystem ON static_route(subsystem);
CREATE INDEX IF NOT EXISTS idx_static_route_sink_role ON static_route(sink_role);
CREATE INDEX IF NOT EXISTS idx_static_route_impact ON static_route(impact_class);
"""


def as_int(value: str) -> int:
    try:
        return int(value)
    except ValueError:
        return 0


def export(args: argparse.Namespace) -> None:
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(out.suffix + ".tmp")
    if tmp.exists():
        tmp.unlink()

    conn = sqlite3.connect(tmp)
    try:
        conn.executescript(SCHEMA)

        for kind, subsystem, symbol, file, line, trust_boundary, input_shape in rows(
            args.entrypoints_csv, 7
        ):
            conn.execute(
                """
                INSERT OR IGNORE INTO static_symbol
                (role, kind, subsystem, symbol, file, line, trust_boundary, input_shape, source_fingerprint)
                VALUES ('entrypoint', ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    kind,
                    subsystem or subsystem_for(symbol, file),
                    symbol,
                    file,
                    as_int(line),
                    trust_boundary,
                    input_shape,
                    args.source_commit,
                ),
            )

        for kind, subsystem, symbol, file, line, sink_role, impact_class in rows(
            args.sinks_csv, 7
        ):
            role = sink_role or "unknown"
            conn.execute(
                """
                INSERT OR IGNORE INTO static_sink
                (kind, subsystem, symbol, file, line, sink_role, impact_class, source_fingerprint)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    kind,
                    subsystem or subsystem_for(symbol, file, role),
                    symbol,
                    file,
                    as_int(line),
                    role,
                    impact_class or impact_for(role),
                    args.source_commit,
                ),
            )

        for (
            kind,
            caller,
            caller_file,
            caller_line,
            callee,
            callee_file,
            callee_line,
            call_file,
            call_line,
            sink_role,
        ) in rows(args.routes_csv, 10):
            role = sink_role or "unknown"
            subsystem = subsystem_for(caller, caller_file, role)
            impact_class = impact_for(role)
            conn.execute(
                """
                INSERT OR IGNORE INTO static_call_edge
                (kind, caller_symbol, caller_file, caller_line, callee_symbol, callee_file,
                 callee_line, call_file, call_line, source_fingerprint)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    kind,
                    caller,
                    caller_file,
                    as_int(caller_line),
                    callee,
                    callee_file,
                    as_int(callee_line),
                    call_file,
                    as_int(call_line),
                    args.source_commit,
                ),
            )
            route_id = route_id_for(kind, subsystem, caller, caller_file, callee, role)
            conn.execute(
                """
                INSERT OR IGNORE INTO static_route
                (route_id, language, route_kind, subsystem, root_symbol, root_file,
                 path_symbols_json, path_locations_json, sink_symbol, sink_role,
                 impact_class, route_family, source_fingerprint,
                 language_segments_json, bridge_edges_json)
                VALUES (?, 'typescript', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    route_id,
                    kind,
                    subsystem,
                    caller,
                    caller_file,
                    json.dumps([caller, callee]),
                    json.dumps([f"{caller_file}:{caller_line}", f"{call_file}:{call_line}"]),
                    callee,
                    role,
                    impact_class,
                    role,
                    args.source_commit,
                    json.dumps(["typescript"]),
                    json.dumps([]),
                ),
            )

        for guard_kind, caller, guard_symbol, file, line in rows(args.guards_csv, 5):
            conn.execute(
                """
                INSERT OR IGNORE INTO static_guard
                (guard_kind, caller_symbol, guard_symbol, file, line, source_fingerprint)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (guard_kind, caller, guard_symbol, file, as_int(line), args.source_commit),
            )

        conn.commit()
    finally:
        conn.close()
    tmp.replace(out)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--source-commit", required=True)
    parser.add_argument("--entrypoints-csv", type=Path)
    parser.add_argument("--sinks-csv", type=Path)
    parser.add_argument("--routes-csv", type=Path)
    parser.add_argument("--guards-csv", type=Path)
    return parser.parse_args()


if __name__ == "__main__":
    export(parse_args())