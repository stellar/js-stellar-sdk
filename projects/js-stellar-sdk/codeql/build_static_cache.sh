#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
PACK="$ROOT/projects/js-stellar-sdk/codeql/javascript"
CODEQL_ROOT="$ROOT/projects/js-stellar-sdk/codeql"
OUT="$CODEQL_ROOT/out"
DB="${CODEQL_DB:-/tmp/js-stellar-sdk-codeql-db}"
CACHE="$ROOT/ai-summary/static-codeql.sqlite"

command -v codeql >/dev/null 2>&1 || {
  echo "error: codeql CLI is not on PATH" >&2
  exit 127
}

mkdir -p "$OUT" "$ROOT/ai-summary"

codeql pack install "$PACK"
codeql query compile "$PACK"/*.ql

codeql database create "$DB" \
  --language=javascript-typescript \
  --source-root="$ROOT" \
  --build-mode=none \
  --overwrite

for query in entrypoints material_sinks routes guards; do
  codeql query run "$PACK/$query.ql" --database="$DB" --output="$OUT/$query.bqrs"
  codeql bqrs decode --format=csv --output="$OUT/$query.csv" "$OUT/$query.bqrs"
done

"$CODEQL_ROOT/export_static_facts.py" \
  --out "$CACHE" \
  --source-commit "$(git rev-parse HEAD)" \
  --entrypoints-csv "$OUT/entrypoints.csv" \
  --sinks-csv "$OUT/material_sinks.csv" \
  --routes-csv "$OUT/routes.csv" \
  --guards-csv "$OUT/guards.csv"

"$CODEQL_ROOT/harness/metrics.py" summary "$CACHE"