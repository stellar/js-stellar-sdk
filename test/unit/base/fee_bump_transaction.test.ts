import { describe, it, expect, beforeEach } from "vitest";
import { FeeBumpTransaction } from "../../src/fee_bump_transaction.js";
import { Transaction } from "../../src/transaction.js";
import { TransactionBuilder } from "../../src/transaction_builder.js";
import { Account } from "../../src/account.js";
import { Keypair } from "../../src/keypair.js";
import { Asset } from "../../src/asset.js";
import { Memo, MemoText } from "../../src/memo.js";
import { Operation } from "../../src/operation.js";
import { StrKey } from "../../src/strkey.js";
import { hash } from "../../src/hashing.js";
import { encodeMuxedAccountToAddress } from "../../src/util/decode_encode_muxed_account.js";
import { expectDefined } from "../support/expect_defined.js";
import xdr from "../../src/xdr.js";

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
    destination =
      "GDQERENWDDSQZS7R7WKHZI3BSOYMV3FSWR7TFUYFTKQ447PIX6NREOJM";
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
    expect(
      (innerTransaction.memo.value as Buffer).toString("ascii"),
    ).toBe("Happy birthday!");
    const operation = expectDefined(innerTransaction.operations[0]);
    expect(operation.type).toBe("payment");
    expect((operation as Operation.Payment).destination).toBe(destination);
    expect((operation as Operation.Payment).amount).toBe(amount);

    const expectedXDR =
      "AAAABQAAAADgSJG2GOUMy/H9lHyjYZOwyuyytH8y0wWaoc596L+bEgAAAAAAAADIAAAAAgAAAABzdv3ojkzWHMD7KUoXhrPx0GH18vHKV0ZfqpMiEblG1gAAAGQAAAAAAAAACAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAA9IYXBweSBiaXJ0aGRheSEAAAAAAQAAAAAAAAABAAAAAOBIkbYY5QzL8f2UfKNhk7DK7LK0fzLTBZqhzn3ov5sSAAAAAAAAAASoF8gAAAAAAAAAAAERuUbWAAAAQK933Dnt1pxXlsf1B5CYn81PLxeYsx+MiV9EGbMdUfEcdDWUySyIkdzJefjpR5ejdXVp/KXosGmNUQ+DrIBlzg0AAAAAAAAAAei/mxIAAABAijIIQpL6KlFefiL4FP8UWQktWEz4wFgGNSaXe7mZdVMuiREntehi1b7MRqZ1h+W+Y0y+Z2HtMunsilT2yS5mAA==";

    expect(transaction.toEnvelope().toXDR().toString("base64")).toBe(
      expectedXDR,
    );
    const expectedTxEnvelope = xdr.TransactionEnvelope.fromXDR(
      expectedXDR,
      "base64",
    ).value() as xdr.FeeBumpTransactionEnvelope;

    expect(innerTransaction.source).toEqual(
      StrKey.encodeEd25519PublicKey(
        expectedTxEnvelope
          .tx()
          .innerTx()
          .value()
          .tx()
          .sourceAccount()
          .ed25519(),
      ),
    );
    expect(transaction.feeSource).toEqual(
      StrKey.encodeEd25519PublicKey(
        expectedTxEnvelope.tx().feeSource().ed25519(),
      ),
    );

    expect(transaction.innerTransaction.fee).toEqual(
      expectedTxEnvelope.tx().innerTx().value().tx().fee().toString(),
    );
    expect(transaction.fee).toEqual(
      expectedTxEnvelope.tx().fee().toString(),
    );

    expect(innerTransaction.signatures.length).toEqual(1);
    const innerSignature = expectDefined(innerTransaction.signatures[0]);
    const expectedInnerSignature = expectDefined(
      expectedTxEnvelope.tx().innerTx().value().signatures()[0],
    );
    expect(innerSignature.toXDR().toString("base64")).toEqual(
      expectedInnerSignature.toXDR().toString("base64"),
    );

    expect(transaction.signatures.length).toEqual(1);
    const transactionSignature = expectDefined(transaction.signatures[0]);
    const expectedTransactionSignature = expectDefined(
      expectedTxEnvelope.signatures()[0],
    );
    expect(transactionSignature.toXDR().toString("base64")).toEqual(
      expectedTransactionSignature.toXDR().toString("base64"),
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
    const rawSig = expectDefined(
      transaction
      .toEnvelope()
      .feeBump()
      .signatures()[0],
    ).signature();
    expect(feeSource.verify(transaction.hash(), rawSig)).toBe(true);
  });

  it("signs using hash preimage", () => {
    const preimage = createTestBytes(64);
    const preimageHash = hash(preimage);
    transaction.signHashX(preimage);
    const env = transaction.toEnvelope().feeBump();
    const decoratedSignature = expectDefined(env.signatures()[0]);
    expectBuffersToBeEqual(decoratedSignature.signature(), preimage);
    expectBuffersToBeEqual(
      decoratedSignature.hint(),
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
      const envelope = transaction
        .toEnvelope()
        .value() as xdr.FeeBumpTransactionEnvelope;
      envelope.signatures().push({} as xdr.DecoratedSignature);

      expect(transaction.signatures.length).toEqual(0);
    });
    it("does not return a reference to the source transaction", () => {
      const envelope = transaction
        .toEnvelope()
        .value() as xdr.FeeBumpTransactionEnvelope;
      envelope.tx().fee(xdr.Int64.fromString("300"));

      expect(transaction.tx.fee().toString()).toEqual("200");
    });
  });

  it("adds signature correctly", () => {
    const presignHash = transaction.hash();

    const addedSignatureTx = new FeeBumpTransaction(
      transaction.toEnvelope(),
      networkPassphrase,
    );

    const signature = feeSource.sign(presignHash).toString("base64");

    addedSignatureTx.addSignature(feeSource.publicKey(), signature);

    const envelopeAddedSignature = addedSignatureTx
      .toEnvelope()
      .feeBump();
    const addedSignature = expectDefined(envelopeAddedSignature.signatures()[0]);

    expect(
      feeSource.verify(
        addedSignatureTx.hash(),
        addedSignature.signature(),
      ),
    ).toBe(true);

    transaction.sign(feeSource);
    const envelopeSigned = transaction.toEnvelope().feeBump();
    const signedSignature = expectDefined(envelopeSigned.signatures()[0]);

    expectBuffersToBeEqual(
      signedSignature.signature(),
      addedSignature.signature(),
    );

    expectBuffersToBeEqual(
      signedSignature.hint(),
      addedSignature.hint(),
    );

    expectBuffersToBeEqual(addedSignatureTx.hash(), transaction.hash());
  });

  it("adds signature generated by getKeypairSignature", () => {
    const presignHash = transaction.hash();

    const signature = new FeeBumpTransaction(
      transaction.toEnvelope(),
      networkPassphrase,
    ).getKeypairSignature(feeSource);

    expect(feeSource.sign(presignHash).toString("base64")).toEqual(
      signature,
    );

    const addedSignatureTx = new FeeBumpTransaction(
      transaction.toEnvelope(),
      networkPassphrase,
    );

    expect(addedSignatureTx.signatures.length).toEqual(0);
    addedSignatureTx.addSignature(feeSource.publicKey(), signature);

    const envelopeAddedSignature = addedSignatureTx
      .toEnvelope()
      .feeBump();
    const addedSignature = expectDefined(envelopeAddedSignature.signatures()[0]);

    expect(
      feeSource.verify(
        transaction.hash(),
        addedSignature.signature(),
      ),
    ).toBe(true);

    expect(transaction.signatures.length).toEqual(0);
    transaction.sign(feeSource);
    const envelopeSigned = transaction.toEnvelope().feeBump();
    const signedSignature = expectDefined(envelopeSigned.signatures()[0]);

    expectBuffersToBeEqual(
      signedSignature.signature(),
      addedSignature.signature(),
    );

    expectBuffersToBeEqual(
      signedSignature.hint(),
      addedSignature.hint(),
    );

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
    envelope.feeBump().tx().feeSource(muxedFeeSource);

    const txWithMuxedAccount = new FeeBumpTransaction(
      envelope,
      networkPassphrase,
    );
    expect(txWithMuxedAccount.feeSource).toEqual(muxedAddress);
  });
});
