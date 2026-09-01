// Round-trip coverage for CAP-88 (millisecond-resolution close times). These
// types are too new for the legacy SDK oracle used by `schema_exhaustive.test.ts`,
// so they get hand-written coverage here: bytes → value → bytes, plus the
// SEP-0051 JSON round-trip.
import { describe, it, expect } from "vitest";

import {
  Hash,
  LedgerCloseValueSignature,
  NodeId,
  Signature,
  StellarValue,
  StellarValueExt,
  StellarValueProposedMsValue,
  StellarValueSignedMsValue,
} from "../../../src/xdr/index.js";

describe("CAP-88: millisecond-resolution close times", () => {
  const lcValueSignature = new LedgerCloseValueSignature({
    nodeId: NodeId.publicKeyTypeEd25519(new Uint8Array(32).fill(1)),
    signature: new Signature(new Uint8Array([1, 2, 3, 4])),
  });

  const signedMsValue = new StellarValueSignedMsValue({
    closeTimeMs: 1893456000123n,
    lcValueSignature,
  });

  const proposedMsValue = new StellarValueProposedMsValue({
    closeTimeMs: 1893456000123n,
    txSetHash: new Hash(new Uint8Array(32).fill(9)),
    previousLedgerHash: new Hash(new Uint8Array(32).fill(8)),
    previousLedgerVersion: 30,
    lcValueSignature,
  });

  it("round-trips StellarValueSignedMsValue through XDR", () => {
    const decoded = StellarValueSignedMsValue.fromXdr(signedMsValue.toXdr());
    expect(decoded.closeTimeMs).toBe(1893456000123n);
    expect(decoded.toXdr()).toEqual(signedMsValue.toXdr());
  });

  it("round-trips the STELLAR_VALUE_SIGNED_MS arm", () => {
    const ext = StellarValueExt.stellarValueSignedMs(signedMsValue);
    expect(ext.type).toBe("stellarValueSignedMs");

    const decoded = StellarValueExt.fromXdr(ext.toXdr());
    expect(decoded.type).toBe("stellarValueSignedMs");
    expect(decoded.toXdr()).toEqual(ext.toXdr());
  });

  it("round-trips StellarValueProposedMsValue through XDR", () => {
    const decoded = StellarValueProposedMsValue.fromXdr(
      proposedMsValue.toXdr(),
    );
    expect(decoded.closeTimeMs).toBe(1893456000123n);
    expect(decoded.previousLedgerVersion).toBe(30);
    expect(decoded.txSetHash.toXdr()).toEqual(
      proposedMsValue.txSetHash.toXdr(),
    );
    expect(decoded.toXdr()).toEqual(proposedMsValue.toXdr());
  });

  it("round-trips the STELLAR_VALUE_EMPTY_TX_SET_MS arm", () => {
    const ext = StellarValueExt.stellarValueEmptyTxSetMs(proposedMsValue);
    expect(ext.type).toBe("stellarValueEmptyTxSetMs");

    const decoded = StellarValueExt.fromXdr(ext.toXdr());
    expect(decoded.type).toBe("stellarValueEmptyTxSetMs");
    expect(decoded.toXdr()).toEqual(ext.toXdr());
  });

  it("keeps the whole-second basic, signed and empty-tx-set arms intact", () => {
    const basic = StellarValueExt.stellarValueBasic();
    expect(StellarValueExt.fromXdr(basic.toXdr()).type).toBe(
      "stellarValueBasic",
    );

    const signed = StellarValueExt.stellarValueSigned(lcValueSignature);
    expect(StellarValueExt.fromXdr(signed.toXdr()).type).toBe(
      "stellarValueSigned",
    );
  });

  it("round-trips through JSON", () => {
    const ext = StellarValueExt.stellarValueSignedMs(signedMsValue);
    const revived = StellarValueExt.fromJson(ext.toJson());
    expect(revived.toXdr()).toEqual(ext.toXdr());
  });

  it("round-trips a StellarValue (LedgerHeader.scpValue) carrying the new ext arms", () => {
    const value = new StellarValue({
      txSetHash: new Hash(new Uint8Array(32).fill(5)),
      closeTime: 1893456000n, // whole-second closeTime is unchanged and independent of closeTimeMs
      upgrades: [],
      ext: StellarValueExt.stellarValueEmptyTxSetMs(proposedMsValue),
    });

    const decoded = StellarValue.fromXdr(value.toXdr());
    expect(decoded.closeTime).toBe(1893456000n);
    expect(decoded.ext.type).toBe("stellarValueEmptyTxSetMs");
    expect(decoded.toXdr()).toEqual(value.toXdr());
  });
});
