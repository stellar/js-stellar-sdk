/** eslint-disable @typescript-eslint/no-explicit-any */
// Long-running round-trip monitor: pulls real XDR from Horizon and checks that
// both the new class-XDR layer and the legacy @stellar/js-xdr runtime decode →
// re-encode it losslessly. Same property `test/unit/xdr/corpus_round_trip.test.ts`
// checks, but against a live, effectively unbounded stream of mainnet data
// instead of a checked-in fixture sample.
//
// For each XDR payload we record one of four outcomes:
//   pass      both SDKs decode → re-encode to the exact input bytes
//   fail      legacy round-trips but the new SDK does NOT  ← the regression signal
//   newAhead  the new SDK round-trips but legacy does not (e.g. a newer protocol
//             shape the pinned legacy fixture predates) — informational
//   bothFail  neither round-trips (suspect data / unsupported by either) — warn
//
// The run exits non-zero iff any `fail` was seen. Failing payloads (fail +
// bothFail) are appended to FAIL_LOG as JSONL with their base64 so they can be
// reproduced or promoted into the corpus fixture.
//
// Usage:
//   pnpm xdr:roundtrip                              # backfill mainnet history (both sources)
//   MODE=tail pnpm xdr:roundtrip                    # follow new ledgers/txs as they close
//   MAX=5000 pnpm xdr:roundtrip                     # stop after 5000 records
//   SOURCES=transactions pnpm xdr:roundtrip         # transactions only
//   HORIZON=https://horizon-testnet.stellar.org pnpm xdr:roundtrip
//
// Env:
//   HORIZON         Horizon base URL (default https://horizon.stellar.org)
//   MODE            "backfill" (desc, walk history) | "tail" (poll newest). Default backfill.
//   SOURCES         csv of "transactions,ledgers". Default both.
//   MAX             stop after N records (0 = run until Ctrl-C). Default 0.
//   PAGE_LIMIT      records per Horizon page (default 200, max 200).
//   INCLUDE_FAILED  include failed txs for wider coverage (default "true").
//   SLEEP_MS        poll/backoff delay in ms (default 2000).
//   PROGRESS_EVERY  log a progress line every N records (default 500).
//   FAIL_LOG        append failing payloads here as JSONL (default ./xdr-roundtrip-failures.jsonl).
//   START_CURSOR    resume paging from this Horizon cursor (paging_token).

import { Buffer } from "node:buffer";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  TransactionEnvelope,
  TransactionResult,
  TransactionMeta,
  OperationMeta,
  LedgerHeader,
} from "../src/xdr/index.js";

import legacyTypes from "../test/fixtures/legacy-xdr/curr_generated.js";
const legacy = legacyTypes as any;

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
  process.env.FAIL_LOG ?? "./xdr-roundtrip-failures.jsonl",
);
const START_CURSOR = process.env.START_CURSOR;
const ORDER: "asc" | "desc" = MODE === "tail" ? "asc" : "desc";

// ---------------------------------------------------------------------------
// Round-trip
// ---------------------------------------------------------------------------
type Outcome = "pass" | "fail" | "newAhead" | "bothFail";

// Each "kind" pairs the new class-XDR type with its legacy counterpart.
// `changes` covers any bare `LedgerEntryChanges` payload (fee meta, and the
// fee-bump outer result-meta): `OperationMeta` is `struct { changes }`, which
// is wire-identical to a bare `LedgerEntryChanges`, so it decodes both.
const KINDS: Record<string, { newCtor: any; legacyCtor: any }> = {
  envelope: {
    newCtor: TransactionEnvelope,
    legacyCtor: legacy.TransactionEnvelope,
  },
  result: { newCtor: TransactionResult, legacyCtor: legacy.TransactionResult },
  txMeta: { newCtor: TransactionMeta, legacyCtor: legacy.TransactionMeta },
  changes: { newCtor: OperationMeta, legacyCtor: legacy.OperationMeta },
  ledgerHeader: { newCtor: LedgerHeader, legacyCtor: legacy.LedgerHeader },
};

const stats = new Map<string, Record<Outcome, number>>();
let processed = 0;
let failCount = 0;
let stop = false;
let failLogReady = false;

function bump(kind: string, outcome: Outcome): void {
  let s = stats.get(kind);
  if (!s) {
    s = { pass: 0, fail: 0, newAhead: 0, bothFail: 0 };
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

function roundtrip(name: string, kind: string, b64: string | undefined): void {
  // Some fields are absent on certain records (e.g. failed transactions carry
  // no `result_meta_xdr`); nothing to check.
  if (!b64) return;
  const { newCtor, legacyCtor } = KINDS[kind];
  const input = Buffer.from(b64, "base64");
  const inputHex = input.toString("hex");

  let newErr: string | null = null;
  let newHex: string | null = null;
  try {
    newHex = Buffer.from(
      newCtor.fromXdr(new Uint8Array(input)).toXdr(),
    ).toString("hex");
  } catch (e) {
    newErr = (e as Error).message;
  }
  const newOk = newErr === null && newHex === inputHex;

  let lgErr: string | null = null;
  let lgHex: string | null = null;
  try {
    lgHex = legacyCtor.fromXDR(input).toXDR().toString("hex");
  } catch (e) {
    lgErr = (e as Error).message;
  }
  const legacyOk = lgErr === null && lgHex === inputHex;

  const outcome: Outcome =
    newOk && legacyOk
      ? "pass"
      : !newOk && legacyOk
        ? "fail"
        : newOk && !legacyOk
          ? "newAhead"
          : "bothFail";
  bump(kind, outcome);

  if (outcome === "fail" || outcome === "bothFail") {
    if (outcome === "fail") failCount += 1;
    const newMismatch = newErr === null && newHex !== inputHex;
    const legacyMismatch = lgErr === null && lgHex !== inputHex;
    logFailure({
      ts: new Date().toISOString(),
      outcome,
      kind,
      name,
      newError: newErr,
      newMismatch,
      legacyError: lgErr,
      legacyMismatch,
      xdr: b64,
    });
    const newNote = newErr
      ? ` | new: ${newErr}`
      : newMismatch
        ? ` | new: re-encode mismatch`
        : "";
    const lgNote = lgErr
      ? ` | legacy: ${lgErr}`
      : legacyMismatch
        ? ` | legacy: re-encode mismatch`
        : "";
    console.error(
      `✗ ${outcome.toUpperCase()} ${kind} ${name}${newNote}${lgNote}`,
    );
  }
}

function countRecord(): void {
  processed += 1;
  if (PROGRESS_EVERY > 0 && processed % PROGRESS_EVERY === 0) printProgress();
  if (MAX > 0 && processed >= MAX) stop = true;
}

function processTransaction(r: any): void {
  roundtrip(`tx ${r.hash} envelope`, "envelope", r.envelope_xdr);
  roundtrip(`tx ${r.hash} result`, "result", r.result_xdr);
  // `result_meta_xdr` is a `TransactionMeta`, except for fee-bump envelopes
  // (envelopeTypeTxFeeBump, discriminant 5) where it carries only the bare
  // outer fee-processing changes — wire-equivalent to `OperationMeta`.
  const isFeeBump = Buffer.from(r.envelope_xdr, "base64").readUInt32BE(0) === 5;
  roundtrip(
    `tx ${r.hash} result_meta`,
    isFeeBump ? "changes" : "txMeta",
    r.result_meta_xdr,
  );
  if (r.fee_meta_xdr) {
    roundtrip(`tx ${r.hash} fee_meta`, "changes", r.fee_meta_xdr);
  }
  countRecord();
}

function processLedger(r: any): void {
  roundtrip(`ledger ${r.sequence}`, "ledgerHeader", r.header_xdr);
  countRecord();
}

// ---------------------------------------------------------------------------
// Fetching (plain Horizon REST + HAL paging via `fetch`)
//
// We use `fetch` rather than the library's `Horizon.Server` client here:
// the client pulls in `src/base/*`, which still imports the legacy
// `@stellar/js-xdr` CJS package whose named exports don't resolve under plain
// node/tsx ESM (vitest papers over this with its own CJS interop). Paging just
// follows Horizon's `_links.next.href` HAL links.
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

// Walk a Horizon collection page by page. Backfill (desc) stops at the start
// of history; tail (asc) sleeps when caught up and keeps polling for new
// records.
async function runSource(name: string): Promise<void> {
  const spec = SOURCE_SPEC[name];
  if (!spec) {
    console.error(`unknown source "${name}" (expected transactions|ledgers)`);
    return;
  }
  const params = new URLSearchParams(spec.params);
  // Tail starts at the live tip ("now"); backfill starts at the newest record.
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
        url = next; // tail: advance cursor, wait for the next ledger to close
        await sleep(SLEEP_MS);
        continue;
      }
      return; // backfill: reached the start of history
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
function aggregate(): Record<Outcome, number> {
  const t: Record<Outcome, number> = {
    pass: 0,
    fail: 0,
    newAhead: 0,
    bothFail: 0,
  };
  for (const s of stats.values()) {
    t.pass += s.pass;
    t.fail += s.fail;
    t.newAhead += s.newAhead;
    t.bothFail += s.bothFail;
  }
  return t;
}

function printProgress(): void {
  const t = aggregate();
  console.log(
    `… ${processed} records | pass=${t.pass} fail=${t.fail} newAhead=${t.newAhead} bothFail=${t.bothFail}`,
  );
}

function printSummary(): void {
  console.log(`\n=== summary (${processed} records) ===`);
  for (const [kind, s] of stats) {
    console.log(
      `  ${kind.padEnd(14)} pass=${s.pass} fail=${s.fail} newAhead=${s.newAhead} bothFail=${s.bothFail}`,
    );
  }
  const t = aggregate();
  console.log(
    `  ${"TOTAL".padEnd(14)} pass=${t.pass} fail=${t.fail} newAhead=${t.newAhead} bothFail=${t.bothFail}`,
  );
  console.log(
    t.fail > 0
      ? `\n✗ ${t.fail} new-SDK regression(s) — payloads in ${FAIL_LOG}`
      : `\n✓ no new-SDK regressions`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log(
    `xdr-roundtrip-monitor → ${HORIZON} mode=${MODE} sources=${SOURCES.join(
      ",",
    )} max=${MAX || "∞"}`,
  );
  process.on("SIGINT", () => {
    if (stop) process.exit(130); // second Ctrl-C: force quit
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
