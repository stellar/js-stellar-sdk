// One-shot fetcher that populates `test/fixtures/horizon-corpus/` with
// real envelope/operation/ledger XDR captured from horizon mainnet.
//
// Usage:
//   pnpm tsx scripts/refresh-horizon-corpus.ts
//
// Refresh quarterly or when a new Stellar protocol version ships. The
// resulting JSON files are checked into the repo and consumed by
// `test/unit/base/xdr/corpus_round_trip.test.ts` — that test asserts every
// fixture round-trips losslessly through both the new and legacy XDR
// runtimes, so any encoding regression that affects shapes the network
// actually produces will fail loudly.
//
// We pull from a few endpoints to hit a broad surface:
//   - /transactions          → TransactionEnvelope (covers ops, memos, signers)
//   - /ledgers/{seq}          → LedgerHeader (covers nested ledger entry types)
//
// We don't decode the bytes here — just snapshot the on-wire form. The
// test does the decode/re-encode validation.
//
// Coverage note: at any given moment mainnet traffic skews heavily toward
// one envelope kind (often fee-bump). For best coverage when refreshing,
// either sample a larger range, or hand-pick a mix of `envelopeTypeTx`,
// `envelopeTypeTxV0`, and `envelopeTypeTxFeeBump` records by querying
// historical ranges that included Soroban contract calls, classic
// payments, and fee-bumped batches.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const HORIZON = process.env.HORIZON ?? "https://horizon.stellar.org";
const OUT_DIR = resolve(import.meta.dirname, "../test/fixtures/horizon-corpus");
const COUNT = Number(process.env.COUNT ?? 50);

interface CorpusFile<T> {
  source: string;
  fetchedAt: string;
  records: T[];
}

async function getJson(url: string): Promise<unknown> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} → ${r.status} ${r.statusText}`);
  return r.json();
}

async function snapshotTransactions(): Promise<void> {
  const url = `${HORIZON}/transactions?limit=${Math.min(COUNT, 200)}&order=desc&include_failed=false`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await getJson(url)) as any;
  const records = json._embedded.records.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => ({
      hash: r.hash,
      envelope_xdr: r.envelope_xdr,
      result_xdr: r.result_xdr,
      result_meta_xdr: r.result_meta_xdr,
    }),
  );
  writeCorpus("transactions.json", {
    source: url,
    fetchedAt: new Date().toISOString(),
    records,
  });
  console.log(`Wrote ${records.length} transaction records.`);
}

async function snapshotLedgers(): Promise<void> {
  const url = `${HORIZON}/ledgers?limit=${Math.min(COUNT, 200)}&order=desc`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await getJson(url)) as any;
  const records = json._embedded.records.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => ({
      sequence: r.sequence,
      header_xdr: r.header_xdr,
    }),
  );
  writeCorpus("ledgers.json", {
    source: url,
    fetchedAt: new Date().toISOString(),
    records,
  });
  console.log(`Wrote ${records.length} ledger records.`);
}

function writeCorpus<T>(filename: string, payload: CorpusFile<T>): void {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    resolve(OUT_DIR, filename),
    JSON.stringify(payload, null, 2) + "\n",
  );
}

async function main(): Promise<void> {
  console.log(`Fetching from ${HORIZON}, COUNT=${COUNT}`);
  await snapshotTransactions();
  await snapshotLedgers();
  console.log(`\nCorpus written to ${OUT_DIR}`);
  console.log(`Run \`pnpm exec vitest run test/unit/base/xdr/corpus_round_trip.test.ts\` to validate.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
