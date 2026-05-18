// Tests for the generic SEP-0051-style JSON walker (XdrValue.toJson /
// XdrValue.fromJson, backed by src/xdr/values/to-json.ts). Focus on
// shape contracts: how each kind/override renders, plus round-tripping
// through `fromJson(toJson(...))`.
import { describe, it, expect } from "vitest";
import { stringToUint8Array } from "uint8array-extras";

import {
  Asset,
  AlphaNum4,
  PublicKey,
  ScVal,
  ScAddress,
  Hash,
  Int128Parts,
  Uint128Parts,
  SignerKey,
  MuxedAccount,
  MuxedAccountMed25519,
  Memo,
} from "../../../../src/xdr/index.js";

const ED = new Uint8Array(32);
for (let i = 0; i < 32; i += 1) ED[i] = i + 1;

const STRKEY = "GAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSABOV"; // ED above

function asciiCode(s: string, length: number): Uint8Array {
  const buf = new Uint8Array(length);
  buf.set(stringToUint8Array(s));
  return buf;
}

describe("walker — primitives (SEP-0051 key naming)", () => {
  it("uint32 ScVal renders { u32: <number> }", () => {
    const v = ScVal.scvU32(42);
    expect(v.toJson()).toEqual({ u32: 42 });
  });

  it("uint64 ScVal renders { u64: <decimal string> }", () => {
    const v = ScVal.scvU64(123n);
    expect(v.toJson()).toEqual({ u64: "123" });
  });

  it("bool ScVal renders { bool: <boolean> } (case-name, not field name `b`)", () => {
    const v = ScVal.scvBool(true);
    expect(v.toJson()).toEqual({ bool: true });
  });

  it("void union arm renders snake_case case-name", () => {
    const v = Asset.assetTypeNative();
    expect(v.toJson()).toBe("native");
  });

  it("multi-token void case-names are snake-cased", () => {
    const v = ScVal.scvLedgerKeyContractInstance();
    expect(v.toJson()).toBe("ledger_key_contract_instance");
  });
});

describe("walker — overrides (StrKey)", () => {
  it("PublicKey emits G-strkey", () => {
    const pk = PublicKey.publicKeyTypeEd25519(ED);
    expect(pk.toJson()).toBe(STRKEY);
  });

  it("PublicKey round-trips through JSON", () => {
    const pk = PublicKey.publicKeyTypeEd25519(ED);
    const json = pk.toJson();
    const decoded = PublicKey.fromJson(json);
    expect(decoded.toXdr()).toEqual(pk.toXdr());
  });

  it("SignerKey hashX emits X-strkey", () => {
    const hashX = new Uint8Array(32).fill(7);
    const sk = SignerKey.signerKeyTypeHashX(hashX);
    expect(sk.toJson()).toMatch(/^X/);
    const round = SignerKey.fromJson(sk.toJson());
    expect(round.toXdr()).toEqual(sk.toXdr());
  });

  it("MuxedAccount KEY_TYPE_ED25519 emits G-strkey", () => {
    const m = MuxedAccount.keyTypeEd25519(ED);
    expect(m.toJson()).toBe(STRKEY);
  });

  it("MuxedAccount KEY_TYPE_MUXED_ED25519 emits M-strkey and round-trips", () => {
    const med = new MuxedAccountMed25519({ id: 42n, ed25519: ED });
    const m = MuxedAccount.keyTypeMuxedEd25519(med);
    const json = m.toJson();
    expect(typeof json).toBe("string");
    expect((json as string).startsWith("M")).toBe(true);
    const round = MuxedAccount.fromJson(json);
    expect(round.toXdr()).toEqual(m.toXdr());
  });

  it("ScAddress account emits G-strkey", () => {
    const addr = ScAddress.scAddressTypeAccount(
      PublicKey.publicKeyTypeEd25519(ED),
    );
    expect(addr.toJson()).toBe(STRKEY);
    const round = ScAddress.fromJson(addr.toJson());
    expect(round.toXdr()).toEqual(addr.toXdr());
  });

  it("ScAddress contract emits C-strkey", () => {
    const addr = ScAddress.scAddressTypeContract(new Hash(new Uint8Array(32)));
    expect((addr.toJson() as string).startsWith("C")).toBe(true);
    const round = ScAddress.fromJson(addr.toJson());
    expect(round.toXdr()).toEqual(addr.toXdr());
  });
});

describe("walker — wide-int parts collapse to decimal string", () => {
  it("Int128Parts emits decimal string when nested in ScVal.i128", () => {
    const parts = new Int128Parts({ hi: 0n, lo: 7n });
    const v = ScVal.scvI128(parts);
    expect(v.toJson()).toEqual({ i128: "7" });
  });

  it("negative Int128Parts round-trips through JSON", () => {
    const negParts = new Int128Parts({ hi: -1n, lo: (1n << 64n) - 5n });
    const v = ScVal.scvI128(negParts);
    expect(v.toJson()).toEqual({ i128: "-5" });
    const round = ScVal.fromJson(v.toJson());
    expect(round.toXdr()).toEqual(v.toXdr());
  });

  it("Uint128Parts emits decimal string", () => {
    const parts = new Uint128Parts({ hi: 1n, lo: 0n });
    const v = ScVal.scvU128(parts);
    expect(v.toJson()).toEqual({ u128: (1n << 64n).toString() });
  });
});

describe("walker — enums", () => {
  it("union switching on enum emits snake_case case-name", () => {
    const memo = Memo.memoNone();
    expect(memo.toJson()).toBe("none");
  });
});

describe("walker — structs (composite)", () => {
  it("AlphaNum4 emits {assetCode: hex, issuer: strkey}", () => {
    const an4 = new AlphaNum4({
      assetCode: asciiCode("USD", 4),
      issuer: PublicKey.publicKeyTypeEd25519(ED),
    });
    expect(an4.toJson()).toEqual({
      assetCode: "55534400",
      issuer: STRKEY,
    });
  });

  it("AlphaNum4 round-trips through fromJson", () => {
    const an4 = new AlphaNum4({
      assetCode: asciiCode("USD", 4),
      issuer: PublicKey.publicKeyTypeEd25519(ED),
    });
    const round = AlphaNum4.fromJson(an4.toJson());
    expect(round.toXdr()).toEqual(an4.toXdr());
  });

  it("Asset assetTypeCreditAlphanum4 emits { credit_alphanum4: structPayload }", () => {
    const usd = Asset.assetTypeCreditAlphanum4(
      new AlphaNum4({
        assetCode: asciiCode("USD", 4),
        issuer: PublicKey.publicKeyTypeEd25519(ED),
      }),
    );
    expect(usd.toJson()).toEqual({
      credit_alphanum4: {
        assetCode: "55534400",
        issuer: STRKEY,
      },
    });
    const round = Asset.fromJson(usd.toJson());
    expect(round.toXdr()).toEqual(usd.toXdr());
  });
});
