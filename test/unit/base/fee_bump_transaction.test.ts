import { describe, it, expect, beforeEach } from "vitest";
import { FeeBumpTransaction } from "../../../src/base/fee_bump_transaction.js";
import { Transaction } from "../../../src/base/transaction.js";
import { TransactionBuilder } from "../../../src/base/transaction_builder.js";
import { Account } from "../../../src/base/account.js";
import { Keypair } from "../../../src/base/keypair.js";
import { Asset } from "../../../src/base/asset.js";
import { Memo, MemoText } from "../../../src/base/memo.js";
import { Operation } from "../../../src/base/operation.js";
import { StrKey } from "../../../src/base/strkey.js";
import { hash } from "../../../src/base/hashing.js";
import { encodeMuxedAccountToAddress } from "../../../src/base/util/decode_encode_muxed_account.js";
import { expectDefined } from "./support/expect_defined.js";
import xdr from "../../../src/base/xdr.js";
import { areUint8ArraysEqual, uint8ArrayToBase64 } from "uint8array-extras";

function expectBuffersToBeEqual(
  left: { toString(encoding: BufferEncoding): string },
  right: { toString(encoding: BufferEncoding): string },
): void {
  const leftHex = left.toString("hex");
  const rightHex = right.toString("hex");
  expect(leftHex).toEqual(rightHex);
}

function createTestBytes(length: number): Buffer {
  const bytes = new Uint8Array(length);
  for (let index = 0; index < length; index += 1) {
    bytes[index] = index % 256;
  }

  return Buffer.from(bytes);
}

describe("FeeBumpTransaction", () => {
  let networkPassphrase: string;
  let innerSource: Keypair;
  let innerAccount: Account;
  let destination: string;
  let amount: string;
  let asset: Asset;
  let innerTx: Transaction;
  let feeSource: Keypair;
  let transaction: FeeBumpTransaction;

  beforeEach(() => {
    networkPassphrase = "Standalone Network ; February 2017";
    innerSource = Keypair.master(networkPassphrase);
    innerAccount = new Account(innerSource.publicKey(), "7");
    destination = "GDQERENWDDSQZS7R7WKHZI3BSOYMV3FSWR7TFUYFTKQ447PIX6NREOJM";
    amount = "2000.0000000";
    asset = Asset.native();

    innerTx = new TransactionBuilder(innerAccount, {
      fee: "100",
      networkPassphrase: networkPassphrase,
      timebounds: {
        minTime: 0,
        maxTime: 0,
      },
    })
      .addOperation(
        Operation.payment({
          destination: destination,
          asset: asset,
          amount: amount,
        }),
      )
      .addMemo(Memo.text("Happy birthday!"))
      .build();
    innerTx.sign(innerSource);
    feeSource = Keypair.fromSecret(
      "SB7ZMPZB3YMMK5CUWENXVLZWBK4KYX4YU5JBXQNZSK2DP2Q7V3LVTO5V",
    );
    transaction = TransactionBuilder.buildFeeBumpTransaction(
      feeSource,
      "100",
      innerTx,
      networkPassphrase,
    );
  });

  it("constructs a FeeBumpTransaction object from a TransactionEnvelope", () => {
    transaction.sign(feeSource);

    expect(transaction.feeSource).toBe(feeSource.publicKey());
    expect(transaction.fee).toBe("200");

    const innerTransaction = transaction.innerTransaction;

    expect(innerTransaction.toXDR()).toBe(innerTx.toXDR());
    expect(innerTransaction.source).toBe(innerSource.publicKey());
    expect(innerTransaction.fee).toBe("100");
    expect(innerTransaction.memo.type).toBe(MemoText);
    expect((innerTransaction.memo.value as Buffer).toString("ascii")).toBe(
      "Happy birthday!",
    );
    const operation = expectDefined(innerTransaction.operations[0]);
    expect(operation.type).toBe("payment");
    expect((operation as Operation.Payment).destination).toBe(destination);
    expect((operation as Operation.Payment).amount).toBe(amount);

    const expectedXDR =
      "AAAABQAAAADgSJG2GOUMy/H9lHyjYZOwyuyytH8y0wWaoc596L+bEgAAAAAAAADIAAAAAgAAAABzdv3ojkzWHMD7KUoXhrPx0GH18vHKV0ZfqpMiEblG1gAAAGQAAAAAAAAACAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAA9IYXBweSBiaXJ0aGRheSEAAAAAAQAAAAAAAAABAAAAAOBIkbYY5QzL8f2UfKNhk7DK7LK0fzLTBZqhzn3ov5sSAAAAAAAAAASoF8gAAAAAAAAAAAERuUbWAAAAQK933Dnt1pxXlsf1B5CYn81PLxeYsx+MiV9EGbMdUfEcdDWUySyIkdzJefjpR5ejdXVp/KXosGmNUQ+DrIBlzg0AAAAAAAAAAei/mxIAAABAijIIQpL6KlFefiL4FP8UWQktWEz4wFgGNSaXe7mZdVMuiREntehi1b7MRqZ1h+W+Y0y+Z2HtMunsilT2yS5mAA==";

    expect(
      xdr.TransactionEnvelope.toXDR(transaction.toEnvelope(), "base64"),
    ).toBe(expectedXDR);
    const expectedTxEnvelope = xdr.TransactionEnvelope.fromXDR(
      expectedXDR,
      "base64",
    );
    if (expectedTxEnvelope.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump) {
      expect.fail("expected a fee bump transaction envelope");
    }
    if (
      expectedTxEnvelope.feeBump.tx.innerTx.v1.tx.sourceAccount.type !==
      "keyTypeEd25519"
    ) {
      expect.fail("expected source account to be of type ed25519");
    }
    expect(innerTransaction.source).toEqual(
      StrKey.encodeEd25519PublicKey(
        Buffer.from(
          expectedTxEnvelope.feeBump.tx.innerTx.v1.tx.sourceAccount.ed25519,
        ),
      ),
    );
    if (expectedTxEnvelope.feeBump.tx.feeSource.type !== "keyTypeEd25519") {
      expect.fail("expected fee source to be of type ed25519");
    }
    expect(transaction.feeSource).toEqual(
      StrKey.encodeEd25519PublicKey(
        Buffer.from(expectedTxEnvelope.feeBump.tx.feeSource.ed25519),
      ),
    );

    expect(transaction.innerTransaction.fee).toEqual(
      expectedTxEnvelope.feeBump.tx.innerTx.v1.tx.fee.toString(),
    );
    expect(transaction.fee).toEqual(
      expectedTxEnvelope.feeBump.tx.fee.toString(),
    );

    expect(innerTransaction.signatures.length).toEqual(1);
    const innerSignature = expectDefined(innerTransaction.signatures[0]);
    const expectedInnerSignature = expectDefined(
      expectedTxEnvelope.feeBump.tx.innerTx.v1.signatures[0],
    );
    expect(xdr.DecoratedSignature.toXDR(innerSignature, "base64")).toEqual(
      xdr.DecoratedSignature.toXDR(expectedInnerSignature, "base64"),
    );

    expect(transaction.signatures.length).toEqual(1);
    const transactionSignature = expectDefined(transaction.signatures[0]);
    const expectedTransactionSignature = expectDefined(
      expectedTxEnvelope.feeBump.signatures[0],
    );
    expect(
      xdr.DecoratedSignature.toXDR(transactionSignature, "base64"),
    ).toEqual(
      xdr.DecoratedSignature.toXDR(expectedTransactionSignature, "base64"),
    );
  });

  it("throws when a garbage Network is selected", () => {
    const input = transaction.toEnvelope();

    expect(() => {
      new FeeBumpTransaction(input, { garbage: "yes" } as unknown as string);
    }).toThrow(/expected a string/);

    expect(() => {
      new FeeBumpTransaction(input, 1234 as unknown as string);
    }).toThrow(/expected a string/);
  });

  it("throws when a non-fee-bump envelope is passed", () => {
    const regularEnvelope = innerTx.toEnvelope();

    expect(() => {
      new FeeBumpTransaction(regularEnvelope, networkPassphrase);
    }).toThrow(/expected an envelopeTypeTxFeeBump/);
  });

  it("signs correctly", () => {
    transaction.sign(feeSource);
    const envelope = transaction.toEnvelope();
    if (envelope.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump) {
      expect.fail("expected a fee bump transaction envelope");
    }
    const rawSig = expectDefined(envelope.feeBump.signatures[0]).signature;
    expect(feeSource.verify(transaction.hash(), Buffer.from(rawSig))).toBe(
      true,
    );
  });

  it("signs using hash preimage", () => {
    const preimage = createTestBytes(64);
    const preimageHash = hash(preimage);
    transaction.signHashX(preimage);
    const env = transaction.toEnvelope();
    if (env.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump) {
      expect.fail("expected a fee bump transaction envelope");
    }
    const decoratedSignature = expectDefined(env.feeBump.signatures[0]);
    expectBuffersToBeEqual(decoratedSignature.signature, preimage);
    expectBuffersToBeEqual(
      decoratedSignature.hint,
      preimageHash.subarray(preimageHash.length - 4),
    );
  });

  it("returns error when signing using hash preimage that is too long", () => {
    const preimage = createTestBytes(2 * 64);
    expect(() => transaction.signHashX(preimage)).toThrow(
      /preimage cannot be longer than 64 bytes/,
    );
  });

  describe("toEnvelope", () => {
    it("does not return a reference to source signatures", () => {
      const envelope = transaction.toEnvelope();
      if (envelope.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump) {
        expect.fail("expected a fee bump transaction envelope");
      }
      (envelope.feeBump.signatures as any).push({} as xdr.DecoratedSignature);

      expect(transaction.signatures.length).toEqual(0);
    });
    it("does not return a reference to the source transaction", () => {
      const envelope = transaction.toEnvelope();
      if (envelope.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump) {
        expect.fail("expected a fee bump transaction envelope");
      }
      const feeBumpEnvelope = envelope.feeBump;
      (feeBumpEnvelope.tx.fee as any) = BigInt("300");

      expect(transaction.tx.fee.toString()).toEqual("200");
    });
  });

  it("adds signature correctly", () => {
    const presignHash = transaction.hash();

    const addedSignatureTx = new FeeBumpTransaction(
      transaction.toEnvelope(),
      networkPassphrase,
    );

    const signature = uint8ArrayToBase64(feeSource.sign(presignHash));

    addedSignatureTx.addSignature(feeSource.publicKey(), signature);

    const envelopeAddedSignature = addedSignatureTx.toEnvelope();
    if (
      envelopeAddedSignature.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump
    ) {
      expect.fail("expected a fee bump transaction envelope");
    }
    const addedSignature = expectDefined(
      envelopeAddedSignature.feeBump.signatures[0],
    );

    expect(
      feeSource.verify(
        addedSignatureTx.hash(),
        Buffer.from(addedSignature.signature),
      ),
    ).toBe(true);

    transaction.sign(feeSource);
    const envelope = transaction.toEnvelope();
    if (envelope.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump) {
      expect.fail("expected a fee bump transaction envelope");
    }
    const envelopeSigned = envelope.feeBump;
    const signedSignature = expectDefined(envelopeSigned.signatures[0]);

    expect(
      areUint8ArraysEqual(signedSignature.signature, addedSignature.signature),
    ).toBe(true);

    expectBuffersToBeEqual(signedSignature.hint, addedSignature.hint);

    expectBuffersToBeEqual(addedSignatureTx.hash(), transaction.hash());
  });

  it("adds signature generated by getKeypairSignature", () => {
    const presignHash = transaction.hash();

    const signature = new FeeBumpTransaction(
      transaction.toEnvelope(),
      networkPassphrase,
    ).getKeypairSignature(feeSource);

    expect(uint8ArrayToBase64(feeSource.sign(presignHash))).toEqual(signature);

    const addedSignatureTx = new FeeBumpTransaction(
      transaction.toEnvelope(),
      networkPassphrase,
    );

    expect(addedSignatureTx.signatures.length).toEqual(0);
    addedSignatureTx.addSignature(feeSource.publicKey(), signature);

    const envelopeAddedSignature = addedSignatureTx.toEnvelope();
    if (
      envelopeAddedSignature.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump
    ) {
      expect.fail("expected a fee bump transaction envelope");
    }
    const addedSignature = expectDefined(
      envelopeAddedSignature.feeBump.signatures[0],
    );

    expect(
      feeSource.verify(
        transaction.hash(),
        Buffer.from(addedSignature.signature),
      ),
    ).toBe(true);

    expect(transaction.signatures.length).toEqual(0);
    transaction.sign(feeSource);
    const envelope = transaction.toEnvelope();
    if (envelope.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump) {
      expect.fail("expected a fee bump transaction envelope");
    }
    const envelopeSigned = envelope.feeBump;
    const signedSignature = expectDefined(envelopeSigned.signatures[0]);

    expect(
      areUint8ArraysEqual(signedSignature.signature, addedSignature.signature),
    ).toBe(true);

    expectBuffersToBeEqual(signedSignature.hint, addedSignature.hint);

    expectBuffersToBeEqual(addedSignatureTx.hash(), transaction.hash());
  });

  it("does not add invalid signature", () => {
    const signature = new FeeBumpTransaction(
      transaction.toEnvelope(),
      networkPassphrase,
    ).getKeypairSignature(feeSource);

    const alteredTx = TransactionBuilder.buildFeeBumpTransaction(
      feeSource,
      "200",
      innerTx,
      networkPassphrase,
    );

    expect(() => {
      alteredTx.addSignature(feeSource.publicKey(), signature);
    }).toThrow("Invalid signature");
  });

  it("outputs xdr as a string", () => {
    const xdrString =
      "AAAABQAAAADgSJG2GOUMy/H9lHyjYZOwyuyytH8y0wWaoc596L+bEgAAAAAAAADIAAAAAgAAAABzdv3ojkzWHMD7KUoXhrPx0GH18vHKV0ZfqpMiEblG1gAAAGQAAAAAAAAACAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAA9IYXBweSBiaXJ0aGRheSEAAAAAAQAAAAAAAAABAAAAAOBIkbYY5QzL8f2UfKNhk7DK7LK0fzLTBZqhzn3ov5sSAAAAAAAAAASoF8gAAAAAAAAAAAERuUbWAAAAQK933Dnt1pxXlsf1B5CYn81PLxeYsx+MiV9EGbMdUfEcdDWUySyIkdzJefjpR5ejdXVp/KXosGmNUQ+DrIBlzg0AAAAAAAAAAei/mxIAAABAijIIQpL6KlFefiL4FP8UWQktWEz4wFgGNSaXe7mZdVMuiREntehi1b7MRqZ1h+W+Y0y+Z2HtMunsilT2yS5mAA==";
    const tx = new FeeBumpTransaction(xdrString, networkPassphrase);
    expect(tx).toBeInstanceOf(FeeBumpTransaction);
    expect(tx.toXDR()).toBe(xdrString);
  });

  it("decodes muxed addresses correctly", () => {
    const muxedFeeSource = feeSource.xdrMuxedAccount("0");
    const muxedAddress = encodeMuxedAccountToAddress(muxedFeeSource);

    const envelope = transaction.toEnvelope();
    if (envelope.type !== xdr.EnvelopeType.envelopeTypeTxFeeBump) {
      expect.fail("expected a fee bump transaction envelope");
    }
    (envelope.feeBump.tx.feeSource as any) = muxedFeeSource;

    const txWithMuxedAccount = new FeeBumpTransaction(
      envelope,
      networkPassphrase,
    );
    expect(txWithMuxedAccount.feeSource).toEqual(muxedAddress);
  });
});
