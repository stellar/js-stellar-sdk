import { describe, expect, it } from "vitest";

import {
  Asset,
  AssetCode4,
  AssetType,
  ExtensionPoint,
  Hash,
  Int128Parts,
  Int256Parts,
  ScVal,
  Signature,
  TransactionResultResult,
  Uint128Parts,
  Uint256Parts,
  XdrError,
} from "../../../src/base/generated/index.js";

describe("new XDR DX layer", () => {
  it("generates enum namespace fields for each variant", () => {
    expect(AssetType.assetTypeNative).toBe("assetTypeNative");
    expect(AssetType.assetTypeCreditAlphanum4).toBe("assetTypeCreditAlphanum4");
  });

  it("generates union constructors with normalized DX discriminants", () => {
    expect(ScVal.scvU32(10)).toEqual({ type: "scvU32", u32: 10 });
    expect(TransactionResultResult.txSuccess([])).toEqual({
      type: "txSuccess",
      results: [],
    });
  });

  it("converts normalized DX unions to schema switch keys", () => {
    expect(
      TransactionResultResult.toXDRObject({ type: "txSuccess", results: [] }),
    ).toEqual({
      code: 0,
      results: [],
    });

    expect(ExtensionPoint.toXDRObject(ExtensionPoint.case0())).toEqual({
      v: 0,
    });
    expect(ExtensionPoint.fromXDRObject({ v: 0 })).toEqual({ type: "case0" });
  });

  it("round-trips canonical JSON for bigint and bytes", () => {
    const value = ScVal.scvI64(-100n);
    const json = ScVal.toJSON(value);

    expect(json).toEqual({ type: "scvI64", i64: "-100" });
    expect(ScVal.fromJSON(json)).toEqual(value);

    const hash = new Uint8Array(32);
    hash[31] = 255;
    expect(Hash.toJSON(hash)).toBe(
      "00000000000000000000000000000000000000000000000000000000000000ff",
    );
    expect(Hash.fromJSON(Hash.toJSON(hash))).toEqual(hash);
  });

  it("rejects non-canonical byte JSON", () => {
    expect(() => Hash.fromJSON("abc")).toThrow(XdrError);
  });

  it("serializes through the generated schema codecs", () => {
    const value = ScVal.scvU32(10);
    const raw = ScVal.toXDR(value);

    expect(raw).toBeInstanceOf(Uint8Array);
    expect(ScVal.fromXDR(raw, "raw")).toEqual(value);
    expect(ScVal.fromXDR(ScVal.toXDR(value, "base64"))).toEqual(value);
  });

  it("rejects unknown union cases with a path-aware error", () => {
    expect(() =>
      TransactionResultResult.toXDRObject({
        type: "txBogus",
      } as unknown as TransactionResultResult),
    ).toThrow(/Unknown union case at <root>: txBogus/);
  });

  it("encodes asset codes as ASCII in JSON", () => {
    expect(AssetCode4.toJSON("USD\0")).toBe("USD\0");
    expect(AssetCode4.fromJSON("USD\0")).toBe("USD\0");
  });

  it("propagates ASCII encoding through nested asset structs", () => {
    const asset = Asset.assetTypeCreditAlphanum4({
      assetCode: "USD\0",
      issuer: {
        type: "publicKeyTypeEd25519",
        ed25519: new Uint8Array(32),
      },
    });
    const json = Asset.toJSON(asset) as { alphaNum4: { assetCode: string } };
    expect(json.alphaNum4.assetCode).toBe("USD\0");
  });

  it("encodes signatures as base64 in JSON", () => {
    const sig = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    expect(Signature.toJSON(sig)).toBe("3q2+7w==");
    expect(Signature.fromJSON("3q2+7w==")).toEqual(sig);
  });

  it("represents Int128Parts/UInt128Parts/Int256Parts/UInt256Parts as bigint", () => {
    // Round-trip through the wire codec. ScVal carries each width.
    const cases: Array<{ value: bigint; ctor: (v: bigint) => ScVal }> = [
      { value: 0n, ctor: ScVal.scvI128 },
      { value: 1n, ctor: ScVal.scvI128 },
      { value: -1n, ctor: ScVal.scvI128 },
      { value: (1n << 127n) - 1n, ctor: ScVal.scvI128 }, // MAX_INT128
      { value: -(1n << 127n), ctor: ScVal.scvI128 }, // MIN_INT128
      { value: 0n, ctor: ScVal.scvU128 },
      { value: (1n << 128n) - 1n, ctor: ScVal.scvU128 }, // MAX_UINT128
      { value: 0n, ctor: ScVal.scvI256 },
      { value: -1n, ctor: ScVal.scvI256 },
      { value: (1n << 255n) - 1n, ctor: ScVal.scvI256 }, // MAX_INT256
      { value: -(1n << 255n), ctor: ScVal.scvI256 }, // MIN_INT256
      { value: (1n << 256n) - 1n, ctor: ScVal.scvU256 }, // MAX_UINT256
    ];
    for (const { value, ctor } of cases) {
      const built = ctor(value);
      const round = ScVal.fromXDR(ScVal.toXDR(built), "raw");
      expect(round).toEqual(built);
    }
  });

  it("Int128Parts namespace round-trips through XDR and JSON", () => {
    expect(Int128Parts.toJSON(-1n)).toBe("-1");
    expect(Int128Parts.fromJSON("-1")).toBe(-1n);
    const round = Int128Parts.fromXDR(
      Int128Parts.toXDR(123456789012345678901234567890n),
    );
    expect(round).toBe(123456789012345678901234567890n);
  });

  it("rejects out-of-range wide-int values", () => {
    expect(() => Uint128Parts.toXDRObject(-1n)).toThrow(/uint128 out of range/);
    expect(() => Int128Parts.toXDRObject(1n << 127n)).toThrow(
      /int128 out of range/,
    );
    expect(() => Uint256Parts.toXDRObject(1n << 256n)).toThrow(
      /uint256 out of range/,
    );
    expect(() => Int256Parts.toXDRObject(1n << 255n)).toThrow(
      /int256 out of range/,
    );
  });

  it("rejects non-object union inputs with a path-aware error", () => {
    expect(() =>
      TransactionResultResult.toXDRObject(
        null as unknown as TransactionResultResult,
      ),
    ).toThrow(/Expected union at <root>, got null/);
  });
});
