// One-shot fetcher that populates `test/fixtures/rpc-corpus/` with real
// transaction and ledger XDR captured from Stellar RPC on mainnet.
//
// Usage:
//   pnpm tsx scripts/refresh-rpc-corpus.ts
//   RPC_URL=... COUNT=100 pnpm tsx scripts/refresh-rpc-corpus.ts
//
// Companion to `refresh-horizon-corpus.ts`. Both feed
// `test/unit/xdr/corpus_round_trip.test.ts`; they exist separately because the
// two APIs return genuinely different XDR types for the same concepts, and the
// corpus asserts against what each one actually serves rather than translating
// between them:
//
//   - getTransactions        → TransactionEnvelope, TransactionResult, and
//                              TransactionMeta (which Horizon no longer serves)
//   - getLedgers             → LedgerHeaderHistoryEntry — note this WRAPS a
//                              LedgerHeader plus its hash and ext, so it is a
//                              different type from Horizon's bare `header_xdr`
//
// Field names below stay in RPC's own camelCase for the same reason: the
// fixture should look like the response it came from.
//
// We don't decode the bytes here — just snapshot the on-wire form. The test
// does the decode/re-encode validation.
//
// Coverage note: RPC retains only a rolling window (roughly a week), so
// reaching back to a hand-picked historical range is not possible here. Widen
// COUNT instead, and check the envelope spread the run prints before
// committing — mainnet traffic skews heavily toward one envelope kind.
import { resolve } from "node:path";

import {
  readCount,
  requireNumber,
  requireString,
  reportCount,
  reportEnvelopeSpread,
  writeCorpus,
} from "./corpus-fixtures.js";

const RPC_URL = process.env.RPC_URL ?? "https://mainnet.sorobanrpc.com";
const OUT_DIR = resolve(import.meta.dirname, "../test/fixtures/rpc-corpus");
const COUNT = readCount(process.env.COUNT, 50);

// Use 200-record pages: this is getTransactions' cap and is also a
// conservative page size for getLedgers (whose cap is 10,000).
const PAGE_LIMIT = 200;

interface RpcTransaction {
  status?: string;
  txHash?: string;
  envelopeXdr?: string;
  resultXdr?: string;
  resultMetaXdr?: string;
}

interface RpcLedger {
  sequence?: number;
  headerXdr?: string;
}

interface Page<T> {
  cursor?: string;
  transactions?: T[];
  ledgers?: T[];
}

async function rpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`${method} → ${res.status} ${res.statusText}`);
  const body = (await res.json()) as {
    result?: T;
    error?: { message?: string };
  };
  if (body.error) {
    throw new Error(
      `${method} → RPC error: ${body.error.message ?? "unknown"}`,
    );
  }
  if (body.result === undefined) throw new Error(`${method} → empty result`);
  return body.result;
}

// `startLedger` and `cursor` are mutually exclusive: the first request anchors
// on a ledger, each subsequent one continues from the cursor it returned.
function pageParams(
  startLedger: number,
  cursor: string | undefined,
): Record<string, unknown> {
  return cursor
    ? { pagination: { cursor, limit: PAGE_LIMIT } }
    : { startLedger, pagination: { limit: PAGE_LIMIT } };
}

async function snapshotTransactions(startLedger: number): Promise<void> {
  const records: Array<{
    txHash: string;
    envelopeXdr: string;
    resultXdr: string;
    resultMetaXdr: string;
  }> = [];
  let cursor: string | undefined;

  while (records.length < COUNT) {
    const page = await rpc<Page<RpcTransaction>>(
      "getTransactions",
      pageParams(startLedger, cursor),
    );
    const transactions = page.transactions ?? [];
    if (transactions.length === 0) break;

    for (const tx of transactions) {
      // Matches Horizon's `include_failed=false`: only applied transactions.
      if (tx.status !== "SUCCESS") continue;
      const where = `transaction ${tx.txHash ?? "<no hash>"}`;
      records.push({
        txHash: requireString(tx.txHash, "txHash", where),
        envelopeXdr: requireString(tx.envelopeXdr, "envelopeXdr", where),
        resultXdr: requireString(tx.resultXdr, "resultXdr", where),
        resultMetaXdr: requireString(tx.resultMetaXdr, "resultMetaXdr", where),
      });
      if (records.length === COUNT) break;
    }

    if (!page.cursor) break;
    cursor = page.cursor;
  }

  writeCorpus(OUT_DIR, "transactions.json", {
    source: `${RPC_URL} getTransactions (startLedger=${startLedger}, status=SUCCESS)`,
    fetchedAt: new Date().toISOString(),
    records,
  });
  reportCount(records.length, COUNT, "transaction");
  reportEnvelopeSpread(records.map((r) => r.envelopeXdr));
}

async function snapshotLedgers(startLedger: number): Promise<void> {
  const records: Array<{ sequence: number; headerXdr: string }> = [];
  let cursor: string | undefined;

  while (records.length < COUNT) {
    const page = await rpc<Page<RpcLedger>>(
      "getLedgers",
      pageParams(startLedger, cursor),
    );
    const ledgers = page.ledgers ?? [];
    if (ledgers.length === 0) break;

    for (const ledger of ledgers) {
      const where = `ledger ${ledger.sequence ?? "<no sequence>"}`;
      records.push({
        sequence: requireNumber(ledger.sequence, "sequence", where),
        headerXdr: requireString(ledger.headerXdr, "headerXdr", where),
      });
      if (records.length === COUNT) break;
    }

    if (!page.cursor) break;
    cursor = page.cursor;
  }

  writeCorpus(OUT_DIR, "ledgers.json", {
    source: `${RPC_URL} getLedgers (startLedger=${startLedger})`,
    fetchedAt: new Date().toISOString(),
    records,
  });
  reportCount(records.length, COUNT, "ledger");
}

async function main(): Promise<void> {
  console.log(`Fetching from ${RPC_URL}, COUNT=${COUNT}`);
  const { sequence: latest } = await rpc<{ sequence: number }>(
    "getLatestLedger",
    {},
  );
  console.log(`Latest ledger: ${latest}`);

  // Transactions: a couple of ledgers back, so the window is fully ingested.
  await snapshotTransactions(Math.max(latest - 2, 1));
  // Ledgers: walk forward from COUNT back, so the sample ends at the tip.
  await snapshotLedgers(Math.max(latest - COUNT, 1));

  console.log(`\nCorpus written to ${OUT_DIR}`);
  console.log(
    `Run \`pnpm exec vitest run test/unit/xdr/corpus_round_trip.test.ts\` to validate.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
