// Round-trip coverage for the protocol variants added by CAP-83 (empty
// transaction set values) and CAP-85 (external-reference contract
// executables). These types are too new for the legacy SDK oracle used by
// `schema_exhaustive.test.ts`, so they get hand-written coverage here:
// bytes → value → bytes, plus the SEP-0051 JSON round-trip.
import { describe, it, expect } from "vitest";

import {
  ContractExecutable,
  ContractExecutableExternalRef,
  ContractId,
  Hash,
  LedgerCloseValueSignature,
  NodeId,
  ScAddress,
  ScVal,
  Signature,
  StellarValueExt,
  StellarValueProposedValue,
} from "../../../src/xdr/index.js";

const CONTRACT_ID = new ContractId(new Uint8Array(32).fill(3));

describe("CAP-85: external-reference contract executables", () => {
  const externalRef = new ContractExecutableExternalRef({
    executableOwner: ScAddress.scAddressTypeContract(CONTRACT_ID),
    tag: "token_v1",
  });

  it("round-trips ContractExecutableExternalRef through XDR", () => {
    const bytes = externalRef.toXdr();
    const decoded = ContractExecutableExternalRef.fromXdr(bytes);
    expect(decoded.tag.toString()).toBe("token_v1");
    expect(decoded.executableOwner.toXdr()).toEqual(
      externalRef.executableOwner.toXdr(),
    );
    expect(decoded.toXdr()).toEqual(bytes);
  });

  it("round-trips the CONTRACT_EXECUTABLE_EXTERNAL_REF arm", () => {
    const exec = ContractExecutable.contractExecutableExternalRef(externalRef);
    expect(exec.type).toBe("contractExecutableExternalRef");

    const decoded = ContractExecutable.fromXdr(exec.toXdr());
    expect(decoded.type).toBe("contractExecutableExternalRef");
    expect(decoded.toXdr()).toEqual(exec.toXdr());
  });

  it("keeps the existing Wasm and Stellar-asset arms intact", () => {
    const wasm = ContractExecutable.contractExecutableWasm(
      new Hash(new Uint8Array(32).fill(7)),
    );
    expect(ContractExecutable.fromXdr(wasm.toXdr()).type).toBe(
      "contractExecutableWasm",
    );

    const sac = ContractExecutable.contractExecutableStellarAsset();
    expect(ContractExecutable.fromXdr(sac.toXdr()).type).toBe(
      "contractExecutableStellarAsset",
    );
  });

  it("round-trips SCV_EXECUTABLE_TAG", () => {
    const scv = ScVal.scvExecutableTag("token_v1");
    expect(scv.type).toBe("scvExecutableTag");

    const decoded = ScVal.fromXdr(scv.toXdr());
    expect(decoded.type).toBe("scvExecutableTag");
    expect(decoded.toXdr()).toEqual(scv.toXdr());
  });

  it("round-trips through JSON", () => {
    const exec = ContractExecutable.contractExecutableExternalRef(externalRef);
    const revived = ContractExecutable.fromJson(exec.toJson());
    expect(revived.toXdr()).toEqual(exec.toXdr());
  });
});

describe("CAP-83: empty transaction set stellar values", () => {
  const lcValueSignature = new LedgerCloseValueSignature({
    nodeId: NodeId.publicKeyTypeEd25519(new Uint8Array(32).fill(1)),
    signature: new Signature(new Uint8Array([1, 2, 3, 4])),
  });

  const proposedValue = new StellarValueProposedValue({
    txSetHash: new Hash(new Uint8Array(32).fill(9)),
    previousLedgerHash: new Hash(new Uint8Array(32).fill(8)),
    previousLedgerVersion: 22,
    lcValueSignature,
  });

  it("round-trips StellarValueProposedValue through XDR", () => {
    const decoded = StellarValueProposedValue.fromXdr(proposedValue.toXdr());
    expect(decoded.previousLedgerVersion).toBe(22);
    expect(decoded.txSetHash.toXdr()).toEqual(proposedValue.txSetHash.toXdr());
    expect(decoded.toXdr()).toEqual(proposedValue.toXdr());
  });

  it("round-trips the STELLAR_VALUE_EMPTY_TX_SET arm", () => {
    const ext = StellarValueExt.stellarValueEmptyTxSet(proposedValue);
    expect(ext.type).toBe("stellarValueEmptyTxSet");

    const decoded = StellarValueExt.fromXdr(ext.toXdr());
    expect(decoded.type).toBe("stellarValueEmptyTxSet");
    expect(decoded.toXdr()).toEqual(ext.toXdr());
  });

  it("keeps the basic and signed arms intact", () => {
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
    const ext = StellarValueExt.stellarValueEmptyTxSet(proposedValue);
    const revived = StellarValueExt.fromJson(ext.toJson());
    expect(revived.toXdr()).toEqual(ext.toXdr());
  });
});
