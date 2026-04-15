import { describe, it, expect, beforeEach } from "vitest";
import { Transaction } from "../../src/transaction.js";
import {
  TransactionBuilder,
  TransactionBuilderOptions,
  BASE_FEE,
  TimeoutInfinite,
} from "../../src/transaction_builder.js";
import { Account } from "../../src/account.js";
import { MuxedAccount } from "../../src/muxed_account.js";
import { Keypair } from "../../src/keypair.js";
import { Asset } from "../../src/asset.js";
import { Memo, MemoText } from "../../src/memo.js";
import { Operation } from "../../src/operation.js";
import { Networks } from "../../src/network.js";
import { Claimant } from "../../src/claimant.js";
import { SignerKey } from "../../src/signerkey.js";
import { StrKey } from "../../src/strkey.js";
import { hash } from "../../src/hashing.js";
import type { PaymentResult } from "../../src/operations/types.js";
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

describe("Transaction", () => {
  it("constructs Transaction object from a TransactionEnvelope", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000.0000000";

    const input = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .addMemo(Memo.text("Happy birthday!"))
      .setTimeout(TimeoutInfinite)
      .build()
      .toEnvelope()
      .toXDR("base64");

    const transaction = new Transaction(input, Networks.TESTNET);
    const operation = transaction.operations[0];
    if (operation === undefined) {
      throw new Error("Expected at least one operation");
    }

    expect(transaction.source).toBe(source.accountId());
    expect(transaction.fee).toBe("100");
    expect(transaction.memo.type).toBe(MemoText);
    expect((transaction.memo.value as Buffer).toString("ascii")).toBe(
      "Happy birthday!",
    );
    expect(operation.type).toBe("payment");
    expect((operation as Operation.Payment).destination).toBe(destination);
    expect((operation as Operation.Payment).amount).toBe(amount);
  });

  it("constructs Transaction from a V0 envelope", () => {
    // This is a V0 envelope (envelopeTypeTxV0)
    const v0EnvelopeXdr =
      "AAAAAPQQv+uPYrlCDnjgPyPRgIjB6T8Zb8ANmL8YGAXC2IAgAAAAZAAIteYAAAAHAAAAAAAAAAAAAAABAAAAAAAAAAMAAAAAAAAAAUVVUgAAAAAAUtYuFczBLlsXyEp3q8BbTBpEGINWahqkFbnTPd93YUUAAAAXSHboAAAAABEAACcQAAAAAAAAAKIAAAAAAAAAAcLYgCAAAABAo2tU6n0Bb7bbbpaXacVeaTVbxNMBtnrrXVk2QAOje2Flllk/ORlmQdFU/9c8z43eWh1RNMpI3PscY+yDCnJPBQ==";

    const envelope = xdr.TransactionEnvelope.fromXDR(v0EnvelopeXdr, "base64");
    const txe = envelope.value() as xdr.TransactionV0Envelope;
    const expectedSource = StrKey.encodeEd25519PublicKey(
      txe.tx().sourceAccountEd25519(),
    );

    const tx = new Transaction(v0EnvelopeXdr, Networks.TESTNET);

    expect(tx.source).toBe(expectedSource);
    expect(tx.fee).toBe("100");
    expect(tx.operations.length).toBeGreaterThan(0);
  });

  it("throws when given a FeeBump envelope", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000.0000000";

    const innerTx = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .setTimeout(TimeoutInfinite)
      .build();

    const feeSource = Keypair.fromSecret(
      "SB7ZMPZB3YMMK5CUWENXVLZWBK4KYX4YU5JBXQNZSK2DP2Q7V3LVTO5V",
    );
    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      feeSource,
      "200",
      innerTx,
      Networks.TESTNET,
    );
    const feeBumpEnvelope = feeBumpTx.toEnvelope();

    expect(() => {
      new Transaction(feeBumpEnvelope, Networks.TESTNET);
    }).toThrow(/expected an envelopeTypeTxV0 or envelopeTypeTx/);
  });

  describe("toEnvelope", () => {
    let transaction: Transaction;

    beforeEach(() => {
      const source = new Account(
        "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
        "0",
      );
      const destination =
        "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
      const asset = Asset.native();
      const amount = "2000.0000000";

      transaction = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({ destination, asset, amount }))
        .addMemo(Memo.text("Happy birthday!"))
        .setTimeout(TimeoutInfinite)
        .build();
    });

    it("does not return a reference to source signatures", () => {
      const envelope = transaction
        .toEnvelope()
        .value() as xdr.TransactionV1Envelope;
      envelope.signatures().push({} as xdr.DecoratedSignature);

      expect(transaction.signatures.length).toEqual(0);
    });
    it("does not return a reference to the source transaction", () => {
      const envelope = transaction
        .toEnvelope()
        .value() as xdr.TransactionV1Envelope;
      envelope.tx().fee(300);

      expect(transaction.tx.fee().toString()).toEqual("100");
    });
    it("throws when setting networkPassphrase", () => {
      expect(() => {
        (transaction as { networkPassphrase: string }).networkPassphrase =
          "Test Network";
      }).toThrow(/Transaction is immutable/);
    });

    it("throws when setting timeBounds", () => {
      expect(() => {
        (transaction as any).timeBounds = { minTime: "0", maxTime: "0" };
      }).toThrow(/Transaction is immutable/);
    });

    it("throws when setting ledgerBounds", () => {
      expect(() => {
        (transaction as any).ledgerBounds = { minLedger: 0, maxLedger: 0 };
      }).toThrow(/Transaction is immutable/);
    });

    it("throws when setting memo", () => {
      expect(() => {
        (transaction as any).memo = Memo.none();
      }).toThrow(/Transaction is immutable/);
    });

    it("throws when setting sequence", () => {
      expect(() => {
        (transaction as any).sequence = "999";
      }).toThrow(/Transaction is immutable/);
    });

    it("throws when setting source", () => {
      expect(() => {
        (transaction as any).source = "GBBB";
      }).toThrow(/Transaction is immutable/);
    });

    it("throws when setting operations", () => {
      expect(() => {
        (transaction as any).operations = [];
      }).toThrow(/Transaction is immutable/);
    });

    it("addDecoratedSignature appends a signature", () => {
      const kp = Keypair.random();
      const sig = kp.signDecorated(transaction.hash());

      expect(transaction.signatures.length).toBe(0);
      transaction.addDecoratedSignature(sig);
      expect(transaction.signatures.length).toBe(1);
      expect(transaction.signatures[0]).toBe(sig);
    });
  });

  describe("tx getter immutability", () => {
    it("returns a defensive copy", () => {
      const source = new Account(
        "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
        "0",
      );
      const tx = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination:
              "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
            asset: Asset.native(),
            amount: "10",
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();

      const hashBefore = tx.hash().toString("hex");

      // Attempt to mutate the XDR via the tx getter — should have no effect
      tx.tx.fee(999999);

      const hashAfter = tx.hash().toString("hex");
      expect(hashAfter).toBe(hashBefore);
    });

    it("signed transaction matches displayed fields", () => {
      const kp = Keypair.random();
      const dest = Keypair.random();
      const source = new Account(kp.publicKey(), "0");

      const tx = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: dest.publicKey(),
            asset: Asset.native(),
            amount: "10",
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();

      // Mutate via the tx getter — should have no effect
      tx.tx.fee(50000);

      // Sign and rebuild
      tx.sign(kp);
      const rebuilt = new Transaction(tx.toXDR(), Networks.TESTNET);

      // The serialized transaction must match the cached getter values
      expect(rebuilt.fee).toBe(tx.fee);
      const rebuiltOp = rebuilt.operations[0] as PaymentResult;
      const originalOp = tx.operations[0] as PaymentResult;
      expect(rebuiltOp.amount).toBe(originalOp.amount);
    });

    it("returns different copies on each access", () => {
      const source = new Account(
        "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
        "0",
      );
      const tx = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination:
              "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
            asset: Asset.native(),
            amount: "10",
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();

      // Each access returns a fresh copy
      const ref1 = tx.tx;
      const ref2 = tx.tx;
      expect(ref1).not.toBe(ref2);
      // But they are equivalent
      expect(ref1.fee()).toBe(ref2.fee());
    });

    it("works with Transaction constructed from XDR", () => {
      const kp = Keypair.random();
      const source = new Account(kp.publicKey(), "0");

      const original = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: Keypair.random().publicKey(),
            asset: Asset.native(),
            amount: "10",
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();

      original.sign(kp);
      const xdrString = original.toXDR();

      const tx = new Transaction(xdrString, Networks.TESTNET);

      const hashBefore = tx.hash().toString("hex");
      tx.tx.fee(999999);
      const hashAfter = tx.hash().toString("hex");
      expect(hashAfter).toBe(hashBefore);
    });

    it("works with TransactionBuilder.fromXDR", () => {
      const kp = Keypair.random();
      const source = new Account(kp.publicKey(), "0");

      const original = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: Keypair.random().publicKey(),
            asset: Asset.native(),
            amount: "10",
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();

      original.sign(kp);
      const xdrString = original.toXDR();

      const tx = TransactionBuilder.fromXDR(
        xdrString,
        Networks.TESTNET,
      ) as Transaction;

      const hashBefore = tx.hash().toString("hex");
      tx.tx.fee(999999);
      const hashAfter = tx.hash().toString("hex");
      expect(hashAfter).toBe(hashBefore);
    });
  });

  it("throws when a garbage Network is selected", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000.0000000";

    const input = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .addMemo(Memo.text("Happy birthday!"))
      .setTimeout(TimeoutInfinite)
      .build()
      .toEnvelope()
      .toXDR("base64");

    expect(() => {
      new Transaction(input, { garbage: "yes" } as unknown as string);
    }).toThrow(/expected a string/);

    expect(() => {
      new Transaction(input, 1234 as unknown as string);
    }).toThrow(/expected a string/);
  });

  it("throws when a Network is not passed", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000.0000000";

    const input = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .addMemo(Memo.text("Happy birthday!"))
      .setTimeout(TimeoutInfinite)
      .build()
      .toEnvelope()
      .toXDR("base64");

    expect(() => {
      // @ts-expect-error testing missing required argument
      new Transaction(input);
    }).toThrow(/expected a string/);
  });

  it("throws when no fee is provided", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000";

    expect(() =>
      new TransactionBuilder(source, {
        networkPassphrase: Networks.TESTNET,
      } as TransactionBuilderOptions)
        .addOperation(Operation.payment({ destination, asset, amount }))
        .setTimeout(TimeoutInfinite)
        .build(),
    ).toThrow(/must specify fee/);
  });

  it("signs correctly", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000";
    const signer = Keypair.master(Networks.TESTNET);

    const tx = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .setTimeout(TimeoutInfinite)
      .build();
    tx.sign(signer);

    const env = tx.toEnvelope().value() as xdr.TransactionV1Envelope;

    const sig = env.signatures()[0];
    if (sig === undefined) {
      throw new Error("expected a signature");
    }
    const rawSig = sig.signature();
    const verified = signer.verify(tx.hash(), rawSig);
    expect(verified).toBe(true);
  });

  it("signs using hash preimage", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000";

    const preimage = createTestBytes(64);
    const preimageHash = hash(preimage);

    const tx = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .setTimeout(TimeoutInfinite)
      .build();
    tx.signHashX(preimage);

    const env = tx.toEnvelope().value() as xdr.TransactionV1Envelope;
    const sig = env.signatures()[0];
    if (sig === undefined) {
      throw new Error("expected a signature");
    }
    expectBuffersToBeEqual(sig.signature(), preimage);
    expectBuffersToBeEqual(
      sig.hint(),
      preimageHash.subarray(preimageHash.length - 4),
    );
  });

  it("returns error when signing using hash preimage that is too long", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000";

    const preimage = createTestBytes(2 * 64);

    const tx = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .setTimeout(TimeoutInfinite)
      .build();

    expect(() => tx.signHashX(preimage)).toThrow(
      /preimage cannot be longer than 64 bytes/,
    );
  });

  it("adds signature correctly", () => {
    const sourceKey =
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB";
    // make two sources so they have the same seq number
    const signedSource = new Account(sourceKey, "20");
    const addedSignatureSource = new Account(sourceKey, "20");
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000";
    const signer = Keypair.master(Networks.TESTNET);

    const signedTx = new TransactionBuilder(signedSource, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569,
      },
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .build();

    const presignHash = signedTx.hash();
    signedTx.sign(signer);

    const envelopeSigned = signedTx
      .toEnvelope()
      .value() as xdr.TransactionV1Envelope;

    const addedSignatureTx = new TransactionBuilder(addedSignatureSource, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569,
      },
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .build();

    const signature = signer.sign(presignHash).toString("base64");

    addedSignatureTx.addSignature(signer.publicKey(), signature);

    const envelopeAddedSignature = addedSignatureTx
      .toEnvelope()
      .value() as xdr.TransactionV1Envelope;

    const addedSig = envelopeAddedSignature.signatures()[0];
    if (addedSig === undefined) {
      throw new Error("expected a signature");
    }

    expect(signer.verify(addedSignatureTx.hash(), addedSig.signature())).toBe(
      true,
    );

    const signedSig = envelopeSigned.signatures()[0];
    if (signedSig === undefined) {
      throw new Error("expected a signature");
    }

    expectBuffersToBeEqual(signedSig.signature(), addedSig.signature());

    expectBuffersToBeEqual(signedSig.hint(), addedSig.hint());

    expectBuffersToBeEqual(addedSignatureTx.hash(), signedTx.hash());
  });

  it("adds signature generated by getKeypairSignature", () => {
    const sourceKey =
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB";
    // make two sources so they have the same seq number
    const signedSource = new Account(sourceKey, "20");
    const addedSignatureSource = new Account(sourceKey, "20");
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000";
    const signer = Keypair.master(Networks.TESTNET);

    const signedTx = new TransactionBuilder(signedSource, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569,
      },
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .build();

    const presignHash = signedTx.hash();
    signedTx.sign(signer);

    const envelopeSigned = signedTx
      .toEnvelope()
      .value() as xdr.TransactionV1Envelope;

    const signature = new Transaction(
      signedTx.toXDR(),
      Networks.TESTNET,
    ).getKeypairSignature(signer);

    expect(signer.sign(presignHash).toString("base64")).toEqual(signature);

    const addedSignatureTx = new TransactionBuilder(addedSignatureSource, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569,
      },
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .build();

    addedSignatureTx.addSignature(signer.publicKey(), signature);

    const envelopeAddedSignature = addedSignatureTx
      .toEnvelope()
      .value() as xdr.TransactionV1Envelope;

    const addedSig = envelopeAddedSignature.signatures()[0];
    if (addedSig === undefined) {
      throw new Error("expected a signature");
    }

    expect(signer.verify(addedSignatureTx.hash(), addedSig.signature())).toBe(
      true,
    );

    const signedSig = envelopeSigned.signatures()[0];
    if (signedSig === undefined) {
      throw new Error("expected a signature");
    }

    expectBuffersToBeEqual(signedSig.signature(), addedSig.signature());

    expectBuffersToBeEqual(signedSig.hint(), addedSig.hint());

    expectBuffersToBeEqual(addedSignatureTx.hash(), signedTx.hash());
  });

  it("does not add invalid signature", () => {
    const sourceKey =
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB";
    // make two sources so they have the same seq number
    const source = new Account(sourceKey, "20");
    const sourceCopy = new Account(sourceKey, "20");
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const originalAmount = "2000";
    const alteredAmount = "1000";
    const signer = Keypair.master(Networks.TESTNET);

    const originalTx = new TransactionBuilder(source, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569,
      },
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset,
          amount: originalAmount,
        }),
      )
      .build();

    const signature = new Transaction(
      originalTx.toXDR(),
      Networks.TESTNET,
    ).getKeypairSignature(signer);

    const alteredTx = new TransactionBuilder(sourceCopy, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569,
      },
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset,
          amount: alteredAmount,
        }),
      )
      .build();

    expect(() => {
      alteredTx.addSignature(signer.publicKey(), signature);
    }).toThrow("Invalid signature");
  });

  it("accepts 0 as a valid transaction fee", () => {
    const source = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    const destination =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const asset = Asset.native();
    const amount = "2000";

    const input = new TransactionBuilder(source, {
      fee: "0",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({ destination, asset, amount }))
      .addMemo(Memo.text("Happy birthday!"))
      .setTimeout(TimeoutInfinite)
      .build()
      .toEnvelope()
      .toXDR("base64");

    const transaction = new Transaction(input, Networks.TESTNET);

    expect(transaction.fee).toBe("0");
  });

  it("outputs xdr as a string", () => {
    const xdrString =
      "AAAAAAW8Dk9idFR5Le+xi0/h/tU47bgC1YWjtPH1vIVO3BklAAAAZACoKlYAAAABAAAAAAAAAAEAAAALdmlhIGtleWJhc2UAAAAAAQAAAAAAAAAIAAAAAN7aGcXNPO36J1I8MR8S4QFhO79T5JGG2ZeS5Ka1m4mJAAAAAAAAAAFO3BklAAAAQP0ccCoeHdm3S7bOhMjXRMn3EbmETJ9glxpKUZjPSPIxpqZ7EkyTgl3FruieqpZd9LYOzdJrNik1GNBLhgTh/AU=";
    const transaction = new Transaction(xdrString, Networks.TESTNET);
    expect(typeof transaction).toBe("object");
    expect(typeof transaction.toXDR).toBe("function");
    expect(transaction.toXDR()).toBe(xdrString);
  });

  describe("TransactionEnvelope with MuxedAccount", () => {
    it("handles muxed accounts", () => {
      const networkPassphrase = "Standalone Network ; February 2017";
      const source = Keypair.master(networkPassphrase);
      const account = new Account(source.publicKey(), "7");
      const destination =
        "GDQERENWDDSQZS7R7WKHZI3BSOYMV3FSWR7TFUYFTKQ447PIX6NREOJM";
      const amount = "2000.0000000";
      const asset = Asset.native();
      const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: networkPassphrase,
        timebounds: {
          minTime: 0,
          maxTime: 0,
        },
      })
        .addOperation(
          Operation.payment({
            destination,
            asset,
            amount,
          }),
        )
        .addMemo(Memo.text("Happy birthday!"))
        .build();

      // force the source to be muxed in the envelope
      const muxedSource = new MuxedAccount(account, "0");
      const envelope = tx.toEnvelope();
      envelope.v1().tx().sourceAccount(muxedSource.toXDRObject());

      // force the payment destination to be muxed in the envelope
      const destinationMuxed = new MuxedAccount(
        new Account(destination, "1"),
        "0",
      );
      const op = envelope.v1().tx().operations()[0];
      if (op === undefined) {
        throw new Error("expected an operation");
      }
      const opValue = op.body().value();
      if (opValue === undefined) {
        throw new Error("Expected payment operation");
      }
      (opValue as xdr.PaymentOp).destination(destinationMuxed.toXDRObject());

      // muxed properties should decode
      const muxedTx = new Transaction(envelope, networkPassphrase);
      expect(tx.source).toEqual(source.publicKey());
      expect(muxedTx.source).toBe(muxedSource.accountId());
      expect((muxedTx.operations[0] as Operation.Payment).destination).toBe(
        destinationMuxed.accountId(),
      );
    });
  });

  describe("knows how to calculate claimable balance IDs", () => {
    const address = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";

    const makeBuilder = (source: Account | MuxedAccount) => {
      return new TransactionBuilder(source, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      }).setTimeout(TimeoutInfinite);
    };

    const makeClaimableBalance = () => {
      return Operation.createClaimableBalance({
        asset: Asset.native(),
        amount: "100",
        claimants: [new Claimant(address, Claimant.predicateUnconditional())],
      });
    };

    const paymentOp = Operation.payment({
      destination: address,
      asset: Asset.native(),
      amount: "100",
    });

    it("calculates from transaction src", () => {
      const gSource = new Account(address, "1234");

      const tx = makeBuilder(gSource)
        .addOperation(makeClaimableBalance())
        .build();
      const balanceId = tx.getClaimableBalanceId(0);
      expect(balanceId).toBe(
        "00000000536af35c666a28d26775008321655e9eda2039154270484e3f81d72c66d5c26f",
      );
    });

    // See https://github.com/stellar/js-stellar-base/issues/529
    it("calculates from transaction src (big number sequence)", () => {
      const gSource = new Account(address, "114272277834498050");

      const tx = makeBuilder(gSource)
        .addOperation(makeClaimableBalance())
        .build();
      const balanceId = tx.getClaimableBalanceId(0);
      expect(balanceId).toBe(
        "000000001cd1e39f422a864b4efca661e11ffaa1c54e69b23aaf096e0cfd361bb4a275bf",
      );
    });

    it("calculates from muxed transaction src as if unmuxed", () => {
      const gSource = new Account(address, "1234");
      const mSource = new MuxedAccount(gSource, "5678");
      const tx = makeBuilder(mSource)
        .addOperation(makeClaimableBalance())
        .build();

      const balanceId = tx.getClaimableBalanceId(0);
      expect(balanceId).toBe(
        "00000000536af35c666a28d26775008321655e9eda2039154270484e3f81d72c66d5c26f",
      );
    });

    it("uses transaction source even when op has its own source", () => {
      const gSource = new Account(address, "1234");
      const tx = makeBuilder(gSource)
        .addOperation(
          Operation.createClaimableBalance({
            asset: Asset.native(),
            amount: "100",
            claimants: [
              new Claimant(address, Claimant.predicateUnconditional()),
            ],
            source: Keypair.random().publicKey(),
          }),
        )
        .build();

      // Per Stellar Core (mParentTx.getSourceID()), the balance ID is always
      // derived from the transaction source, not the operation source.
      // The expected hash is the same as the "calculates from transaction src"
      // test because the tx source, sequence, and opIndex are identical.
      const balanceId = tx.getClaimableBalanceId(0);
      expect(balanceId).toBe(
        "00000000536af35c666a28d26775008321655e9eda2039154270484e3f81d72c66d5c26f",
      );
    });

    it("throws on invalid operations", () => {
      const gSource = new Account(address, "1234");
      const tx = makeBuilder(gSource)
        .addOperation(paymentOp)
        .addOperation(makeClaimableBalance())
        .build();

      expect(() => tx.getClaimableBalanceId(0)).toThrow(
        /createClaimableBalance/,
      );
      expect(() => tx.getClaimableBalanceId(1)).not.toThrow();
      expect(() => tx.getClaimableBalanceId(2)).toThrow(/index/);
      expect(() => tx.getClaimableBalanceId(-1)).toThrow(/index/);
    });
  });

  describe("preconditions", () => {
    const address = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";

    const source = new Account(address, "1234");
    const makeBuilder = () => {
      return new TransactionBuilder(source, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      });
    };

    describe("timebounds", () => {
      it("Date", () => {
        const now = new Date();
        const tx = makeBuilder().setTimebounds(now, now).build();
        const expMin = `${Math.floor(now.valueOf() / 1000)}`;
        const expMax = `${Math.floor(now.valueOf() / 1000)}`;
        if (tx.timeBounds === undefined) {
          throw new Error("Expected timeBounds to be defined");
        }
        expect(tx.timeBounds.minTime).toEqual(expMin);
        expect(tx.timeBounds.maxTime).toEqual(expMax);

        const tb = tx.toEnvelope().v1().tx().cond().timeBounds();
        expect(tb.minTime().toString()).toEqual(expMin);
        expect(tb.maxTime().toString()).toEqual(expMax);
      });

      it("number", () => {
        const tx = makeBuilder().setTimebounds(5, 10).build();
        if (tx.timeBounds === undefined) {
          throw new Error("Expected timeBounds to be defined");
        }
        expect(tx.timeBounds.minTime).toEqual("5");
        expect(tx.timeBounds.maxTime).toEqual("10");

        const tb = tx.toEnvelope().v1().tx().cond().timeBounds();
        expect(tb.minTime().toString()).toEqual("5");
        expect(tb.maxTime().toString()).toEqual("10");
      });
    });

    it("ledgerbounds", () => {
      const tx = makeBuilder().setTimeout(5).setLedgerbounds(5, 10).build();

      if (tx.ledgerBounds === undefined) {
        throw new Error("Expected ledgerBounds to be defined");
      }
      expect(tx.ledgerBounds.minLedger).toEqual(5);
      expect(tx.ledgerBounds.maxLedger).toEqual(10);

      const lb = tx.toEnvelope().v1().tx().cond().v2().ledgerBounds();
      if (lb === null) {
        throw new Error("Expected ledgerBounds to be defined");
      }
      expect(lb.minLedger()).toEqual(5);
      expect(lb.maxLedger()).toEqual(10);
    });

    it("minAccountSequence", () => {
      const tx = makeBuilder().setTimeout(5).setMinAccountSequence("5").build();
      expect(tx.minAccountSequence).toEqual("5");

      const val = tx.toEnvelope().v1().tx().cond().v2().minSeqNum();
      if (val === null) {
        throw new Error("Expected minSeqNum to be defined");
      }
      expect(val.toString()).toEqual("5");
    });

    it("minAccountSequence (big number)", () => {
      const tx = makeBuilder()
        .setTimeout(5)
        .setMinAccountSequence("103420918407103888")
        .build();
      expect(tx.minAccountSequence).toEqual("103420918407103888");

      const val = tx.toEnvelope().v1().tx().cond().v2().minSeqNum();
      if (val === null) {
        throw new Error("Expected minSeqNum to be defined");
      }
      expect(val.toString()).toEqual("103420918407103888");
    });

    it("minAccountSequenceAge", () => {
      const expectedMinAccountSequenceAge = BigInt(5);
      const tx = makeBuilder()
        .setTimeout(5)
        .setMinAccountSequenceAge(expectedMinAccountSequenceAge)
        .build();
      if (tx.minAccountSequenceAge === undefined) {
        throw new Error("Expected minAccountSequenceAge to be defined");
      }
      expect(tx.minAccountSequenceAge.toString()).toEqual(
        expectedMinAccountSequenceAge.toString(),
      );

      const val = tx.toEnvelope().v1().tx().cond().v2().minSeqAge();
      expect(val.toString()).toEqual(expectedMinAccountSequenceAge.toString());
    });

    it("minAccountSequenceLedgerGap", () => {
      const tx = makeBuilder()
        .setTimeout(5)
        .setMinAccountSequenceLedgerGap(5)
        .build();
      expect(tx.minAccountSequenceLedgerGap).toEqual(5);

      const val = tx.toEnvelope().v1().tx().cond().v2().minSeqLedgerGap();
      expect(val.toString()).toEqual("5");
    });

    it("extraSigners", () => {
      const tx = makeBuilder().setTimeout(5).setExtraSigners([address]).build();
      if (tx.extraSigners === undefined) {
        throw new Error("Expected extraSigners to be defined");
      }
      expect(tx.extraSigners).toHaveLength(1);
      expect(tx.extraSigners.map(SignerKey.encodeSignerKey)).toEqual([address]);

      const signers = tx.toEnvelope().v1().tx().cond().v2().extraSigners();
      expect(signers).toHaveLength(1);
      expect(signers[0]).toEqual(SignerKey.decodeAddress(address));
    });
  });
});
