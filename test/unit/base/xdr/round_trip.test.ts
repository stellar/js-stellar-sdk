// Byte-compatibility round-trip tests against the legacy @stellar/js-xdr
// runtime (preserved at test/fixtures/legacy-xdr/). For each shape, we encode
// the same logical value through both layers and assert byte equality. If
// these tests pass, the new class-based runtime in src/xdr/ produces the
// same wire bytes as the legacy layer it replaces.
//
// Add new shapes liberally — these tests are cheap and the legacy layer is
// frozen, so any divergence is a real bug in the new runtime.
import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { stringToUint8Array } from "uint8array-extras";

// Legacy oracle — frozen copy of the @stellar/js-xdr-backed runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import legacyTypes from "../../../fixtures/legacy-xdr/curr_generated.js";
const legacy = legacyTypes as any;

// New class-based runtime.
import {
  Asset,
  AlphaNum4,
  AlphaNum12,
  PublicKey,
  MuxedAccount,
  MuxedAccountMed25519,
  Memo,
  ScVal,
  ScAddress,
  Hash,
  Int128,
  Uint128,
  Int128Parts,
  Operation,
  OperationBody,
  PaymentOp,
  TransactionEnvelope,
  TransactionV1Envelope,
  Transaction,
  Preconditions,
  TransactionExt,
  Memo as MemoVal,
} from "../../../../src/xdr/index.js";

const ED = new Uint8Array(32);
for (let i = 0; i < 32; i += 1) ED[i] = i + 1;

function asciiCode(s: string, length: number): Uint8Array {
  const buf = new Uint8Array(length);
  buf.set(stringToUint8Array(s));
  return buf;
}

// Buffer extends Uint8Array, but vitest's deep equality distinguishes them.
// Compare via hex strings instead — clearer failure output too.
function asHex(buf: Uint8Array | Buffer): string {
  return Buffer.from(buf).toString("hex");
}

function expectBytesEqual(
  a: Uint8Array | Buffer,
  b: Uint8Array | Buffer,
): void {
  expect(asHex(a)).toBe(asHex(b));
}

describe("round-trip: PublicKey (single-arm union, opaque payload)", () => {
  it("ed25519 matches legacy bytes", () => {
    const next = PublicKey.publicKeyTypeEd25519(ED).toXdr();
    const lgcy = legacy.PublicKey.publicKeyTypeEd25519(Buffer.from(ED)).toXDR();
    expectBytesEqual(next, lgcy);
  });
});

describe("round-trip: Asset (union with void + struct payload arms)", () => {
  it("native (void arm) matches legacy", () => {
    const next = Asset.assetTypeNative().toXdr();
    const lgcy = legacy.Asset.assetTypeNative().toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("credit_alphanum4 matches legacy", () => {
    const next = Asset.assetTypeCreditAlphanum4(
      new AlphaNum4({
        assetCode: asciiCode("USD", 4),
        issuer: PublicKey.publicKeyTypeEd25519(ED),
      }),
    ).toXdr();
    const lgcy = legacy.Asset.assetTypeCreditAlphanum4(
      new legacy.AlphaNum4({
        assetCode: Buffer.from(asciiCode("USD", 4)),
        issuer: legacy.AccountId.publicKeyTypeEd25519(Buffer.from(ED)),
      }),
    ).toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("credit_alphanum12 matches legacy", () => {
    const next = Asset.assetTypeCreditAlphanum12(
      new AlphaNum12({
        assetCode: asciiCode("USDTether", 12),
        issuer: PublicKey.publicKeyTypeEd25519(ED),
      }),
    ).toXdr();
    const lgcy = legacy.Asset.assetTypeCreditAlphanum12(
      new legacy.AlphaNum12({
        assetCode: Buffer.from(asciiCode("USDTether", 12)),
        issuer: legacy.AccountId.publicKeyTypeEd25519(Buffer.from(ED)),
      }),
    ).toXDR();
    expectBytesEqual(next, lgcy);
  });
});

describe("round-trip: MuxedAccount (mixed-discriminant union)", () => {
  it("ed25519 arm matches legacy", () => {
    const next = MuxedAccount.keyTypeEd25519(ED).toXdr();
    const lgcy = legacy.MuxedAccount.keyTypeEd25519(Buffer.from(ED)).toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("med25519 arm matches legacy", () => {
    const next = MuxedAccount.keyTypeMuxedEd25519(
      new MuxedAccountMed25519({ id: 42n, ed25519: ED }),
    ).toXdr();
    const lgcy = legacy.MuxedAccount.keyTypeMuxedEd25519(
      new legacy.MuxedAccountMed25519({
        id: legacy.Uint64.fromString("42"),
        ed25519: Buffer.from(ED),
      }),
    ).toXDR();
    expectBytesEqual(next, lgcy);
  });
});

describe("round-trip: ScVal (cyclic / lazy schema)", () => {
  it("scvU32 (primitive int arm) matches legacy", () => {
    const next = ScVal.scvU32(42).toXdr();
    const lgcy = legacy.ScVal.scvU32(42).toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("scvBool true matches legacy", () => {
    const next = ScVal.scvBool(true).toXdr();
    const lgcy = legacy.ScVal.scvBool(true).toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("scvVec (recursive) matches legacy", () => {
    const inner = [ScVal.scvU32(1), ScVal.scvU32(2), ScVal.scvBool(false)];
    const next = ScVal.scvVec(inner).toXdr();
    const lgcy = legacy.ScVal.scvVec([
      legacy.ScVal.scvU32(1),
      legacy.ScVal.scvU32(2),
      legacy.ScVal.scvBool(false),
    ]).toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("scvI128 (wide-int parts struct) matches legacy", () => {
    const parts = new Int128Parts({ hi: -1n, lo: (1n << 64n) - 5n });
    const next = ScVal.scvI128(parts).toXdr();
    const lgcy = legacy.ScVal.scvI128(
      new legacy.Int128Parts({
        hi: legacy.Int64.fromString("-1"),
        lo: legacy.Uint64.fromString(((1n << 64n) - 5n).toString()),
      }),
    ).toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("scvLedgerKeyContractInstance (void arm) matches legacy", () => {
    const next = ScVal.scvLedgerKeyContractInstance().toXdr();
    const lgcy = legacy.ScVal.scvLedgerKeyContractInstance().toXDR();
    expectBytesEqual(next, lgcy);
  });
});

describe("round-trip: DX wide-int wrappers vs legacy parts", () => {
  it("Int128 negative value emits same parts bytes", () => {
    const v = new Int128(-(1n << 100n));
    const next = v.toXdr();
    const partsWire = v.toParts();
    const lgcy = new legacy.Int128Parts({
      hi: legacy.Int64.fromString(partsWire.hi.toString()),
      lo: legacy.Uint64.fromString(partsWire.lo.toString()),
    }).toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("Uint128 max value emits same parts bytes", () => {
    const v = new Uint128((1n << 128n) - 1n);
    const next = v.toXdr();
    const partsWire = v.toParts();
    const lgcy = new legacy.UInt128Parts({
      hi: legacy.Uint64.fromString(partsWire.hi.toString()),
      lo: legacy.Uint64.fromString(partsWire.lo.toString()),
    }).toXDR();
    expectBytesEqual(next, lgcy);
  });
});

describe("round-trip: ScAddress (every variant)", () => {
  it("account arm matches legacy", () => {
    const next = ScAddress.scAddressTypeAccount(
      PublicKey.publicKeyTypeEd25519(ED),
    ).toXdr();
    const lgcy = legacy.ScAddress.scAddressTypeAccount(
      legacy.PublicKey.publicKeyTypeEd25519(Buffer.from(ED)),
    ).toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("contract arm matches legacy", () => {
    const contractId = new Uint8Array(32).fill(9);
    const next = ScAddress.scAddressTypeContract(new Hash(contractId)).toXdr();
    const lgcy = legacy.ScAddress.scAddressTypeContract(
      Buffer.from(contractId),
    ).toXDR();
    expectBytesEqual(next, lgcy);
  });
});

describe("round-trip: Memo (union switching on enum)", () => {
  it("memoNone (void) matches legacy", () => {
    const next = Memo.memoNone().toXdr();
    const lgcy = legacy.Memo.memoNone().toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("memoText matches legacy", () => {
    const next = Memo.memoText("hello").toXdr();
    const lgcy = legacy.Memo.memoText("hello").toXDR();
    expectBytesEqual(next, lgcy);
  });

  it("memoId matches legacy", () => {
    const next = Memo.memoId(12345n).toXdr();
    const lgcy = legacy.Memo.memoId(legacy.Uint64.fromString("12345")).toXDR();
    expectBytesEqual(next, lgcy);
  });
});

describe("round-trip: nested transaction body (Operation w/ payment)", () => {
  it("payment operation body matches legacy", () => {
    const destination = MuxedAccount.keyTypeEd25519(ED);
    const next = new Operation({
      sourceAccount: null,
      body: OperationBody.payment(
        new PaymentOp({
          destination,
          asset: Asset.assetTypeNative(),
          amount: 1000n,
        }),
      ),
    }).toXdr();

    const lgcy = new legacy.Operation({
      sourceAccount: null,
      body: legacy.OperationBody.payment(
        new legacy.PaymentOp({
          destination: legacy.MuxedAccount.keyTypeEd25519(Buffer.from(ED)),
          asset: legacy.Asset.assetTypeNative(),
          amount: legacy.Int64.fromString("1000"),
        }),
      ),
    }).toXDR();
    expectBytesEqual(next, lgcy);
  });
});
