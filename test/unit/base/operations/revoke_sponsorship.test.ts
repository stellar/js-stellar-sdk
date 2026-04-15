import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import { LiquidityPoolId } from "../../../src/liquidity_pool_id.js";
import { Keypair } from "../../../src/keypair.js";
import { StrKey } from "../../../src/strkey.js";
import { hash } from "../../../src/hashing.js";
import xdr from "../../../src/xdr.js";
import {
  expectOperationType,
  expectObjectWithProperty,
} from "../../support/operation.js";

const account = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";
const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";

describe("Operation.revokeAccountSponsorship()", () => {
  it("creates a revokeAccountSponsorshipOp", () => {
    const op = Operation.revokeAccountSponsorship({ account });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeAccountSponsorship",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
    expect(obj.account).toBe(account);
  });

  it("fails with an invalid account", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing empty opts to test runtime validation
      Operation.revokeAccountSponsorship({}),
    ).toThrow(/account is invalid/);

    expect(() =>
      Operation.revokeAccountSponsorship({ account: "GBAD" }),
    ).toThrow(/account is invalid/);
  });

  it("preserves an optional source account", () => {
    const op = Operation.revokeAccountSponsorship({ account, source });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeAccountSponsorship",
    );
    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.revokeAccountSponsorship({ account });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("revokeSponsorship");
  });
});

describe("Operation.revokeTrustlineSponsorship()", () => {
  it("creates a revokeTrustlineSponsorshipOp with an Asset", () => {
    const asset = new Asset(
      "USDUSD",
      "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
    );
    const op = Operation.revokeTrustlineSponsorship({ account, asset });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeTrustlineSponsorship",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
  });

  it("creates a revokeTrustlineSponsorshipOp with a LiquidityPoolId", () => {
    const asset = new LiquidityPoolId(
      "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
    );
    const op = Operation.revokeTrustlineSponsorship({ account, asset });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeTrustlineSponsorship",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
  });

  it("fails with an invalid account", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing empty opts to test runtime validation
      Operation.revokeTrustlineSponsorship({}),
    ).toThrow(/account is invalid/);

    expect(() =>
      // @ts-expect-error: intentionally omitting required asset field to test that account validation runs first
      Operation.revokeTrustlineSponsorship({ account: "GBAD" }),
    ).toThrow(/account is invalid/);
  });

  it("fails with an invalid asset", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.revokeTrustlineSponsorship({ account }),
    ).toThrow(/asset must be an Asset or LiquidityPoolId/);
  });

  it("preserves an optional source account", () => {
    const asset = new Asset(
      "USDUSD",
      "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
    );
    const op = Operation.revokeTrustlineSponsorship({
      account,
      asset,
      source,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeTrustlineSponsorship",
    );
    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const asset = new Asset(
      "USDUSD",
      "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
    );
    const op = Operation.revokeTrustlineSponsorship({ account, asset });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("revokeSponsorship");
  });
});

describe("Operation.revokeOfferSponsorship()", () => {
  it("creates a revokeOfferSponsorshipOp", () => {
    const seller = account;
    const offerId = "1234";
    const op = Operation.revokeOfferSponsorship({ seller, offerId });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeOfferSponsorship",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
    expect(obj.seller).toBe(seller);
    expect(obj.offerId).toBe(offerId);
  });

  it("fails with an invalid seller", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing empty opts to test runtime validation
      Operation.revokeOfferSponsorship({}),
    ).toThrow(/seller is invalid/);

    expect(() =>
      Operation.revokeOfferSponsorship({ seller: "GBAD", offerId: "1" }),
    ).toThrow(/seller is invalid/);
  });

  it("fails with a missing offerId", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.revokeOfferSponsorship({ seller: account }),
    ).toThrow(/offerId is invalid/);
  });

  it("preserves an optional source account", () => {
    const op = Operation.revokeOfferSponsorship({
      seller: account,
      offerId: "1234",
      source,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeOfferSponsorship",
    );
    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.revokeOfferSponsorship({
      seller: account,
      offerId: "1234",
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("revokeSponsorship");
  });
});

describe("Operation.revokeDataSponsorship()", () => {
  it("creates a revokeDataSponsorshipOp", () => {
    const name = "foo";
    const op = Operation.revokeDataSponsorship({ account, name });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeDataSponsorship",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
    expect(obj.account).toBe(account);
    expect(obj.name).toBe(name);
  });

  it("fails with an invalid account", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing empty opts to test runtime validation
      Operation.revokeDataSponsorship({}),
    ).toThrow(/account is invalid/);

    expect(() =>
      Operation.revokeDataSponsorship({ account: "GBAD", name: "foo" }),
    ).toThrow(/account is invalid/);
  });

  it("fails with a missing name", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.revokeDataSponsorship({ account }),
    ).toThrow(/name must be a string, up to 64 characters/);
  });

  it("fails with a name longer than 64 characters", () => {
    expect(() =>
      Operation.revokeDataSponsorship({ account, name: "a".repeat(65) }),
    ).toThrow(/name must be a string, up to 64 characters/);
  });

  it("preserves an optional source account", () => {
    const op = Operation.revokeDataSponsorship({
      account,
      name: "foo",
      source,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeDataSponsorship",
    );
    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.revokeDataSponsorship({ account, name: "foo" });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("revokeSponsorship");
  });
});

describe("Operation.revokeClaimableBalanceSponsorship()", () => {
  const balanceId =
    "00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be";

  it("creates a revokeClaimableBalanceSponsorshipOp", () => {
    const op = Operation.revokeClaimableBalanceSponsorship({ balanceId });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeClaimableBalanceSponsorship",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
    expect(obj.balanceId).toBe(balanceId);
  });

  it("fails with an invalid balanceId", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing empty opts to test runtime validation
      Operation.revokeClaimableBalanceSponsorship({}),
    ).toThrow(/balanceId is invalid/);
  });

  it("preserves an optional source account", () => {
    const op = Operation.revokeClaimableBalanceSponsorship({
      balanceId,
      source,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeClaimableBalanceSponsorship",
    );
    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.revokeClaimableBalanceSponsorship({ balanceId });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("revokeSponsorship");
  });
});

describe("Operation.revokeLiquidityPoolSponsorship()", () => {
  const liquidityPoolId =
    "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7";

  it("creates a revokeLiquidityPoolSponsorshipOp", () => {
    const op = Operation.revokeLiquidityPoolSponsorship({ liquidityPoolId });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeLiquidityPoolSponsorship",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
    expect(obj.liquidityPoolId).toBe(liquidityPoolId);
  });

  it("fails with an invalid liquidityPoolId", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing empty opts to test runtime validation
      Operation.revokeLiquidityPoolSponsorship({}),
    ).toThrow(/liquidityPoolId is invalid/);
  });

  it("preserves an optional source account", () => {
    const op = Operation.revokeLiquidityPoolSponsorship({
      liquidityPoolId,
      source,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeLiquidityPoolSponsorship",
    );
    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.revokeLiquidityPoolSponsorship({ liquidityPoolId });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("revokeSponsorship");
  });
});

describe("Operation.revokeSignerSponsorship()", () => {
  it("creates a revokeSignerSponsorshipOp with an ed25519PublicKey signer", () => {
    const signer = { ed25519PublicKey: account };
    const op = Operation.revokeSignerSponsorship({ account, signer });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeSignerSponsorship",
    );
    const decodedSigner = expectObjectWithProperty(
      obj.signer,
      "ed25519PublicKey",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
    expect(obj.account).toBe(account);
    expect(decodedSigner.ed25519PublicKey).toBe(signer.ed25519PublicKey);
  });

  it("creates a revokeSignerSponsorshipOp with a preAuthTx signer", () => {
    const signer = { preAuthTx: hash(Buffer.from("Tx hash")).toString("hex") };
    const op = Operation.revokeSignerSponsorship({ account, signer });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeSignerSponsorship",
    );
    const decodedSigner = expectObjectWithProperty(obj.signer, "preAuthTx");
    expect(obj.account).toBe(account);
    expect(decodedSigner.preAuthTx).toBe(signer.preAuthTx);
  });

  it("creates a revokeSignerSponsorshipOp with a sha256Hash signer", () => {
    const signer = {
      sha256Hash: hash(Buffer.from("Hash Preimage")).toString("hex"),
    };
    const op = Operation.revokeSignerSponsorship({ account, signer });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeSignerSponsorship",
    );
    const decodedSigner = expectObjectWithProperty(obj.signer, "sha256Hash");
    expect(obj.account).toBe(account);
    expect(decodedSigner.sha256Hash).toBe(signer.sha256Hash);
  });

  it("fails with an invalid account", () => {
    const signer = { ed25519PublicKey: source };
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.revokeSignerSponsorship({ signer }),
    ).toThrow(/account is invalid/);
  });

  it("fails with an invalid ed25519PublicKey signer", () => {
    expect(() =>
      Operation.revokeSignerSponsorship({
        account,
        signer: { ed25519PublicKey: "GBAD" },
      }),
    ).toThrow(/signer\.ed25519PublicKey is invalid/);
  });

  it("fails with an unrecognized signer type", () => {
    expect(() =>
      Operation.revokeSignerSponsorship({
        account,
        // @ts-expect-error: intentionally passing invalid signer to test runtime validation
        signer: { invalidKeyType: "" },
      }),
    ).toThrow(/signer is invalid/);
  });

  it("preserves an optional source account", () => {
    const signer = { ed25519PublicKey: account };
    const op = Operation.revokeSignerSponsorship({
      account,
      signer,
      source,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "revokeSignerSponsorship",
    );
    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const signer = { ed25519PublicKey: account };
    const op = Operation.revokeSignerSponsorship({ account, signer });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("revokeSponsorship");
  });

  it("deserializes a revokeSignerSponsorship with an ed25519SignedPayload signer", () => {
    // Build the XDR operation manually to test the deserialization path
    const kp = Keypair.random();
    const payload = Buffer.alloc(10, 0xab);
    const signedPayload = new xdr.SignerKeyEd25519SignedPayload({
      ed25519: kp.rawPublicKey(),
      payload,
    });
    const signerKey =
      xdr.SignerKey.signerKeyTypeEd25519SignedPayload(signedPayload);

    const revokeSigner = new xdr.RevokeSponsorshipOpSigner({
      accountId: kp.xdrAccountId(),
      signerKey,
    });
    const revokeOp =
      xdr.RevokeSponsorshipOp.revokeSponsorshipSigner(revokeSigner);
    const opBody = xdr.OperationBody.revokeSponsorship(revokeOp);
    const xdrOp = new xdr.Operation({ sourceAccount: null, body: opBody });

    const obj = expectOperationType(
      Operation.fromXDRObject(xdrOp),
      "revokeSignerSponsorship",
    );
    const decodedSigner = expectObjectWithProperty(
      obj.signer,
      "ed25519SignedPayload",
    );

    // The encoded signed payload should be a valid StrKey P... address
    expect(
      StrKey.isValidSignedPayload(decodedSigner.ed25519SignedPayload),
    ).toBe(true);
  });

  it("creates a revokeSignerSponsorshipOp with an ed25519SignedPayload signer", () => {
    // Build a valid signed payload StrKey from a keypair + payload
    const kp = Keypair.random();
    const payload = Buffer.alloc(10, 0xab);
    const signedPayloadXdr = new xdr.SignerKeyEd25519SignedPayload({
      ed25519: kp.rawPublicKey(),
      payload,
    });
    const encodedPayload = StrKey.encodeSignedPayload(signedPayloadXdr.toXDR());

    const signer = { ed25519SignedPayload: encodedPayload };
    const op = Operation.revokeSignerSponsorship({ account, signer });
    const operation = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "revokeSignerSponsorship",
    );
    const decodedSigner = expectObjectWithProperty(
      obj.signer,
      "ed25519SignedPayload",
    );

    expect(operation.body().switch().name).toBe("revokeSponsorship");
    expect(obj.account).toBe(account);
    expect(decodedSigner.ed25519SignedPayload).toBe(encodedPayload);
  });

  it("fails with an invalid ed25519SignedPayload signer", () => {
    expect(() =>
      Operation.revokeSignerSponsorship({
        account,
        signer: { ed25519SignedPayload: "PBAD" },
      }),
    ).toThrow(/signer\.ed25519SignedPayload is invalid/);
  });
});
