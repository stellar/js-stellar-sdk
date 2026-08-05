// One-shot fetcher that populates `test/fixtures/horizon-corpus/` with real
// envelope/result/fee-meta/ledger XDR captured from Horizon mainnet.
//
// Usage:
//   pnpm tsx scripts/refresh-horizon-corpus.ts
//   HORIZON=... COUNT=100 pnpm tsx scripts/refresh-horizon-corpus.ts
//
// Refresh quarterly or when a new Stellar protocol version ships. The
// resulting JSON files are checked into the repo and consumed by
// `test/unit/xdr/corpus_round_trip.test.ts` — that test asserts every
// fixture round-trips losslessly through both the new and legacy XDR
// runtimes, so any encoding regression that affects shapes the network
// actually produces will fail loudly.
//
// We pull from two endpoints to hit a broad surface:
//   - /transactions          → TransactionEnvelope (covers ops, memos,
//                              signers), TransactionResult, and OperationMeta
//                              via `fee_meta_xdr`
//   - /ledgers               → LedgerHeader (covers nested ledger entry types)
//
// Note on transaction meta: SDF removed `result_meta_xdr` from the hosted
// Horizon API and points callers at Stellar RPC instead, so there is no
// `TransactionMeta` here. That coverage lives in the RPC corpus — see
// `scripts/refresh-rpc-corpus.ts`. Don't try to reintroduce it from Horizon.
//
// We don't decode the bytes here — just snapshot the on-wire form. The
// test does the decode/re-encode validation.
//
// Coverage note: at any given moment mainnet traffic skews heavily toward
// one envelope kind (often fee-bump). For best coverage when refreshing,
// either sample a larger range, or hand-pick a mix of `envelopeTypeTx`,
// `envelopeTypeTxV0`, and `envelopeTypeTxFeeBump` records by querying
// historical ranges that included Soroban contract calls, classic
// payments, and fee-bumped batches. The run prints the spread it got.
import { resolve } from "node:path";

import {
  readCount,
  requireNumber,
  requireString,
  reportCount,
  reportEnvelopeSpread,
  writeCorpus,
} from "./corpus-fixtures.js";

const HORIZON = process.env.HORIZON ?? "https://horizon.stellar.org";
const OUT_DIR = resolve(import.meta.dirname, "../test/fixtures/horizon-corpus");
const COUNT = readCount(process.env.COUNT, 50);

// Horizon caps a single page at 200 records.
const PAGE_LIMIT = Math.min(COUNT, 200);

interface HorizonPage {
  _embedded?: { records?: Array<Record<string, unknown>> };
}

async function getJson(url: string): Promise<HorizonPage> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} → ${r.status} ${r.statusText}`);
  return (await r.json()) as HorizonPage;
}

async function snapshotTransactions(): Promise<void> {
  const url = `${HORIZON}/transactions?limit=${PAGE_LIMIT}&order=desc&include_failed=false`;
  const records = ((await getJson(url))._embedded?.records ?? []).map((r) => {
    const where = `transaction ${String(r.hash ?? "<no hash>")}`;
    return {
      hash: requireString(r.hash, "hash", where),
      envelope_xdr: requireString(r.envelope_xdr, "envelope_xdr", where),
      result_xdr: requireString(r.result_xdr, "result_xdr", where),
      fee_meta_xdr: requireString(r.fee_meta_xdr, "fee_meta_xdr", where),
    };
  });

  writeCorpus(OUT_DIR, "transactions.json", {
    source: url,
    fetchedAt: new Date().toISOString(),
    records,
  });
  reportCount(records.length, COUNT, "transaction");
  reportEnvelopeSpread(records.map((r) => r.envelope_xdr));
}

async function snapshotLedgers(): Promise<void> {
  const url = `${HORIZON}/ledgers?limit=${PAGE_LIMIT}&order=desc`;
  const records = ((await getJson(url))._embedded?.records ?? []).map((r) => {
    const where = `ledger ${String(r.sequence ?? "<no sequence>")}`;
    return {
      sequence: requireNumber(r.sequence, "sequence", where),
      header_xdr: requireString(r.header_xdr, "header_xdr", where),
    };
  });

  writeCorpus(OUT_DIR, "ledgers.json", {
    source: url,
    fetchedAt: new Date().toISOString(),
    records,
  });
  reportCount(records.length, COUNT, "ledger");
}

async function main(): Promise<void> {
  console.log(`Fetching from ${HORIZON}, COUNT=${COUNT}`);
  await snapshotTransactions();
  await snapshotLedgers();
  console.log(`\nCorpus written to ${OUT_DIR}`);
  console.log(
    `Run \`pnpm exec vitest run test/unit/xdr/corpus_round_trip.test.ts\` to validate.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
