/* eslint-disable @typescript-eslint/no-explicit-any */
// Long-running XDR↔JSON parity monitor: pulls real XDR from Horizon and checks
// that the new class-XDR layer's SEP-51 JSON matches the canonical reference
// implementation — the Rust `stellar-xdr` crate compiled to WASM and published
// as `@stellar/stellar-xdr-json`. Companion to `xdr-roundtrip-monitor.ts`
// (which checks byte round-trips against the legacy js-xdr runtime); this one
// checks the JSON representation against the reference.
//
// For each XDR payload + its type, three properties are checked:
//   jsonEqual   our `Type.fromXdr(bytes).toJson()` deep-equals the reference's
//               `decode(type, b64)` (the headline parity check)
//   weReadRef   our `Type.fromJson(refJson).toXdr()` reproduces the input bytes
//               (we consume the reference's canonical JSON)
//   refReadsOurs  the reference `encode(type, ourJson)` reproduces the input
//               bytes (the reference consumes our JSON)
//
// Outcomes:
//   pass         all three hold
//   jsonMismatch decode JSON differs
//   readMismatch we can't reconstruct bytes from the reference JSON
//   encodeMismatch the reference can't reconstruct bytes from our JSON
//   ourError     our toJson threw (reference decoded fine)  ← regression
//   refError     reference decode threw (we decoded fine) — usually a protocol
//                version gap between the SDK and the pinned WASM build; warned,
//                not failed
//   bothError    neither could decode (suspect data) — warned
//
// Exits non-zero iff a real divergence was seen (jsonMismatch / readMismatch /
// encodeMismatch / ourError). Failing payloads are appended to FAIL_LOG as
// JSONL with both JSON renderings + the base64 for reproduction.
//
// Usage:
//   pnpm xdr:json-parity                          # backfill mainnet history
//   MODE=tail pnpm xdr:json-parity                # follow new ledgers/txs
//   MAX=5000 pnpm xdr:json-parity                 # stop after 5000 records
//
// Env (same as xdr-roundtrip-monitor, plus WASM_PATH):
//   HORIZON, MODE, SOURCES, MAX, PAGE_LIMIT, INCLUDE_FAILED, SLEEP_MS,
//   PROGRESS_EVERY, START_CURSOR
//   FAIL_LOG   default ./xdr-json-parity-failures.jsonl
//   WASM_PATH  override the @stellar/stellar-xdr-json .wasm location

import { Buffer } from "node:buffer";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

import init, {
  decode as refDecode,
  encode as refEncode,
} from "@stellar/stellar-xdr-json";

import {
  TransactionEnvelope,
  TransactionResult,
  TransactionMeta,
  OperationMeta,
  LedgerHeader,
} from "../src/xdr/index.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const HORIZON = process.env.HORIZON ?? "https://horizon.stellar.org";
const MODE = (process.env.MODE ?? "backfill") as "backfill" | "tail";
const SOURCES = (process.env.SOURCES ?? "transactions,ledgers")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const MAX = Number(process.env.MAX ?? 0);
const PAGE_LIMIT = Math.min(Number(process.env.PAGE_LIMIT ?? 200), 200);
const INCLUDE_FAILED = (process.env.INCLUDE_FAILED ?? "true") !== "false";
const SLEEP_MS = Number(process.env.SLEEP_MS ?? 2000);
const PROGRESS_EVERY = Number(process.env.PROGRESS_EVERY ?? 500);
const FAIL_LOG = resolve(
  process.env.FAIL_LOG ?? "./xdr-json-parity-failures.jsonl",
);
const START_CURSOR = process.env.START_CURSOR;
const ORDER: "asc" | "desc" = MODE === "tail" ? "asc" : "desc";

// ---------------------------------------------------------------------------
// Parity check
// ---------------------------------------------------------------------------
type Outcome =
  | "pass"
  | "jsonMismatch"
  | "readMismatch"
  | "encodeMismatch"
  | "ourError"
  | "refError"
  | "bothError";

// `changes` covers bare `LedgerEntryChanges` payloads (fee meta + fee-bump
// outer result-meta). `OperationMeta` is `struct { changes }`, wire-identical
// to a bare `LedgerEntryChanges`, and both this SDK and the reference decode
// the same bytes under that name — so their JSON shapes line up too.
const KINDS: Record<string, { newCtor: any; typeName: string }> = {
  envelope: { newCtor: TransactionEnvelope, typeName: "TransactionEnvelope" },
  result: { newCtor: TransactionResult, typeName: "TransactionResult" },
  txMeta: { newCtor: TransactionMeta, typeName: "TransactionMeta" },
  changes: { newCtor: OperationMeta, typeName: "OperationMeta" },
  ledgerHeader: { newCtor: LedgerHeader, typeName: "LedgerHeader" },
};

const FAIL_OUTCOMES: ReadonlySet<Outcome> = new Set([
  "jsonMismatch",
  "readMismatch",
  "encodeMismatch",
  "ourError",
]);

const stats = new Map<string, Record<Outcome, number>>();
let processed = 0;
let failCount = 0;
let stop = false;
let failLogReady = false;

function bump(kind: string, outcome: Outcome): void {
  let s = stats.get(kind);
  if (!s) {
    s = {
      pass: 0,
      jsonMismatch: 0,
      readMismatch: 0,
      encodeMismatch: 0,
      ourError: 0,
      refError: 0,
      bothError: 0,
    };
    stats.set(kind, s);
  }
  s[outcome] += 1;
}

function logFailure(detail: unknown): void {
  if (!failLogReady) {
    mkdirSync(dirname(FAIL_LOG), { recursive: true });
    failLogReady = true;
  }
  appendFileSync(FAIL_LOG, JSON.stringify(detail) + "\n");
}

// Canonical JSON string with recursively sorted object keys, so field-order
// differences don't read as mismatches (arrays stay ordered). Strings vs
// numbers stay distinct — that's a real representation difference worth
// flagging (e.g. a u64 rendered as a number instead of a SEP-51 string).
function canonical(v: any): string {
  return JSON.stringify(sortKeys(v));
}
function sortKeys(v: any): any {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    const out: Record<string, any> = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
    return out;
  }
  return v;
}

const hex = (b: Uint8Array): string => Buffer.from(b).toString("hex");

function checkParity(
  name: string,
  kind: string,
  b64: string | undefined,
): void {
  if (!b64) return; // absent field (e.g. failed-tx result_meta)
  const { newCtor, typeName } = KINDS[kind];
  const input = Buffer.from(b64, "base64");
  const inputHex = hex(input);

  // --- our SDK: XDR → JSON ---
  let ourErr: string | null = null;
  let ourJson: any;
  try {
    ourJson = newCtor.fromXdr(new Uint8Array(input)).toJson();
  } catch (e) {
    ourErr = (e as Error).message;
  }

  // --- reference (WASM): XDR → JSON ---
  let refErr: string | null = null;
  let refJson: any;
  try {
    refJson = JSON.parse(refDecode(typeName, b64));
  } catch (e) {
    refErr = (e as Error).message;
  }

  if (ourErr || refErr) {
    const outcome: Outcome =
      ourErr && refErr ? "bothError" : ourErr ? "ourError" : "refError";
    bump(kind, outcome);
    if (FAIL_OUTCOMES.has(outcome) || outcome === "bothError") {
      if (FAIL_OUTCOMES.has(outcome)) failCount += 1;
      logFailure({
        ts: new Date().toISOString(),
        outcome,
        kind,
        typeName,
        name,
        ourError: ourErr,
        refError: refErr,
        xdr: b64,
      });
      console.error(
        `✗ ${outcome.toUpperCase()} ${typeName} ${name}` +
          (ourErr ? ` | ours: ${ourErr}` : ` | ref: ${refErr}`),
      );
    }
    return;
  }

  // Both decoded — compare JSON and both reconstruction directions.
  const jsonEqual = canonical(ourJson) === canonical(refJson);

  let weReadRef = false;
  try {
    weReadRef = hex(newCtor.fromJson(refJson).toXdr()) === inputHex;
  } catch {
    weReadRef = false;
  }

  let refReadsOurs = false;
  try {
    refReadsOurs =
      hex(
        Buffer.from(refEncode(typeName, JSON.stringify(ourJson)), "base64"),
      ) === inputHex;
  } catch {
    refReadsOurs = false;
  }

  const outcome: Outcome = !jsonEqual
    ? "jsonMismatch"
    : !weReadRef
      ? "readMismatch"
      : !refReadsOurs
        ? "encodeMismatch"
        : "pass";
  bump(kind, outcome);

  if (outcome !== "pass") {
    failCount += 1;
    logFailure({
      ts: new Date().toISOString(),
      outcome,
      kind,
      typeName,
      name,
      ours: ourJson,
      ref: refJson,
      xdr: b64,
    });
    const note =
      outcome === "jsonMismatch"
        ? ` | ours=${canonical(ourJson).slice(0, 200)} ref=${canonical(refJson).slice(0, 200)}`
        : "";
    console.error(`✗ ${outcome.toUpperCase()} ${typeName} ${name}${note}`);
  }
}

function countRecord(): void {
  processed += 1;
  if (PROGRESS_EVERY > 0 && processed % PROGRESS_EVERY === 0) printProgress();
  if (MAX > 0 && processed >= MAX) stop = true;
}

function processTransaction(r: any): void {
  checkParity(`tx ${r.hash} envelope`, "envelope", r.envelope_xdr);
  checkParity(`tx ${r.hash} result`, "result", r.result_xdr);
  // fee-bump (envelopeTypeTxFeeBump, discriminant 5) result_meta is the bare
  // outer fee-processing changes; otherwise it's a full TransactionMeta.
  const isFeeBump = Buffer.from(r.envelope_xdr, "base64").readUInt32BE(0) === 5;
  checkParity(
    `tx ${r.hash} result_meta`,
    isFeeBump ? "changes" : "txMeta",
    r.result_meta_xdr,
  );
  if (r.fee_meta_xdr)
    checkParity(`tx ${r.hash} fee_meta`, "changes", r.fee_meta_xdr);
  countRecord();
}

function processLedger(r: any): void {
  checkParity(`ledger ${r.sequence}`, "ledgerHeader", r.header_xdr);
  countRecord();
}

// ---------------------------------------------------------------------------
// Fetching (plain Horizon REST + HAL paging via `fetch`)
// ---------------------------------------------------------------------------
const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

async function getJson(url: string): Promise<any> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} → ${r.status} ${r.statusText}`);
  return r.json();
}

const SOURCE_SPEC: Record<
  string,
  { path: string; params: Record<string, string>; process: (r: any) => void }
> = {
  transactions: {
    path: "/transactions",
    params: {
      order: ORDER,
      limit: String(PAGE_LIMIT),
      include_failed: String(INCLUDE_FAILED),
    },
    process: processTransaction,
  },
  ledgers: {
    path: "/ledgers",
    params: { order: ORDER, limit: String(PAGE_LIMIT) },
    process: processLedger,
  },
};

async function runSource(name: string): Promise<void> {
  const spec = SOURCE_SPEC[name];
  if (!spec) {
    console.error(`unknown source "${name}" (expected transactions|ledgers)`);
    return;
  }
  const params = new URLSearchParams(spec.params);
  const cursor = START_CURSOR ?? (MODE === "tail" ? "now" : undefined);
  if (cursor) params.set("cursor", cursor);
  let url: string | undefined = `${HORIZON}${spec.path}?${params}`;

  while (!stop && url) {
    let json: any;
    try {
      json = await getJson(url);
    } catch (e) {
      console.error(
        `  (${name} fetch error: ${(e as Error).message}; retry in ${SLEEP_MS}ms)`,
      );
      await sleep(SLEEP_MS);
      continue;
    }
    const records: any[] = json._embedded?.records ?? [];
    const next: string | undefined = json._links?.next?.href;
    if (records.length === 0) {
      if (ORDER === "asc" && next) {
        url = next;
        await sleep(SLEEP_MS);
        continue;
      }
      return;
    }
    for (const rec of records) {
      spec.process(rec);
      if (stop) return;
    }
    url = next;
  }
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
const OUTCOME_KEYS: Outcome[] = [
  "pass",
  "jsonMismatch",
  "readMismatch",
  "encodeMismatch",
  "ourError",
  "refError",
  "bothError",
];

function aggregate(): Record<Outcome, number> {
  const t = Object.fromEntries(OUTCOME_KEYS.map((k) => [k, 0])) as Record<
    Outcome,
    number
  >;
  for (const s of stats.values()) for (const k of OUTCOME_KEYS) t[k] += s[k];
  return t;
}

function fmt(s: Record<Outcome, number>): string {
  return OUTCOME_KEYS.filter((k) => s[k] > 0)
    .map((k) => `${k}=${s[k]}`)
    .join(" ");
}

function printProgress(): void {
  console.log(`… ${processed} records | ${fmt(aggregate())}`);
}

function printSummary(): void {
  console.log(`\n=== summary (${processed} records) ===`);
  for (const [kind, s] of stats) console.log(`  ${kind.padEnd(14)} ${fmt(s)}`);
  const t = aggregate();
  console.log(`  ${"TOTAL".padEnd(14)} ${fmt(t)}`);
  const divergent =
    t.jsonMismatch + t.readMismatch + t.encodeMismatch + t.ourError;
  console.log(
    divergent > 0
      ? `\n✗ ${divergent} parity divergence(s) — details in ${FAIL_LOG}`
      : `\n✓ JSON parity with @stellar/stellar-xdr-json` +
          (t.refError
            ? ` (${t.refError} refError — likely SDK/WASM protocol gap)`
            : ""),
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function loadWasm(): Promise<void> {
  const require = createRequire(import.meta.url);
  const wasmPath =
    process.env.WASM_PATH ??
    require.resolve("@stellar/stellar-xdr-json/stellar_xdr_json_bg.wasm");
  await init(readFileSync(wasmPath));
}

async function main(): Promise<void> {
  await loadWasm();
  console.log(
    `xdr-json-parity-monitor → ${HORIZON} mode=${MODE} sources=${SOURCES.join(
      ",",
    )} max=${MAX || "∞"}`,
  );
  process.on("SIGINT", () => {
    if (stop) process.exit(130);
    console.log("\n(stopping after in-flight pages… Ctrl-C again to force)");
    stop = true;
  });

  const tasks: Promise<void>[] = [];
  if (SOURCES.includes("transactions")) tasks.push(runSource("transactions"));
  if (SOURCES.includes("ledgers")) tasks.push(runSource("ledgers"));
  await Promise.all(tasks);

  printSummary();
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
