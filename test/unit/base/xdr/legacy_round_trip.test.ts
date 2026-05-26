// Byte-compatibility smoke tests against the legacy @stellar/js-xdr runtime
// (preserved at test/fixtures/legacy-xdr/). For each shape, we encode the
// same logical value through both layers and assert byte equality. If these
// pass, the new class-based runtime produces wire bytes interchangeable
// with the legacy layer it replaces.
//
// Intentionally minimal: ~one test per shape, byte equality only. Broader
// coverage of the type graph lives in:
//   - `to_json.test.ts` — field-level JSON round-trips
//   - `corpus_round_trip.test.ts` — decode/re-encode against a fixture
//     corpus of real on-chain envelopes (highest signal for "does the new
//     SDK match what the network actually produces").
import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { stringToUint8Array } from "uint8array-extras";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import legacyTypes from "../../../fixtures/legacy-xdr/curr_generated.js";
const legacy = legacyTypes as any;

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
  Int128,
  Uint128,
  Int128Parts,
  Operation,
  OperationBody,
  PaymentOp,
  ContractId,
} from "../../../../src/xdr/index.js";

const ED = new Uint8Array(32);
for (let i = 0; i < 32; i += 1) ED[i] = i + 1;

function asciiCode(s: string, length: number): Uint8Array {
  const buf = new Uint8Array(length);
  buf.set(stringToUint8Array(s));
  return buf;
}

function asHex(buf: Uint8Array | Buffer): string {
  return Buffer.from(buf).toString("hex");
}

function expectBytesEqual(
  a: Uint8Array | Buffer,
  b: Uint8Array | Buffer,
): void {
  expect(asHex(a)).toBe(asHex(b));
}

describe("legacy byte-equality: PublicKey", () => {
  it("ed25519", () => {
    expectBytesEqual(
      PublicKey.publicKeyTypeEd25519(ED).toXdr(),
      legacy.PublicKey.publicKeyTypeEd25519(Buffer.from(ED)).toXDR(),
    );
  });
});

describe("legacy byte-equality: Asset", () => {
  it("native (void arm)", () => {
    expectBytesEqual(
      Asset.assetTypeNative().toXdr(),
      legacy.Asset.assetTypeNative().toXDR(),
    );
  });

  it("credit_alphanum4", () => {
    expectBytesEqual(
      Asset.assetTypeCreditAlphanum4(
        new AlphaNum4({
          assetCode: asciiCode("USD", 4),
          issuer: PublicKey.publicKeyTypeEd25519(ED),
        }),
      ).toXdr(),
      legacy.Asset.assetTypeCreditAlphanum4(
        new legacy.AlphaNum4({
          assetCode: Buffer.from(asciiCode("USD", 4)),
          issuer: legacy.AccountId.publicKeyTypeEd25519(Buffer.from(ED)),
        }),
      ).toXDR(),
    );
  });

  it("credit_alphanum12", () => {
    expectBytesEqual(
      Asset.assetTypeCreditAlphanum12(
        new AlphaNum12({
          assetCode: asciiCode("USDTether", 12),
          issuer: PublicKey.publicKeyTypeEd25519(ED),
        }),
      ).toXdr(),
      legacy.Asset.assetTypeCreditAlphanum12(
        new legacy.AlphaNum12({
          assetCode: Buffer.from(asciiCode("USDTether", 12)),
          issuer: legacy.AccountId.publicKeyTypeEd25519(Buffer.from(ED)),
        }),
      ).toXDR(),
    );
  });
});

describe("legacy byte-equality: MuxedAccount", () => {
  it("ed25519 arm", () => {
    expectBytesEqual(
      MuxedAccount.keyTypeEd25519(ED).toXdr(),
      legacy.MuxedAccount.keyTypeEd25519(Buffer.from(ED)).toXDR(),
    );
  });

  it("med25519 arm (mixed-discriminant union)", () => {
    expectBytesEqual(
      MuxedAccount.keyTypeMuxedEd25519(
        new MuxedAccountMed25519({ id: 42n, ed25519: ED }),
      ).toXdr(),
      legacy.MuxedAccount.keyTypeMuxedEd25519(
        new legacy.MuxedAccountMed25519({
          id: legacy.Uint64.fromString("42"),
          ed25519: Buffer.from(ED),
        }),
      ).toXDR(),
    );
  });
});

describe("legacy byte-equality: ScVal (cyclic / lazy schema)", () => {
  it("scvU32", () => {
    expectBytesEqual(
      ScVal.scvU32(42).toXdr(),
      legacy.ScVal.scvU32(42).toXDR(),
    );
  });

  it("scvBool", () => {
    expectBytesEqual(
      ScVal.scvBool(true).toXdr(),
      legacy.ScVal.scvBool(true).toXDR(),
    );
  });

  it("scvVec (recursive — exercises lazy schema)", () => {
    expectBytesEqual(
      ScVal.scvVec([
        ScVal.scvU32(1),
        ScVal.scvU32(2),
        ScVal.scvBool(false),
      ]).toXdr(),
      legacy.ScVal.scvVec([
        legacy.ScVal.scvU32(1),
        legacy.ScVal.scvU32(2),
        legacy.ScVal.scvBool(false),
      ]).toXDR(),
    );
  });

  it("scvI128 (wide-int parts struct)", () => {
    expectBytesEqual(
      ScVal.scvI128(
        new Int128Parts({ hi: -1n, lo: (1n << 64n) - 5n }),
      ).toXdr(),
      legacy.ScVal.scvI128(
        new legacy.Int128Parts({
          hi: legacy.Int64.fromString("-1"),
          lo: legacy.Uint64.fromString(((1n << 64n) - 5n).toString()),
        }),
      ).toXDR(),
    );
  });

  it("scvLedgerKeyContractInstance (void arm)", () => {
    expectBytesEqual(
      ScVal.scvLedgerKeyContractInstance().toXdr(),
      legacy.ScVal.scvLedgerKeyContractInstance().toXDR(),
    );
  });
});

describe("legacy byte-equality: DX wide-int wrappers", () => {
  it("Int128 negative value emits same parts bytes", () => {
    const v = new Int128(-(1n << 100n));
    const partsWire = v.toParts();
    expectBytesEqual(
      v.toXdr(),
      new legacy.Int128Parts({
        hi: legacy.Int64.fromString(partsWire.hi.toString()),
        lo: legacy.Uint64.fromString(partsWire.lo.toString()),
      }).toXDR(),
    );
  });

  it("Uint128 max value emits same parts bytes", () => {
    const v = new Uint128((1n << 128n) - 1n);
    const partsWire = v.toParts();
    expectBytesEqual(
      v.toXdr(),
      new legacy.UInt128Parts({
        hi: legacy.Uint64.fromString(partsWire.hi.toString()),
        lo: legacy.Uint64.fromString(partsWire.lo.toString()),
      }).toXDR(),
    );
  });
});

describe("legacy byte-equality: ScAddress", () => {
  it("account arm", () => {
    expectBytesEqual(
      ScAddress.scAddressTypeAccount(
        PublicKey.publicKeyTypeEd25519(ED),
      ).toXdr(),
      legacy.ScAddress.scAddressTypeAccount(
        legacy.PublicKey.publicKeyTypeEd25519(Buffer.from(ED)),
      ).toXDR(),
    );
  });

  it("contract arm", () => {
    const contractId = new Uint8Array(32).fill(9);
    expectBytesEqual(
      ScAddress.scAddressTypeContract(new ContractId(contractId)).toXdr(),
      legacy.ScAddress.scAddressTypeContract(Buffer.from(contractId)).toXDR(),
    );
  });
});

describe("legacy byte-equality: Memo", () => {
  it("memoNone (void)", () => {
    expectBytesEqual(Memo.memoNone().toXdr(), legacy.Memo.memoNone().toXDR());
  });

  it("memoText", () => {
    expectBytesEqual(
      Memo.memoText("hello").toXdr(),
      legacy.Memo.memoText("hello").toXDR(),
    );
  });

  it("memoId", () => {
    expectBytesEqual(
      Memo.memoId(12345n).toXdr(),
      legacy.Memo.memoId(legacy.Uint64.fromString("12345")).toXDR(),
    );
  });
});

describe("legacy byte-equality: nested transaction body", () => {
  it("Operation w/ payment", () => {
    const destination = MuxedAccount.keyTypeEd25519(ED);
    expectBytesEqual(
      new Operation({
        sourceAccount: null,
        body: OperationBody.payment(
          new PaymentOp({
            destination,
            asset: Asset.assetTypeNative(),
            amount: 1000n,
          }),
        ),
      }).toXdr(),
      new legacy.Operation({
        sourceAccount: null,
        body: legacy.OperationBody.payment(
          new legacy.PaymentOp({
            destination: legacy.MuxedAccount.keyTypeEd25519(Buffer.from(ED)),
            asset: legacy.Asset.assetTypeNative(),
            amount: legacy.Int64.fromString("1000"),
          }),
        ),
      }).toXDR(),
    );
  });
});
