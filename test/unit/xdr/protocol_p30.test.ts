// Round-trip coverage for the protocol variants added by CAP-84 (muxed
// contract addresses), CAP-87 (ML-DSA cost types), CAP-88 (millisecond close
// times) and the widened contract spec type names. These are new in the p30
// schema regeneration, so they get hand-written coverage here: bytes → value
// → bytes.
import { describe, it, expect } from "vitest";

import xdr from "../../../src/base/xdr.js";
import { Address } from "../../../src/base/address.js";
import { scValToNative } from "../../../src/base/scval.js";

const CONTRACT_HASH = Buffer.alloc(32, 3);

describe("CAP-84: muxed contract addresses", () => {
  const muxedContract = new xdr.MuxedContract({
    id: xdr.Uint64.fromString("18446744073709551615"),
    contractId: CONTRACT_HASH as unknown as xdr.ContractId,
  });

  it("round-trips MuxedContract through XDR", () => {
    const decoded = xdr.MuxedContract.fromXDR(muxedContract.toXDR());
    expect(decoded.id().toString()).toBe("18446744073709551615");
    expect(decoded.contractId()).toEqual(CONTRACT_HASH);
    expect(decoded.toXDR()).toEqual(muxedContract.toXDR());
  });

  it("round-trips the SC_ADDRESS_TYPE_MUXED_CONTRACT arm", () => {
    const address = xdr.ScAddress.scAddressTypeMuxedContract(muxedContract);
    expect(address.switch().name).toBe("scAddressTypeMuxedContract");
    expect(address.switch().value).toBe(5);

    const decoded = xdr.ScAddress.fromXDR(address.toXDR());
    expect(decoded.switch().name).toBe("scAddressTypeMuxedContract");
    expect(decoded.muxedContract().id().toString()).toBe(
      "18446744073709551615",
    );
    expect(decoded.toXDR()).toEqual(address.toXDR());
  });

  // v16 decodes the new arm but does not support it above the XDR layer.
  it("is rejected by Address and scValToNative", () => {
    const address = xdr.ScAddress.scAddressTypeMuxedContract(muxedContract);
    const message = "Unsupported address type: scAddressTypeMuxedContract";
    expect(() => Address.fromScAddress(address)).toThrow(message);
    expect(() => scValToNative(xdr.ScVal.scvAddress(address))).toThrow(message);
  });
});

describe("CAP-87: ML-DSA cost types", () => {
  it("defines the new cost types after Bn254G1Msm", () => {
    expect(xdr.ContractCostType.bn254G1Msm().value).toBe(85);
    expect(xdr.ContractCostType.mlDsa44DecodeVerifyingKey().value).toBe(86);
    expect(xdr.ContractCostType.mlDsa87DecodeSignature().value).toBe(91);
    expect(xdr.ContractCostType.verifyMlDsa87Sig().value).toBe(94);
  });
});

describe("CAP-88: millisecond close time stellar values", () => {
  const lcValueSignature = new xdr.LedgerCloseValueSignature({
    nodeId: xdr.PublicKey.publicKeyTypeEd25519(Buffer.alloc(32, 1)),
    signature: Buffer.from([1, 2, 3, 4]),
  });
  const closeTimeMs = xdr.Uint64.fromString("1760000000123");

  it("round-trips the STELLAR_VALUE_SIGNED_MS arm", () => {
    const ext = xdr.StellarValueExt.stellarValueSignedMs(
      new xdr.StellarValueSignedMsValue({ closeTimeMs, lcValueSignature }),
    );
    expect(ext.switch().value).toBe(3);

    const decoded = xdr.StellarValueExt.fromXDR(ext.toXDR());
    expect(decoded.switch().name).toBe("stellarValueSignedMs");
    expect(decoded.signedMsValue().closeTimeMs().toString()).toBe(
      "1760000000123",
    );
    expect(decoded.toXDR()).toEqual(ext.toXDR());
  });

  it("round-trips the STELLAR_VALUE_EMPTY_TX_SET_MS arm", () => {
    const ext = xdr.StellarValueExt.stellarValueEmptyTxSetMs(
      new xdr.StellarValueProposedMsValue({
        closeTimeMs,
        txSetHash: Buffer.alloc(32, 9),
        previousLedgerHash: Buffer.alloc(32, 8),
        previousLedgerVersion: 29,
        lcValueSignature,
      }),
    );
    expect(ext.switch().value).toBe(4);

    const decoded = xdr.StellarValueExt.fromXDR(ext.toXDR());
    expect(decoded.switch().name).toBe("stellarValueEmptyTxSetMs");
    expect(decoded.proposedMsValue().previousLedgerVersion()).toBe(29);
    expect(decoded.toXDR()).toEqual(ext.toXDR());
  });
});

describe("contract spec type name limit", () => {
  it("defines SC_SPEC_TYPE_NAME_LIMIT", () => {
    expect((xdr as any).SC_SPEC_TYPE_NAME_LIMIT).toBe(1024);
  });

  it.each([
    ["ScSpecUdtStructV0", { fields: [] }],
    ["ScSpecUdtUnionV0", { cases: [] }],
    ["ScSpecUdtEnumV0", { cases: [] }],
    ["ScSpecUdtErrorEnumV0", { cases: [] }],
  ] as const)("accepts %s names longer than 60 bytes", (type, rest) => {
    const name = "u".repeat(200);
    const Struct = (xdr as any)[type];
    const udt = new Struct({ doc: "", lib: "", name, ...rest });
    expect(Struct.fromXDR(udt.toXDR()).name().toString()).toBe(name);
  });

  it("accepts UDT names longer than the old 60-byte limit", () => {
    const name = "a".repeat(200);
    const udt = new xdr.ScSpecTypeUdt({ name });
    expect(xdr.ScSpecTypeUdt.fromXDR(udt.toXDR()).name().toString()).toBe(name);
  });

  it("accepts event names longer than a symbol", () => {
    const name = "e".repeat(100);
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name,
      prefixTopics: [],
      params: [],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
    });
    expect(xdr.ScSpecEventV0.fromXDR(event.toXDR()).name().toString()).toBe(
      name,
    );
  });

  it("rejects names over 1024 bytes", () => {
    const udt = new xdr.ScSpecTypeUdt({ name: "a".repeat(1025) });
    expect(() => udt.toXDR()).toThrow();
  });
});
