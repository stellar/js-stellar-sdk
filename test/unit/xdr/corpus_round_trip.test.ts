// Corpus-based round-trip tests against real on-chain XDR payloads pulled
// from horizon mainnet (`test/fixtures/horizon-corpus/`).
//
// For every fixture we check three properties:
//
//   1. The new SDK decodes the bytes without throwing.
//   2. Re-encoding produces bytes identical to the input (self-lossless).
//   3. The legacy SDK decodes the bytes and re-encodes to the same bytes
//      (sanity check — legacy is our oracle).
//
// Optional 4th check: the new SDK can decode bytes that the legacy SDK
// produced from a fresh decode (legacy → bytes → new → bytes). Catches
// any subtle decoder divergence between the two SDKs.
//
// The corpus is checked in but disposable; refresh via
// `pnpm tsx scripts/refresh-horizon-corpus.ts` to pull a fresh sample.
// Tests skip cleanly if a corpus file is missing (so adding new corpus
// files later doesn't require updating this test file).
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
const legacy = legacyTypes as any;

import {
  TransactionEnvelope,
  TransactionResult,
  TransactionMeta,
  OperationMeta,
  LedgerHeader,
} from "../../../src/xdr/index.js";

const CORPUS_DIR = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../fixtures/horizon-corpus",
);

function loadCorpus<T>(filename: string): T[] | null {
  const path = resolve(CORPUS_DIR, filename);
  if (!existsSync(path)) return null;
  const json = JSON.parse(readFileSync(path, "utf8"));
  return json.records as T[];
}

function asHex(buf: Uint8Array): string {
  return uint8ArrayToHex(Uint8Array.from(buf));
}

interface TransactionRecord {
  hash: string;
  envelope_xdr: string;
  result_xdr: string;
  result_meta_xdr: string;
}

interface LedgerRecord {
  sequence: number;
  header_xdr: string;
}

// Assert: decoding `b64` with the new SDK, then re-encoding, produces the
// same bytes. Also (optionally) cross-checks against the legacy SDK doing
// the same round-trip — proves both SDKs agree on the wire shape.
function assertRoundTrip(
  name: string,
  b64: string,

  newCtor: any,

  legacyCtor: any,
): void {
  const inputBytes = base64ToUint8Array(b64);
  const inputHex = asHex(inputBytes);

  // New SDK: decode → encode → bytes match input

  let newDecoded: any;
  try {
    newDecoded = newCtor.fromXdr(inputBytes);
  } catch (err) {
    throw new Error(
      `${name}: new SDK fromXdr threw — ${(err as Error).message}`,
    );
  }
  const newReencoded = asHex(newDecoded.toXdr());
  expect(newReencoded, `${name}: new SDK lossy round-trip`).toBe(inputHex);

  // Legacy SDK: same dance, as a sanity check

  let lgcyDecoded: any;
  try {
    lgcyDecoded = legacyCtor.fromXDR(Buffer.from(inputBytes));
  } catch (err) {
    throw new Error(
      `${name}: legacy SDK fromXDR threw — ${(err as Error).message}`,
    );
  }
  const lgcyReencoded = asHex(lgcyDecoded.toXDR());
  expect(lgcyReencoded, `${name}: legacy SDK lossy round-trip`).toBe(inputHex);
}

describe("corpus round-trip: TransactionEnvelope (mainnet)", () => {
  const records = loadCorpus<TransactionRecord>("transactions.json");
  if (!records || records.length === 0) {
    it.skip("(no corpus file; run `pnpm tsx scripts/refresh-horizon-corpus.ts`)", () => {});
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

    it(`result_meta ${r.hash.slice(0, 12)}… round-trips`, () => {
      // Horizon's `result_meta_xdr` field is `TransactionMeta` for regular
      // transactions, but for fee-bump (envelopeTypeTxFeeBump, v=5) it
      // carries only the outer-tx fee-processing changes — wire-equivalent
      // to a bare `LedgerEntryChanges` / `OperationMeta`. The inner-tx meta
      // lives on the inner tx's separate record. Detect and dispatch.
      const envBytes = base64ToUint8Array(r.envelope_xdr);
      const envDiscriminator = new DataView(
        envBytes.buffer,
        envBytes.byteOffset,
        envBytes.byteLength,
      ).getUint32(0);
      const isFeeBump = envDiscriminator === 5; // envelopeTypeTxFeeBump
      if (isFeeBump) {
        assertRoundTrip(
          `result_meta ${r.hash} (fee-bump outer changes)`,
          r.result_meta_xdr,
          OperationMeta,
          legacy.OperationMeta,
        );
      } else {
        assertRoundTrip(
          `result_meta ${r.hash}`,
          r.result_meta_xdr,
          TransactionMeta,
          legacy.TransactionMeta,
        );
      }
    });
  }
});

describe("corpus JSON round-trip: envelopes and metas (mainnet)", () => {
  const records = loadCorpus<TransactionRecord>("transactions.json");
  if (!records || records.length === 0) {
    it.skip("(no corpus file; run `pnpm tsx scripts/refresh-horizon-corpus.ts`)", () => {});
    return;
  }

  // toJson → fromJson on real, large mainnet values. Besides checking the
  // JSON dialect round-trips, this exercises the memoized per-schema
  // accepted-key set across many repeated struct nodes.
  function assertJsonRoundTrip(b64: string, ctor: any): void {
    const value = ctor.fromXdr(base64ToUint8Array(b64));
    const round = ctor.fromJson(value.toJson());
    expect(round.toXdr()).toEqual(value.toXdr());
  }

  for (const r of records) {
    it(`envelope ${r.hash.slice(0, 12)}… JSON round-trips`, () => {
      assertJsonRoundTrip(r.envelope_xdr, TransactionEnvelope);
    });

    it(`result_meta ${r.hash.slice(0, 12)}… JSON round-trips`, () => {
      // Same fee-bump dispatch as the byte-level test above: the outer
      // record's meta is wire-equivalent to an OperationMeta.
      const envBytes = base64ToUint8Array(r.envelope_xdr);
      const isFeeBump =
        new DataView(
          envBytes.buffer,
          envBytes.byteOffset,
          envBytes.byteLength,
        ).getUint32(0) === 5;
      assertJsonRoundTrip(
        r.result_meta_xdr,
        isFeeBump ? OperationMeta : TransactionMeta,
      );
    });
  }
});

describe("corpus round-trip: LedgerHeader (mainnet)", () => {
  const records = loadCorpus<LedgerRecord>("ledgers.json");
  if (!records || records.length === 0) {
    it.skip("(no corpus file; run `pnpm tsx scripts/refresh-horizon-corpus.ts`)", () => {});
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
