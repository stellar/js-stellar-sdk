import { describe, it, expect } from "vitest";
import { concatUint8Arrays } from "uint8array-extras";

import {
  decodeArray,
  decodeStream,
  encodeArray,
  LedgerCloseMeta,
  LedgerCloseMetaBatch,
  Transaction,
  TransactionEnvelope,
  XdrError,
} from "../../../src/xdr/index.js";

// stellar-core 30 accepts an InvokeHostFunction transaction whose auth entry
// nests 493 invocations with an i128 argument on the deepest one, and rejects
// 494 as txMALFORMED. The ledger that holds it must decode (issue #1901).
const CORE_MAX_AUTH_LEVELS = 493;

const u32 = (n: number) => {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n);
  return b;
};
const zeros = (n: number) => new Uint8Array(n);

const CONTRACT = { type: 1, contractId: new Uint8Array(32).fill(7) };
const invokeArgs = (args: unknown[]) => ({
  contractAddress: CONTRACT,
  functionName: "f",
  args,
});

/** TransactionEnvelope bytes with `levels` nested auth invocations. */
function envelope(levels: number): Uint8Array {
  let invocation: unknown = {
    function: {
      type: 0,
      contractFn: invokeArgs([{ type: 10, i128: { hi: 0n, lo: 0n } }]),
    },
    subInvocations: [],
  };
  for (let i = 1; i < levels; i++) {
    invocation = {
      function: { type: 0, contractFn: invokeArgs([]) },
      subInvocations: [invocation],
    };
  }
  const tx = {
    sourceAccount: { type: 0, ed25519: zeros(32) },
    fee: 100,
    seqNum: 1n,
    cond: { type: 0 },
    memo: { type: 0 },
    operations: [
      {
        sourceAccount: null,
        body: {
          type: 24,
          invokeHostFunctionOp: {
            hostFunction: { type: 0, invokeContract: invokeArgs([]) },
            auth: [{ credentials: { type: 0 }, rootInvocation: invocation }],
          },
        },
      },
    ],
    ext: { v: 0 },
  };
  const txBytes = Transaction.schema.encode(tx as never, { maxDepth: 10_000 });
  // ENVELOPE_TYPE_TX, the transaction, no signatures
  return concatUint8Arrays([u32(2), txBytes, u32(0)]);
}

/** LedgerCloseMetaV2 bytes with `env` as the only Soroban transaction. */
function ledgerCloseMeta(env: Uint8Array): Uint8Array {
  const header = concatUint8Arrays([
    u32(30), // ledgerVersion
    zeros(32), // previousLedgerHash
    zeros(32 + 8), // scpValue: txSetHash, closeTime
    u32(0), // scpValue: upgrades
    u32(0), // scpValue: ext
    zeros(32 + 32), // txSetResultHash, bucketListHash
    u32(13), // ledgerSeq
    zeros(8 + 8), // totalCoins, feePool
    u32(0), // inflationSeq
    zeros(8), // idPool
    u32(100), // baseFee
    u32(5_000_000), // baseReserve
    u32(100), // maxTxSetSize
    zeros(4 * 32), // skipList
    u32(0), // ext
  ]);
  const txSet = concatUint8Arrays([
    u32(1), // GeneralizedTransactionSet v1
    zeros(32), // previousLedgerHash
    u32(2), // two phases
    u32(0), // classic phase: v0
    u32(0), // no components
    u32(1), // Soroban phase: v1, parallel
    u32(0), // no base fee
    u32(1), // one stage
    u32(1), // one cluster
    u32(1), // one transaction
    env,
  ]);
  return concatUint8Arrays([
    u32(2), // LedgerCloseMeta v2
    u32(0), // ext
    zeros(32), // ledgerHeader.hash
    header,
    u32(0), // ledgerHeader.ext
    txSet,
    u32(0), // txProcessing
    u32(0), // upgradesProcessing
    u32(0), // scpInfo
    zeros(8), // totalByteSizeOfLiveSorobanState
    u32(0), // evictedKeys
  ]);
}

const batch = (lcm: Uint8Array) =>
  concatUint8Arrays([u32(13), u32(13), u32(1), lcm]);

describe("XDR depth limit", () => {
  const env = envelope(CORE_MAX_AUTH_LEVELS);
  const lcm = ledgerCloseMeta(env);
  const lcmBatch = batch(lcm);

  it("round-trips the deepest transaction core accepts", () => {
    expect(TransactionEnvelope.validateXdr(env)).toBe(true);
    expect(TransactionEnvelope.fromXdr(env).toXdr()).toEqual(env);
    expect(TransactionEnvelope.fromXDR(env).toXDR()).toEqual(env);
  });

  it("round-trips the ledger that holds it", () => {
    expect(LedgerCloseMeta.validateXdr(lcm)).toBe(true);
    expect(LedgerCloseMeta.fromXdr(lcm).toXdr()).toEqual(lcm);
    expect(LedgerCloseMeta.fromXDR(lcm).toXDR()).toEqual(lcm);
  });

  it("round-trips a batch of that ledger", () => {
    expect(LedgerCloseMetaBatch.validateXdr(lcmBatch)).toBe(true);
    expect(LedgerCloseMetaBatch.fromXdr(lcmBatch).toXdr()).toEqual(lcmBatch);
    expect(LedgerCloseMetaBatch.fromXDR(lcmBatch).toXDR()).toEqual(lcmBatch);
  });

  it("needs more than the js-xdr default of 1500 for the batch", () => {
    expect(() =>
      LedgerCloseMetaBatch.schema.decode(lcmBatch, { maxDepth: 1500 }),
    ).toThrow(/max recursion depth 1500 exceeded/);
  });

  it("decodes the ledger through decodeStream and decodeArray", () => {
    const [fromStream] = decodeStream(LedgerCloseMeta, lcm);
    expect(fromStream.toXdr()).toEqual(lcm);

    const asArray = concatUint8Arrays([u32(1), lcm]);
    const decoded = decodeArray(LedgerCloseMeta, asArray);
    expect(encodeArray(LedgerCloseMeta, decoded)).toEqual(asArray);
  });

  it("still rejects nesting far past what core accepts", () => {
    const tooDeep = batch(ledgerCloseMeta(envelope(600)));
    expect(() => LedgerCloseMetaBatch.fromXdr(tooDeep)).toThrow(XdrError);
    expect(LedgerCloseMetaBatch.validateXdr(tooDeep)).toBe(false);
  });
});
