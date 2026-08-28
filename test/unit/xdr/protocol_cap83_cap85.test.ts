// Round-trip coverage for the protocol variants added by CAP-83 (empty
// transaction set values) and CAP-85 (external-reference contract
// executables). These arms are new in the p28 schema regeneration, so they
// get hand-written coverage here: bytes → value → bytes.
import { describe, it, expect } from "vitest";

import xdr from "../../../src/base/xdr.js";

const CONTRACT_HASH = Buffer.alloc(32, 3);

describe("CAP-85: external-reference contract executables", () => {
  const externalRef = new xdr.ContractExecutableExternalRef({
    executableOwner: xdr.ScAddress.scAddressTypeContract(
      CONTRACT_HASH as unknown as xdr.Hash,
    ),
    tag: "token_v1",
  });

  it("round-trips ContractExecutableExternalRef through XDR", () => {
    const bytes = externalRef.toXDR();
    const decoded = xdr.ContractExecutableExternalRef.fromXDR(bytes);
    expect(decoded.tag().toString()).toBe("token_v1");
    expect(decoded.executableOwner().toXDR()).toEqual(
      externalRef.executableOwner().toXDR(),
    );
    expect(decoded.toXDR()).toEqual(bytes);
  });

  it("round-trips the CONTRACT_EXECUTABLE_EXTERNAL_REF arm", () => {
    const exec =
      xdr.ContractExecutable.contractExecutableExternalRef(externalRef);
    expect(exec.switch().name).toBe("contractExecutableExternalRef");

    const decoded = xdr.ContractExecutable.fromXDR(exec.toXDR());
    expect(decoded.switch().name).toBe("contractExecutableExternalRef");
    expect(decoded.toXDR()).toEqual(exec.toXDR());
  });

  it("keeps the existing Wasm and Stellar-asset arms intact", () => {
    const wasm = xdr.ContractExecutable.contractExecutableWasm(
      Buffer.alloc(32, 7),
    );
    expect(xdr.ContractExecutable.fromXDR(wasm.toXDR()).switch().name).toBe(
      "contractExecutableWasm",
    );

    const sac = xdr.ContractExecutable.contractExecutableStellarAsset();
    expect(xdr.ContractExecutable.fromXDR(sac.toXDR()).switch().name).toBe(
      "contractExecutableStellarAsset",
    );
  });

  it("round-trips SCV_EXECUTABLE_TAG", () => {
    const scv = xdr.ScVal.scvExecutableTag("token_v1");
    expect(scv.switch().name).toBe("scvExecutableTag");

    const decoded = xdr.ScVal.fromXDR(scv.toXDR());
    expect(decoded.switch().name).toBe("scvExecutableTag");
    expect(decoded.toXDR()).toEqual(scv.toXDR());
  });
});

describe("CAP-83: empty transaction set stellar values", () => {
  const lcValueSignature = new xdr.LedgerCloseValueSignature({
    nodeId: xdr.PublicKey.publicKeyTypeEd25519(Buffer.alloc(32, 1)),
    signature: Buffer.from([1, 2, 3, 4]),
  });

  const proposedValue = new xdr.StellarValueProposedValue({
    txSetHash: Buffer.alloc(32, 9),
    previousLedgerHash: Buffer.alloc(32, 8),
    previousLedgerVersion: 22,
    lcValueSignature,
  });

  it("round-trips StellarValueProposedValue through XDR", () => {
    const decoded = xdr.StellarValueProposedValue.fromXDR(
      proposedValue.toXDR(),
    );
    expect(decoded.previousLedgerVersion()).toBe(22);
    expect(decoded.txSetHash()).toEqual(proposedValue.txSetHash());
    expect(decoded.toXDR()).toEqual(proposedValue.toXDR());
  });

  it("round-trips the STELLAR_VALUE_EMPTY_TX_SET arm", () => {
    const ext = xdr.StellarValueExt.stellarValueEmptyTxSet(proposedValue);
    expect(ext.switch().name).toBe("stellarValueEmptyTxSet");

    const decoded = xdr.StellarValueExt.fromXDR(ext.toXDR());
    expect(decoded.switch().name).toBe("stellarValueEmptyTxSet");
    expect(decoded.toXDR()).toEqual(ext.toXDR());
  });

  it("keeps the basic and signed arms intact", () => {
    const basic = xdr.StellarValueExt.stellarValueBasic();
    expect(xdr.StellarValueExt.fromXDR(basic.toXDR()).switch().name).toBe(
      "stellarValueBasic",
    );

    const signed = xdr.StellarValueExt.stellarValueSigned(lcValueSignature);
    expect(xdr.StellarValueExt.fromXDR(signed.toXDR()).switch().name).toBe(
      "stellarValueSigned",
    );
  });
});
