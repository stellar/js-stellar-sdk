// Corpus-based round-trip tests against real on-chain XDR payloads.
//
// There are two corpora, from two APIs, in two fixture directories:
//
//   test/fixtures/horizon-corpus/  ← scripts/refresh-horizon-corpus.ts
//   test/fixtures/rpc-corpus/      ← scripts/refresh-rpc-corpus.ts
//
// They are kept separate rather than merged because the two APIs genuinely
// return different XDR types for the same concepts, and each section asserts
// against what its source actually serves instead of translating between them:
//
//   - Horizon serves `header_xdr` as a bare LedgerHeader; RPC serves
//     `headerXdr` as a LedgerHeaderHistoryEntry, which WRAPS a LedgerHeader
//     plus its hash and ext. Decoding one as the other misaligns and throws.
//   - Horizon no longer serves `result_meta_xdr` at all (SDF removed it and
//     points callers at RPC), so TransactionMeta coverage comes from the RPC
//     corpus. Horizon still serves `fee_meta_xdr`, which is wire-equivalent to
//     an OperationMeta.
//   - Field names follow each source: Horizon's snake_case, RPC's camelCase.
//
// For every fixture we check that the new SDK decodes the bytes without
// throwing, that re-encoding reproduces the input exactly, and that the legacy
// SDK agrees on the same bytes (legacy is the oracle). Sections skip cleanly
// when their corpus file is absent, so adding a new corpus file later doesn't
// require editing this file.
import { describe, it, expect } from "vitest";
// Legacy js-xdr v4's `fromXDR` genuinely takes/returns Buffers; this file is
// Node-only (excluded from the browser suite), so Buffer here is fine — but
// only for the legacy side.
import { Buffer } from "node:buffer";
import { base64ToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import legacyTypes from "../../fixtures/legacy-xdr/curr_generated.js";

import {
  TransactionEnvelope,
  TransactionResult,
  TransactionMeta,
  OperationMeta,
  LedgerHeader,
  LedgerHeaderHistoryEntry,
} from "../../../src/xdr/index.js";

interface XdrValueLike {
  toXdr(): Uint8Array;
  toJson(): unknown;
}

interface XdrCodec {
  fromXdr(bytes: Uint8Array): XdrValueLike;
  fromJson(json: unknown): XdrValueLike;
}

interface LegacyCodec {
  fromXDR(buf: Buffer): { toXDR(): Buffer };
}

const legacy = legacyTypes as unknown as Record<string, LegacyCodec>;

const FIXTURES = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../fixtures",
);
const HORIZON_DIR = resolve(FIXTURES, "horizon-corpus");
const RPC_DIR = resolve(FIXTURES, "rpc-corpus");

const REFRESH_HORIZON = "pnpm tsx scripts/refresh-horizon-corpus.ts";
const REFRESH_RPC = "pnpm tsx scripts/refresh-rpc-corpus.ts";

function loadCorpus<T>(dir: string, filename: string): T[] | null {
  const path = resolve(dir, filename);
  if (!existsSync(path)) return null;
  const json = JSON.parse(readFileSync(path, "utf8"));
  return json.records as T[];
}

function asHex(buf: Uint8Array): string {
  return uint8ArrayToHex(Uint8Array.from(buf));
}

interface HorizonTransactionRecord {
  hash: string;
  envelope_xdr: string;
  result_xdr: string;
  fee_meta_xdr: string;
}

interface HorizonLedgerRecord {
  sequence: number;
  header_xdr: string;
}

interface RpcTransactionRecord {
  txHash: string;
  envelopeXdr: string;
  resultXdr: string;
  resultMetaXdr: string;
}

interface RpcLedgerRecord {
  sequence: number;
  headerXdr: string;
}

// Assert: decoding `b64` with the new SDK, then re-encoding, produces the
// same bytes. Also cross-checks against the legacy SDK doing the same
// round-trip — proves both SDKs agree on the wire shape.
function assertRoundTrip(
  name: string,
  b64: string,
  newCtor: XdrCodec,
  legacyCtor: LegacyCodec,
): void {
  const inputBytes = base64ToUint8Array(b64);
  const inputHex = asHex(inputBytes);

  let newDecoded: XdrValueLike;
  try {
    newDecoded = newCtor.fromXdr(inputBytes);
  } catch (err) {
    throw new Error(
      `${name}: new SDK fromXdr threw — ${(err as Error).message}`,
    );
  }
  expect(asHex(newDecoded.toXdr()), `${name}: new SDK lossy round-trip`).toBe(
    inputHex,
  );

  let lgcyDecoded: { toXDR(): Buffer };
  try {
    lgcyDecoded = legacyCtor.fromXDR(Buffer.from(inputBytes));
  } catch (err) {
    throw new Error(
      `${name}: legacy SDK fromXDR threw — ${(err as Error).message}`,
    );
  }
  expect(
    asHex(lgcyDecoded.toXDR()),
    `${name}: legacy SDK lossy round-trip`,
  ).toBe(inputHex);
}

// toJson → fromJson on real, large mainnet values. Besides checking the JSON
// dialect round-trips, this exercises the memoized per-schema accepted-key set
// across many repeated struct nodes.
function assertJsonRoundTrip(b64: string, ctor: XdrCodec): void {
  const value = ctor.fromXdr(base64ToUint8Array(b64));
  const round = ctor.fromJson(value.toJson());
  expect(round.toXdr()).toEqual(value.toXdr());
}

describe("horizon corpus: TransactionEnvelope + TransactionResult (mainnet)", () => {
  const records = loadCorpus<HorizonTransactionRecord>(
    HORIZON_DIR,
    "transactions.json",
  );
  if (!records || records.length === 0) {
    it.skip(`(no corpus file; run \`${REFRESH_HORIZON}\`)`, () => {});
    return;
  }

  for (const r of records) {
    it(`envelope ${r.hash.slice(0, 12)}… round-trips`, () => {
      assertRoundTrip(
        `envelope ${r.hash}`,
        r.envelope_xdr,
        TransactionEnvelope,
        legacy.TransactionEnvelope,
      );
    });

    it(`result ${r.hash.slice(0, 12)}… round-trips`, () => {
      assertRoundTrip(
        `result ${r.hash}`,
        r.result_xdr,
        TransactionResult,
        legacy.TransactionResult,
      );
    });
  }
});

describe("horizon corpus: fee meta as OperationMeta (mainnet)", () => {
  const records = loadCorpus<HorizonTransactionRecord>(
    HORIZON_DIR,
    "transactions.json",
  );
  if (!records || records.length === 0) {
    it.skip(`(no corpus file; run \`${REFRESH_HORIZON}\`)`, () => {});
    return;
  }

  // `fee_meta_xdr` carries the fee-processing LedgerEntryChanges, which is
  // wire-identical to an OperationMeta (a struct of just that field).
  for (const r of records) {
    it(`fee_meta ${r.hash.slice(0, 12)}… round-trips`, () => {
      assertRoundTrip(
        `fee_meta ${r.hash}`,
        r.fee_meta_xdr,
        OperationMeta,
        legacy.OperationMeta,
      );
    });
  }
});

describe("horizon corpus: LedgerHeader (mainnet)", () => {
  const records = loadCorpus<HorizonLedgerRecord>(HORIZON_DIR, "ledgers.json");
  if (!records || records.length === 0) {
    it.skip(`(no corpus file; run \`${REFRESH_HORIZON}\`)`, () => {});
    return;
  }

  for (const r of records) {
    it(`ledger ${r.sequence} round-trips`, () => {
      assertRoundTrip(
        `ledger ${r.sequence}`,
        r.header_xdr,
        LedgerHeader,
        legacy.LedgerHeader,
      );
    });
  }
});

describe("horizon corpus: JSON round-trip (mainnet)", () => {
  const records = loadCorpus<HorizonTransactionRecord>(
    HORIZON_DIR,
    "transactions.json",
  );
  if (!records || records.length === 0) {
    it.skip(`(no corpus file; run \`${REFRESH_HORIZON}\`)`, () => {});
    return;
  }

  for (const r of records) {
    it(`envelope ${r.hash.slice(0, 12)}… JSON round-trips`, () => {
      assertJsonRoundTrip(r.envelope_xdr, TransactionEnvelope);
    });

    it(`fee_meta ${r.hash.slice(0, 12)}… JSON round-trips`, () => {
      assertJsonRoundTrip(r.fee_meta_xdr, OperationMeta);
    });
  }
});

describe("rpc corpus: TransactionEnvelope + Result + TransactionMeta (mainnet)", () => {
  const records = loadCorpus<RpcTransactionRecord>(
    RPC_DIR,
    "transactions.json",
  );
  if (!records || records.length === 0) {
    it.skip(`(no corpus file; run \`${REFRESH_RPC}\`)`, () => {});
    return;
  }

  for (const r of records) {
    it(`envelope ${r.txHash.slice(0, 12)}… round-trips`, () => {
      assertRoundTrip(
        `envelope ${r.txHash}`,
        r.envelopeXdr,
        TransactionEnvelope,
        legacy.TransactionEnvelope,
      );
    });

    it(`result ${r.txHash.slice(0, 12)}… round-trips`, () => {
      assertRoundTrip(
        `result ${r.txHash}`,
        r.resultXdr,
        TransactionResult,
        legacy.TransactionResult,
      );
    });

    // RPC returns a full TransactionMeta for every transaction, fee-bump
    // included — no per-envelope-type dispatch needed.
    it(`result_meta ${r.txHash.slice(0, 12)}… round-trips`, () => {
      assertRoundTrip(
        `result_meta ${r.txHash}`,
        r.resultMetaXdr,
        TransactionMeta,
        legacy.TransactionMeta,
      );
    });
  }
});

describe("rpc corpus: JSON round-trip (mainnet)", () => {
  const records = loadCorpus<RpcTransactionRecord>(
    RPC_DIR,
    "transactions.json",
  );
  if (!records || records.length === 0) {
    it.skip(`(no corpus file; run \`${REFRESH_RPC}\`)`, () => {});
    return;
  }

  for (const r of records) {
    it(`envelope ${r.txHash.slice(0, 12)}… JSON round-trips`, () => {
      assertJsonRoundTrip(r.envelopeXdr, TransactionEnvelope);
    });

    it(`result_meta ${r.txHash.slice(0, 12)}… JSON round-trips`, () => {
      assertJsonRoundTrip(r.resultMetaXdr, TransactionMeta);
    });
  }
});

describe("rpc corpus: LedgerHeaderHistoryEntry (mainnet)", () => {
  const records = loadCorpus<RpcLedgerRecord>(RPC_DIR, "ledgers.json");
  if (!records || records.length === 0) {
    it.skip(`(no corpus file; run \`${REFRESH_RPC}\`)`, () => {});
    return;
  }

  for (const r of records) {
    it(`ledger ${r.sequence} round-trips`, () => {
      assertRoundTrip(
        `ledger ${r.sequence}`,
        r.headerXdr,
        LedgerHeaderHistoryEntry,
        legacy.LedgerHeaderHistoryEntry,
      );
    });
  }
});
