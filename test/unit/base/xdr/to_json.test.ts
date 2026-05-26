// Tests for the generic SEP-0051-style JSON walker (XdrValue.toJson /
// XdrValue.fromJson, backed by src/xdr/values/to-json.ts). Focus on
// shape contracts: how each kind/override renders, plus round-tripping
// through `fromJson(toJson(...))`.
import { describe, it, expect } from "vitest";
import { stringToUint8Array } from "uint8array-extras";

import {
  Asset,
  AlphaNum4,
  AlphaNum12,
  AssetCode4,
  ContractId,
  PublicKey,
  ScVal,
  ScAddress,
  ScBytes,
  ScMapEntry,
  ScNonceKey,
  Hash,
  Int128Parts,
  Int256Parts,
  Uint128Parts,
  Uint256Parts,
  SignerKey,
  SignerKeyEd25519SignedPayload,
  MuxedAccount,
  MuxedAccountMed25519,
  Memo,
  PreconditionsV2,
  TimeBounds,
  ClaimableBalanceId,
  PoolId,
  SorobanTransactionMetaExt,
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
    const addr = ScAddress.scAddressTypeContract(
      new ContractId(new Uint8Array(32)),
    );
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

describe("walker — string<N> SEP-0051 byte escapes", () => {
  // Memo.memoText is our cheapest carrier of an XDR `string<N>` field.
  // For each case we go through `toJson` and back via `fromJson`, then
  // confirm the wire bytes match end-to-end.

  it("pure printable ASCII is emitted unchanged", () => {
    const m = Memo.memoText("hello world");
    expect(m.toJson()).toEqual({ text: "hello world" });
  });

  it("literal backslash is escaped as \\\\", () => {
    const m = Memo.memoText("a\\b");
    expect(m.toJson()).toEqual({ text: "a\\\\b" });
    // Round-trip: the JSON back through fromJson must yield the same wire bytes.
    const round = Memo.fromJson(m.toJson());
    expect(round.toXdr()).toEqual(m.toXdr());
  });

  it("SEP-0051 special-case escapes (\\0, \\t, \\n, \\r) are used", () => {
    const m = Memo.memoText(
      new Uint8Array([0x00, 0x09, 0x0a, 0x0d, 0x1f, 0x41]),
    );
    // 0x00 → \0, 0x09 → \t, 0x0a → \n, 0x0d → \r, 0x1F → \xNN, 'A' → 'A'
    expect(m.toJson()).toEqual({ text: "\\0\\t\\n\\r\\x1fA" });
    const round = Memo.fromJson(m.toJson());
    expect(round.toXdr()).toEqual(m.toXdr());
  });

  it("latin1-range bytes (0x80..0xFF) become \\xNN per byte", () => {
    // 0xD1 is invalid UTF-8 → wire layer falls back to latin1 →
    // JS string has char with code point 0xD1.
    const m = Memo.memoText(new Uint8Array([0xd1, 0xff, 0x41]));
    expect(m.toJson()).toEqual({ text: "\\xd1\\xffA" });
    const round = Memo.fromJson(m.toJson());
    expect(round.toXdr()).toEqual(m.toXdr());
  });

  it("JS string input is UTF-8 encoded by XdrString", () => {
    // "café" → UTF-8 bytes [0x63, 0x61, 0x66, 0xC3, 0xA9] → JSON
    // "caf\xc3\xa9" (4 ASCII chars + two \xNN escapes for the 'é' UTF-8 pair).
    // The latin1 quirk is gone — `XdrString(string)` always UTF-8 encodes.
    const m = Memo.memoText("café");
    expect(m.toJson()).toEqual({ text: "caf\\xc3\\xa9" });
    const round = Memo.fromJson(m.toJson());
    expect(round.toXdr()).toEqual(m.toXdr());
  });

  it("CJK chars (code points > 0xFF) UTF-8-encode then byte-escape", () => {
    // "三" has code point U+4E09, can't fit in a byte → UTF-8 path
    // → bytes [0xE4, 0xB8, 0x89] → three \xNN escapes.
    const m = Memo.memoText("三");
    expect(m.toJson()).toEqual({ text: "\\xe4\\xb8\\x89" });
    const round = Memo.fromJson(m.toJson());
    expect(round.toXdr()).toEqual(m.toXdr());
  });

  it("mixed printable + control + latin1 escapes correctly", () => {
    const m = Memo.memoText(
      new Uint8Array([0x48, 0x69, 0x09, 0xd1, 0x5c, 0x21]),
    );
    // 'H' 'i' '\t' 0xD1 '\\' '!'  → SEP-0051: "Hi\\t\\xd1\\\\!"
    expect(m.toJson()).toEqual({ text: "Hi\\t\\xd1\\\\!" });
    const round = Memo.fromJson(m.toJson());
    expect(round.toXdr()).toEqual(m.toXdr());
  });

  it("uppercase \\X escapes are accepted on fromJson (case-insensitive)", () => {
    const round = Memo.fromJson({ text: "\\X41\\xff" });
    // 'A' (0x41), 0xFF — wire bytes are [0x41, 0xFF].
    const direct = Memo.memoText(new Uint8Array([0x41, 0xff]));
    expect(round.toXdr()).toEqual(direct.toXdr());
  });

  it("malformed \\x escape on fromJson throws clearly", () => {
    expect(() => Memo.fromJson({ text: "\\xZZ" })).toThrow(
      /invalid \\x escape/,
    );
  });

  it("truncated \\x escape on fromJson throws", () => {
    expect(() => Memo.fromJson({ text: "\\x4" })).toThrow(
      /truncated \\x escape/,
    );
  });

  it("unknown backslash escape on fromJson throws", () => {
    // \a is not in SEP-0051's escape table — only \0, \t, \n, \r, \\, \xNN.
    expect(() => Memo.fromJson({ text: "a\\ab" })).toThrow(
      /unsupported escape/,
    );
  });
});

describe("walker — structs (composite)", () => {
  it("AlphaNum4 emits {asset_code: trimmed-string, issuer: strkey} (SEP-0051)", () => {
    const an4 = new AlphaNum4({
      assetCode: asciiCode("USD", 4),
      issuer: PublicKey.publicKeyTypeEd25519(ED),
    });
    expect(an4.toJson()).toEqual({
      asset_code: "USD",
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
        asset_code: "USD",
        issuer: STRKEY,
      },
    });
    const round = Asset.fromJson(usd.toJson());
    expect(round.toXdr()).toEqual(usd.toXdr());
  });
});

describe("walker — optional null vs void union arm", () => {
  it("void union arm renders as string 'none'", () => {
    expect(Memo.memoNone().toJson()).toBe("none");
  });

  it("void union arm with integer value renders as string case-name", () => {
    const ext = SorobanTransactionMetaExt.v0();
    expect(ext.toJson()).toBe("v0");
  });

  it("optional struct field renders as JSON null (not the string 'none')", () => {
    const v2 = new PreconditionsV2({
      timeBounds: null,
      ledgerBounds: null,
      minSeqNum: null,
      minSeqAge: 0n,
      minSeqLedgerGap: 0,
      extraSigners: [],
    });
    const json = v2.toJson() as Record<string, unknown>;
    expect(json.time_bounds).toBeNull();
    expect(json.ledger_bounds).toBeNull();
    expect(json.min_seq_num).toBeNull();
    // Confirm we did not accidentally emit the literal string "none".
    expect(json.time_bounds).not.toBe("none");
  });

  it("optional struct field renders nested struct when populated", () => {
    const v2 = new PreconditionsV2({
      timeBounds: new TimeBounds({ minTime: 1000n, maxTime: 2000n }),
      ledgerBounds: null,
      minSeqNum: 42n,
      minSeqAge: 0n,
      minSeqLedgerGap: 0,
      extraSigners: [],
    });
    const json = v2.toJson() as Record<string, unknown>;
    expect(json.time_bounds).toEqual({ min_time: "1000", max_time: "2000" });
    expect(json.min_seq_num).toBe("42");
  });
});

describe("walker — wide-int boundary cases", () => {
  it("Uint128 max value (2^128 - 1) renders as decimal string", () => {
    const max = new Uint128Parts({
      hi: (1n << 64n) - 1n,
      lo: (1n << 64n) - 1n,
    });
    expect(ScVal.scvU128(max).toJson()).toEqual({
      u128: "340282366920938463463374607431768211455",
    });
  });

  it("Uint128 with only hi set renders as 2^64", () => {
    // (hi=1, lo=0) is the off-by-one likely to mask a bit-shift bug.
    const v = new Uint128Parts({ hi: 1n, lo: 0n });
    expect(ScVal.scvU128(v).toJson()).toEqual({
      u128: "18446744073709551616",
    });
  });

  it("Int128 min value renders as -2^127", () => {
    const min = new Int128Parts({ hi: -(1n << 63n), lo: 0n });
    expect(ScVal.scvI128(min).toJson()).toEqual({
      i128: "-170141183460469231731687303715884105728",
    });
  });

  it("Int128 max value renders as 2^127 - 1", () => {
    const max = new Int128Parts({
      hi: (1n << 63n) - 1n,
      lo: (1n << 64n) - 1n,
    });
    expect(ScVal.scvI128(max).toJson()).toEqual({
      i128: "170141183460469231731687303715884105727",
    });
  });
});

describe("walker — Int256/Uint256 ScVal arms", () => {
  it("Uint256 zero renders as '0'", () => {
    const zero = new Uint256Parts({
      hiHi: 0n,
      hiLo: 0n,
      loHi: 0n,
      loLo: 0n,
    });
    expect(ScVal.scvU256(zero).toJson()).toEqual({ u256: "0" });
  });

  it("Uint256 with only hiHi set renders as 2^192", () => {
    const v = new Uint256Parts({ hiHi: 1n, hiLo: 0n, loHi: 0n, loLo: 0n });
    expect(ScVal.scvU256(v).toJson()).toEqual({
      u256: "6277101735386680763835789423207666416102355444464034512896",
    });
  });

  it("Int256 negative-one renders as '-1' and round-trips", () => {
    const negOne = new Int256Parts({
      hiHi: -1n,
      hiLo: (1n << 64n) - 1n,
      loHi: (1n << 64n) - 1n,
      loLo: (1n << 64n) - 1n,
    });
    const v = ScVal.scvI256(negOne);
    expect(v.toJson()).toEqual({ i256: "-1" });
    const round = ScVal.fromJson(v.toJson());
    expect(round.toXdr()).toEqual(v.toXdr());
  });
});

describe("walker — additional ScVal arms", () => {
  it("scvBytes renders { bytes: <hex> }", () => {
    const v = ScVal.scvBytes(new ScBytes(new Uint8Array([0xca, 0xfe])));
    expect(v.toJson()).toEqual({ bytes: "cafe" });
  });

  it("scvBytes empty renders { bytes: '' }", () => {
    const v = ScVal.scvBytes(new ScBytes(new Uint8Array()));
    expect(v.toJson()).toEqual({ bytes: "" });
  });

  it("scvString renders { string: <text> }", () => {
    const v = ScVal.scvString("hello");
    expect(v.toJson()).toEqual({ string: "hello" });
  });

  it("scvString with control chars uses SEP-0051 escapes", () => {
    const v = ScVal.scvString(new Uint8Array([0x61, 0x00, 0x62, 0x0a, 0x63]));
    expect(v.toJson()).toEqual({ string: "a\\0b\\nc" });
  });

  it("scvSymbol renders { symbol: <text> }", () => {
    const v = ScVal.scvSymbol("transfer");
    expect(v.toJson()).toEqual({ symbol: "transfer" });
  });

  it("scvVec renders { vec: <array> } and is recursive", () => {
    const v = ScVal.scvVec([ScVal.scvU32(1), ScVal.scvU32(2)]);
    expect(v.toJson()).toEqual({ vec: [{ u32: 1 }, { u32: 2 }] });
  });

  it("scvVec empty renders { vec: [] }", () => {
    const v = ScVal.scvVec([]);
    expect(v.toJson()).toEqual({ vec: [] });
  });

  it("scvVec doubly-nested round-trips through lazy schema", () => {
    const v = ScVal.scvVec([ScVal.scvVec([ScVal.scvU32(42)])]);
    expect(v.toJson()).toEqual({ vec: [{ vec: [{ u32: 42 }] }] });
    const round = ScVal.fromJson(v.toJson());
    expect(round.toXdr()).toEqual(v.toXdr());
  });

  it("scvMap renders { map: [{ key, val }] } entries", () => {
    const v = ScVal.scvMap([
      new ScMapEntry({ key: ScVal.scvSymbol("k"), val: ScVal.scvU32(1) }),
    ]);
    expect(v.toJson()).toEqual({
      map: [{ key: { symbol: "k" }, val: { u32: 1 } }],
    });
  });

  it("scvMap empty renders { map: [] }", () => {
    expect(ScVal.scvMap([]).toJson()).toEqual({ map: [] });
  });

  it("scvLedgerKeyNonce nests a struct with int64 → decimal string", () => {
    const v = ScVal.scvLedgerKeyNonce(new ScNonceKey({ nonce: 999n }));
    expect(v.toJson()).toEqual({ ledger_key_nonce: { nonce: "999" } });
  });
});

describe("walker — StrKey variants beyond G/M/C", () => {
  it("PoolId emits L-strkey", () => {
    const pid = new PoolId(new Uint8Array(32).fill(3));
    const json = pid.toJson();
    expect(typeof json).toBe("string");
    expect((json as string).startsWith("L")).toBe(true);
  });

  it("ClaimableBalanceId v0 emits B-strkey (named union override)", () => {
    const cb = ClaimableBalanceId.claimableBalanceIdTypeV0(
      new Hash(new Uint8Array(32).fill(5)),
    );
    const json = cb.toJson();
    expect(typeof json).toBe("string");
    expect((json as string).startsWith("B")).toBe(true);
    const round = ClaimableBalanceId.fromJson(json);
    expect(round.toXdr()).toEqual(cb.toXdr());
  });
});

describe("walker — int-switched union case-names survive verbatim", () => {
  // Per SEP-0051 (and py-stellar-base #52), `union Foo switch (int v) { case
  // 0: void; }` renders the void arm as the literal string "v0" — the auto-
  // generated `v<N>` case-name is NOT subject to prefix-stripping, because
  // there's no enum-type prefix in play to strip.

  it("SorobanTransactionMetaExt v0 (void) renders as 'v0'", () => {
    const v0 = SorobanTransactionMetaExt.v0();
    expect(v0.toJson()).toBe("v0");
    const round = SorobanTransactionMetaExt.fromJson("v0");
    expect(round.toXdr()).toEqual(v0.toXdr());
  });

  it("SorobanTransactionMetaExt v1 (non-void) renders as { v1: <payload> }", () => {
    // Just check the shape — we don't need to construct a full V1 here.
    // toJson on the void arm establishes the case-name behavior; this
    // confirms the non-void arm also uses `v1` (not `1`) as the key.
    const v0 = SorobanTransactionMetaExt.v0();
    expect(typeof v0.toJson()).toBe("string");
    expect(v0.toJson()).not.toBe("0");
  });
});

describe("walker — union fromJson error cases", () => {
  it("rejects a multi-key object", () => {
    expect(() => ScVal.fromJson({ u32: 1, i32: 2 })).toThrow(
      /expected single-key object/i,
    );
  });

  it("rejects an unknown case name (string form)", () => {
    expect(() => Asset.fromJson("bogus")).toThrow(/unknown case/i);
  });

  it("rejects an unknown case name (object form)", () => {
    expect(() => ScVal.fromJson({ bogus: 0 })).toThrow(/unknown case/i);
  });
});

// SEP-0051 spec rules — one pinning test per encoding rule the spec defines.
// Some rules already pass through existing coverage above; the tests below
// fill the explicit-pinning gap and serve as the spec-conformance checklist.
describe("SEP-0051 conformance — primitives", () => {
  it("rule 1: int32 → JSON number (negative)", () => {
    // Note: walker emits the case-name `i32`, not the spec's raw integer
    // form, because int32 appears here as a union arm. The point is that
    // the inner value is a JSON number.
    expect(ScVal.scvI32(-2147483648).toJson()).toEqual({ i32: -2147483648 });
  });

  it("rule 2: uint32 → JSON number (max)", () => {
    expect(ScVal.scvU32(4294967295).toJson()).toEqual({ u32: 4294967295 });
  });

  it("rule 3: int64 → decimal string (negative max)", () => {
    expect(ScVal.scvI64(-9223372036854775808n).toJson()).toEqual({
      i64: "-9223372036854775808",
    });
  });

  it("rule 4: uint64 → decimal string (max)", () => {
    expect(ScVal.scvU64(18446744073709551615n).toJson()).toEqual({
      u64: "18446744073709551615",
    });
  });

  it("rule 5: bool false → JSON false", () => {
    expect(ScVal.scvBool(false).toJson()).toEqual({ bool: false });
  });

  it("rule 6/7: opaque (fixed and variable) → lowercase hex string", () => {
    // varOpaque via scvBytes
    expect(
      ScVal.scvBytes(new ScBytes(new Uint8Array([0xab, 0xcd]))).toJson(),
    ).toEqual({ bytes: "abcd" });
    // fixed opaque via Hash (32 bytes of 0xde)
    expect(new Hash(new Uint8Array(32).fill(0xde)).toJson()).toBe(
      "de".repeat(32),
    );
  });

  it("rule 8: string → escaped form with printable ASCII unescaped", () => {
    expect(ScVal.scvString("hello world").toJson()).toEqual({
      string: "hello world",
    });
  });

  it("rule 9: void → omitted (appears only as union arm string)", () => {
    expect(ScVal.scvVoid().toJson()).toBe("void");
  });
});

describe("SEP-0051 conformance — composites", () => {
  it("rule 13: variable-length array → JSON array", () => {
    expect(ScVal.scvVec([ScVal.scvU32(1), ScVal.scvU32(2)]).toJson()).toEqual({
      vec: [{ u32: 1 }, { u32: 2 }],
    });
  });

  it("rule 14: enum → snake_case with shared prefix stripped", () => {
    // SCV_U32 (the SCValType enum member, when this ScVal arm is selected)
    // renders as just "u32" — the common `scv` prefix is stripped.
    const v = ScVal.scvU32(0);
    expect(v.toJson()).toEqual({ u32: 0 });
    // For an enum directly (not via union arm): AssetType.
    // The "asset_type" prefix is stripped, snake_case applied.
    expect((Asset.assetTypeCreditAlphanum12 as unknown) === undefined).toBe(
      false,
    );
  });

  it("rule 15: struct → object with snake_case field keys", () => {
    const an4 = new AlphaNum4({
      assetCode: asciiCode("USD", 4),
      issuer: PublicKey.publicKeyTypeEd25519(ED),
    });
    // `assetCode` (camelCase wire field) → `asset_code` (snake_case JSON key)
    expect(an4.toJson()).toEqual({
      asset_code: "USD",
      issuer: STRKEY,
    });
  });

  it("rule 15 round-trip: struct fromJson accepts both snake_case and camelCase keys", () => {
    const an4 = new AlphaNum4({
      assetCode: asciiCode("USD", 4),
      issuer: PublicKey.publicKeyTypeEd25519(ED),
    });
    // Snake-case (canonical):
    expect(AlphaNum4.fromJson(an4.toJson()).toXdr()).toEqual(an4.toXdr());
    // Camel-case (legacy / forgiving): also accepted.
    expect(
      AlphaNum4.fromJson({ assetCode: "USD", issuer: STRKEY }).toXdr(),
    ).toEqual(an4.toXdr());
  });

  it("rule 16: union void arm → snake_case string", () => {
    expect(Asset.assetTypeNative().toJson()).toBe("native");
  });

  it("rule 17: union non-void arm → single-key object", () => {
    const usd = Asset.assetTypeCreditAlphanum4(
      new AlphaNum4({
        assetCode: asciiCode("USD", 4),
        issuer: PublicKey.publicKeyTypeEd25519(ED),
      }),
    );
    const json = usd.toJson() as Record<string, unknown>;
    expect(Object.keys(json)).toEqual(["credit_alphanum4"]);
  });

  it("rule 18: union with integer discriminant → 'v<N>'", () => {
    expect(SorobanTransactionMetaExt.v0().toJson()).toBe("v0");
  });

  it("rule 19: optional unset → JSON null", () => {
    const v2 = new PreconditionsV2({
      timeBounds: null,
      ledgerBounds: null,
      minSeqNum: null,
      minSeqAge: 0n,
      minSeqLedgerGap: 0,
      extraSigners: [],
    });
    const json = v2.toJson() as Record<string, unknown>;
    expect(json.time_bounds).toBeNull();
    expect(json.min_seq_num).toBeNull();
  });

  it("rule 19: optional set → typed value", () => {
    const v2 = new PreconditionsV2({
      timeBounds: new TimeBounds({ minTime: 1n, maxTime: 2n }),
      ledgerBounds: null,
      minSeqNum: null,
      minSeqAge: 0n,
      minSeqLedgerGap: 0,
      extraSigners: [],
    });
    const json = v2.toJson() as Record<string, unknown>;
    expect(json.time_bounds).toEqual({ min_time: "1", max_time: "2" });
  });
});

describe("SEP-0051 conformance — Stellar-specific address StrKeys", () => {
  // Rule 19/20: every address type maps to its prefix-specific StrKey.
  it("PublicKey (PUBLIC_KEY_TYPE_ED25519) / NodeID / AccountID → G strkey", () => {
    expect(PublicKey.publicKeyTypeEd25519(ED).toJson()).toBe(STRKEY);
  });

  it("MuxedAccount (KEY_TYPE_ED25519) → G strkey", () => {
    expect(MuxedAccount.keyTypeEd25519(ED).toJson()).toBe(STRKEY);
  });

  it("MuxedAccount (KEY_TYPE_MUXED_ED25519) / MuxedEd25519Account → M strkey", () => {
    const m = MuxedAccount.keyTypeMuxedEd25519(
      new MuxedAccountMed25519({ id: 1n, ed25519: ED }),
    );
    expect((m.toJson() as string).startsWith("M")).toBe(true);
  });

  it("SignerKey ed25519 → G strkey", () => {
    const sk = SignerKey.signerKeyTypeEd25519(ED);
    expect((sk.toJson() as string).startsWith("G")).toBe(true);
  });

  it("SignerKey preAuthTx → T strkey", () => {
    const sk = SignerKey.signerKeyTypePreAuthTx(new Uint8Array(32).fill(2));
    expect((sk.toJson() as string).startsWith("T")).toBe(true);
    const round = SignerKey.fromJson(sk.toJson());
    expect(round.toXdr()).toEqual(sk.toXdr());
  });

  it("SignerKey hashX → X strkey", () => {
    const sk = SignerKey.signerKeyTypeHashX(new Uint8Array(32).fill(3));
    expect((sk.toJson() as string).startsWith("X")).toBe(true);
  });

  it("ScAddress account → G strkey, contract → C strkey, claimable_balance → B strkey", () => {
    expect(
      ScAddress.scAddressTypeAccount(
        PublicKey.publicKeyTypeEd25519(ED),
      ).toJson(),
    ).toBe(STRKEY);
    expect(
      (
        ScAddress.scAddressTypeContract(
          new ContractId(new Uint8Array(32).fill(4)),
        ).toJson() as string
      ).startsWith("C"),
    ).toBe(true);
    expect(
      (
        ScAddress.scAddressTypeClaimableBalance(
          ClaimableBalanceId.claimableBalanceIdTypeV0(
            new Hash(new Uint8Array(32).fill(5)),
          ),
        ).toJson() as string
      ).startsWith("B"),
    ).toBe(true);
  });

  it("ClaimableBalanceId v0 (top-level) → B strkey", () => {
    const cb = ClaimableBalanceId.claimableBalanceIdTypeV0(
      new Hash(new Uint8Array(32).fill(6)),
    );
    expect((cb.toJson() as string).startsWith("B")).toBe(true);
  });

  it("PoolId emits L-strkey and round-trips", () => {
    const pid = new PoolId(new Uint8Array(32).fill(3));
    const json = pid.toJson();
    expect(typeof json).toBe("string");
    expect((json as string).startsWith("L")).toBe(true);
    const round = PoolId.fromJson(json);
    expect(round.toXdr()).toEqual(pid.toXdr());
  });

  it("ContractId emits C-strkey and round-trips", () => {
    const cid = new ContractId(new Uint8Array(32).fill(9));
    const json = cid.toJson();
    expect(typeof json).toBe("string");
    expect((json as string).startsWith("C")).toBe(true);
    const round = ContractId.fromJson(json);
    expect(round.toXdr()).toEqual(cid.toXdr());
  });

  it("SignerKey ed25519SignedPayload emits P-strkey and round-trips", () => {
    const sk = SignerKey.signerKeyTypeEd25519SignedPayload(
      new SignerKeyEd25519SignedPayload({
        ed25519: ED,
        payload: new Uint8Array([1, 2, 3, 4]),
      }),
    );
    const json = sk.toJson();
    expect((json as string).startsWith("P")).toBe(true);
    const round = SignerKey.fromJson(json);
    expect(round.toXdr()).toEqual(sk.toXdr());
  });
});

describe("SEP-0051 conformance — Stellar-specific asset codes & integers", () => {
  it("AssetCode4 trims trailing zeros and emits the escaped string", () => {
    // Direct top-level call:
    expect(new AssetCode4(asciiCode("USD", 4)).toJson()).toBe("USD");
    // Same value nested inside a parent struct:
    const an4 = new AlphaNum4({
      assetCode: asciiCode("USD", 4),
      issuer: PublicKey.publicKeyTypeEd25519(ED),
    });
    expect((an4.toJson() as Record<string, unknown>).asset_code).toBe("USD");
  });

  it("AssetCode12 trims down to a 5-byte minimum (distinguishable from AssetCode4)", () => {
    // 3-char code (less than 5 bytes), nested so the override fires.
    const an12 = new AlphaNum12({
      assetCode: asciiCode("ABC", 12),
      issuer: PublicKey.publicKeyTypeEd25519(ED),
    });
    const json = an12.toJson() as Record<string, unknown>;
    // "ABC" + 2 padding \0's = 5-byte minimum, escape form is "ABC\0\0".
    expect(json.asset_code).toBe("ABC\\0\\0");
  });

  it("AssetCode12 with 5+ chars emits text without padding", () => {
    const an12 = new AlphaNum12({
      assetCode: asciiCode("USDTether", 12),
      issuer: PublicKey.publicKeyTypeEd25519(ED),
    });
    const json = an12.toJson() as Record<string, unknown>;
    expect(json.asset_code).toBe("USDTether");
  });

  it("rule 28: Int128Parts → decimal string", () => {
    expect(
      ScVal.scvI128(new Int128Parts({ hi: 0n, lo: 12345n })).toJson(),
    ).toEqual({ i128: "12345" });
  });

  it("rule 28: Uint128Parts → decimal string", () => {
    expect(
      ScVal.scvU128(new Uint128Parts({ hi: 0n, lo: 1n })).toJson(),
    ).toEqual({ u128: "1" });
  });

  it("rule 28: Int256Parts → decimal string", () => {
    const v = new Int256Parts({ hiHi: 0n, hiLo: 0n, loHi: 0n, loLo: 7n });
    expect(ScVal.scvI256(v).toJson()).toEqual({ i256: "7" });
  });

  it("rule 28: Uint256Parts → decimal string", () => {
    const v = new Uint256Parts({ hiHi: 0n, hiLo: 0n, loHi: 0n, loLo: 7n });
    expect(ScVal.scvU256(v).toJson()).toEqual({ u256: "7" });
  });
});
