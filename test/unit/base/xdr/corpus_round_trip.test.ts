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
import { Buffer } from "buffer";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import legacyTypes from "../../../fixtures/legacy-xdr/curr_generated.js";
const legacy = legacyTypes as any;

import {
  TransactionEnvelope,
  TransactionResult,
  TransactionMeta,
  LedgerHeader,
} from "../../../../src/xdr/index.js";

const CORPUS_DIR = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../../fixtures/horizon-corpus",
);

function loadCorpus<T>(filename: string): T[] | null {
  const path = resolve(CORPUS_DIR, filename);
  if (!existsSync(path)) return null;
  const json = JSON.parse(readFileSync(path, "utf8"));
  return json.records as T[];
}

function asHex(buf: Uint8Array | Buffer): string {
  return Buffer.from(buf).toString("hex");
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newCtor: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  legacyCtor: any,
): void {
  const inputBytes = Buffer.from(b64, "base64");
  const inputHex = asHex(inputBytes);

  // New SDK: decode → encode → bytes match input
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let newDecoded: any;
  try {
    newDecoded = newCtor.fromXdr(new Uint8Array(inputBytes));
  } catch (err) {
    throw new Error(`${name}: new SDK fromXdr threw — ${(err as Error).message}`);
  }
  const newReencoded = asHex(newDecoded.toXdr());
  expect(newReencoded, `${name}: new SDK lossy round-trip`).toBe(inputHex);

  // Legacy SDK: same dance, as a sanity check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lgcyDecoded: any;
  try {
    lgcyDecoded = legacyCtor.fromXDR(inputBytes);
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
      assertRoundTrip(
        `result_meta ${r.hash}`,
        r.result_meta_xdr,
        TransactionMeta,
        legacy.TransactionMeta,
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
