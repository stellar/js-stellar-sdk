import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Keypair } from "../../../src/keypair.js";
import { Account } from "../../../src/account.js";
import { TransactionBuilder } from "../../../src/transaction_builder.js";
import { StrKey } from "../../../src/strkey.js";
import { SignerKey } from "../../../src/signerkey.js";
import {
  AuthRequiredFlag,
  AuthRevocableFlag,
  AuthImmutableFlag,
  AuthClawbackEnabledFlag,
} from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { hash } from "../../../src/hashing.js";
import { TimeoutInfinite } from "../../../src/transaction_builder.js";
import { expectDefined } from "../../support/expect_defined.js";
import {
  expectObjectWithProperty,
  expectOperationType,
} from "../../support/operation.js";

describe("Operation.setOptions()", () => {
  it("auth flags are set correctly", () => {
    expect(AuthRequiredFlag).toBe(1);
    expect(AuthRevocableFlag).toBe(2);
    expect(AuthImmutableFlag).toBe(4);
    expect(AuthClawbackEnabledFlag).toBe(8);
  });

  it("creates a setOptionsOp with all parameters", () => {
    const opts = {
      inflationDest: "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
      clearFlags: AuthRevocableFlag | AuthImmutableFlag,
      setFlags: AuthRequiredFlag | AuthClawbackEnabledFlag,
      masterWeight: 0,
      lowThreshold: 1,
      medThreshold: 2,
      highThreshold: 3,
      signer: {
        ed25519PublicKey:
          "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
        weight: 1,
      },
      homeDomain: "www.example.com",
    };
    const op = Operation.setOptions(opts);
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setOptions",
    );
    const signer = expectObjectWithProperty(
      expectDefined(obj.signer),
      "ed25519PublicKey",
    );

    expect(obj.inflationDest).toBe(opts.inflationDest);
    expect(obj.clearFlags).toBe(6);
    expect(obj.setFlags).toBe(9);
    expect(obj.masterWeight).toBe(opts.masterWeight);
    expect(obj.lowThreshold).toBe(opts.lowThreshold);
    expect(obj.medThreshold).toBe(opts.medThreshold);
    expect(obj.highThreshold).toBe(opts.highThreshold);
    expect(signer.ed25519PublicKey).toBe(opts.signer.ed25519PublicKey);
    expect(signer.weight).toBe(opts.signer.weight);
    expect(expectDefined(obj.homeDomain).toString()).toBe(opts.homeDomain);
  });

  it("creates a setOptionsOp with preAuthTx signer (Buffer)", () => {
    const txHash = hash("Tx hash");
    const op = Operation.setOptions({
      signer: {
        preAuthTx: txHash,
        weight: 10,
      },
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setOptions",
    );
    const signer = expectObjectWithProperty(
      expectDefined(obj.signer),
      "preAuthTx",
    );

    expect(Buffer.from(signer.preAuthTx).toString("hex")).toBe(
      txHash.toString("hex"),
    );
    expect(signer.weight).toBe(10);
  });

  it("creates a setOptionsOp with preAuthTx signer from hex string", () => {
    const txHash = hash("Tx hash").toString("hex");
    expect(typeof txHash).toBe("string");

    const op = Operation.setOptions({
      signer: {
        preAuthTx: txHash,
        weight: 10,
      },
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setOptions",
    );
    const signer = expectObjectWithProperty(
      expectDefined(obj.signer),
      "preAuthTx",
    );

    expect(Buffer.from(signer.preAuthTx).toString("hex")).toBe(txHash);
    expect(signer.weight).toBe(10);
  });

  it("creates a setOptionsOp with sha256Hash signer (Buffer)", () => {
    const sha256Hash = hash("Hash Preimage");
    const op = Operation.setOptions({
      signer: {
        sha256Hash,
        weight: 10,
      },
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setOptions",
    );
    const signer = expectObjectWithProperty(
      expectDefined(obj.signer),
      "sha256Hash",
    );

    expect(Buffer.from(signer.sha256Hash).toString("hex")).toBe(
      sha256Hash.toString("hex"),
    );
    expect(signer.weight).toBe(10);
  });

  it("creates a setOptionsOp with sha256Hash signer from hex string", () => {
    const sha256Hash = hash("Hash Preimage").toString("hex");
    expect(typeof sha256Hash).toBe("string");

    const op = Operation.setOptions({
      signer: {
        sha256Hash,
        weight: 10,
      },
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setOptions",
    );
    const signer = expectObjectWithProperty(
      expectDefined(obj.signer),
      "sha256Hash",
    );

    expect(Buffer.from(signer.sha256Hash).toString("hex")).toBe(sha256Hash);
    expect(signer.weight).toBe(10);
  });

  it("creates a setOptionsOp with signed payload signer", () => {
    const pubkey = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const signedPayload = new xdr.SignerKeyEd25519SignedPayload({
      ed25519: StrKey.decodeEd25519PublicKey(pubkey),
      payload: Buffer.from("test"),
    });
    const xdrSignerKey =
      xdr.SignerKey.signerKeyTypeEd25519SignedPayload(signedPayload);
    const payloadKey = SignerKey.encodeSignerKey(xdrSignerKey);

    const op = Operation.setOptions({
      signer: {
        ed25519SignedPayload: payloadKey,
        weight: 10,
      },
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setOptions",
    );
    const signer = expectObjectWithProperty(
      expectDefined(obj.signer),
      "ed25519SignedPayload",
    );

    expect(signer.ed25519SignedPayload).toBe(payloadKey);
    expect(signer.weight).toBe(10);
  });

  it("empty homeDomain is decoded correctly", () => {
    const keypair = Keypair.random();
    const account = new Account(keypair.publicKey(), "0");

    // First operation: no homeDomain set
    const tx1 = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: "Some Network",
    })
      .addOperation(Operation.setOptions({}))
      .setTimeout(TimeoutInfinite)
      .build();

    // Second operation: explicitly set empty homeDomain
    const tx2 = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: "Some Network",
    })
      .addOperation(Operation.setOptions({ homeDomain: "" }))
      .setTimeout(TimeoutInfinite)
      .build();

    const tx1Operation = expectOperationType(tx1.operations[0]!, "setOptions");
    const tx2Operation = expectOperationType(tx2.operations[0]!, "setOptions");

    expect(tx1Operation.homeDomain).toBeUndefined();
    expect(tx2Operation.homeDomain).toBe("");
  });

  it("creates a setOptionsOp with string setFlags", () => {
    const op = Operation.setOptions({ setFlags: 4 });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setOptions",
    );

    expect(obj.setFlags).toBe(4);
  });

  it("creates a setOptionsOp with string clearFlags", () => {
    const op = Operation.setOptions({ clearFlags: 4 });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setOptions",
    );

    expect(obj.clearFlags).toBe(4);
  });

  it("creates a setOptionsOp with no options (empty object)", () => {
    const op = Operation.setOptions({});
    expect(op).toBeInstanceOf(xdr.Operation);
  });

  it("creates a setOptionsOp with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.setOptions({ source });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = Operation.fromXDRObject(operation);
    expect(obj.source).toBe(source);
  });

  describe("fails to create setOptions operation", () => {
    it("throws with an invalid setFlags", () => {
      expect(() =>
        Operation.setOptions({ setFlags: {} as unknown as number }),
      ).toThrow();
    });

    it("throws with an invalid clearFlags", () => {
      expect(() =>
        Operation.setOptions({ clearFlags: {} as unknown as number }),
      ).toThrow();
    });

    it("throws with an invalid inflationDest address", () => {
      expect(() => Operation.setOptions({ inflationDest: "GCEZW" })).toThrow(
        /inflationDest is invalid/,
      );
    });

    it("throws with an invalid signer address", () => {
      expect(() =>
        Operation.setOptions({
          signer: {
            ed25519PublicKey: "GDGU5OAPHNPU5UCL",
            weight: 1,
          },
        }),
      ).toThrow(/signer.ed25519PublicKey is invalid/);
    });

    it("throws with multiple signer values", () => {
      expect(() =>
        Operation.setOptions({
          signer: {
            ed25519PublicKey:
              "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
            // @ts-expect-error: testing invalid signer with multiple key types
            sha256Hash: Buffer.alloc(32),
            weight: 1,
          },
        }),
      ).toThrow(/Signer object must contain exactly one/);
    });

    it("throws with an invalid masterWeight", () => {
      expect(() => Operation.setOptions({ masterWeight: 400 })).toThrow(
        /masterWeight value must be between 0 and 255/,
      );
    });

    it("throws with an invalid lowThreshold", () => {
      expect(() => Operation.setOptions({ lowThreshold: 400 })).toThrow(
        /lowThreshold value must be between 0 and 255/,
      );
    });

    it("throws with an invalid medThreshold", () => {
      expect(() => Operation.setOptions({ medThreshold: 400 })).toThrow(
        /medThreshold value must be between 0 and 255/,
      );
    });

    it("throws with an invalid highThreshold", () => {
      expect(() => Operation.setOptions({ highThreshold: 400 })).toThrow(
        /highThreshold value must be between 0 and 255/,
      );
    });

    it("throws with an invalid homeDomain", () => {
      expect(() =>
        Operation.setOptions({
          homeDomain: 67238 as unknown as string,
        }),
      ).toThrow(/homeDomain argument must be of type String/);
    });

    it("throws with an invalid source address", () => {
      expect(() => Operation.setOptions({ source: "GCEZ" })).toThrow(
        /Source address is invalid/,
      );
    });
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.setOptions({
      inflationDest: "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("setOptions");
  });
});
