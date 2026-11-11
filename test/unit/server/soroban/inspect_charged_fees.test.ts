import { describe, it, expect } from "vitest";
import * as StellarSdk from "../../../../src/index.js";

const {
  Account,
  Address,
  Asset,
  Keypair,
  Networks,
  Operation,
  SorobanDataBuilder,
  StrKey,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  xdr,
} = StellarSdk;

const source = new Account(Keypair.random().publicKey(), "1");

function classicTx() {
  return new TransactionBuilder(source, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: Keypair.random().publicKey(),
        asset: Asset.native(),
        amount: "1",
      }),
    )
    .setTimeout(30)
    .build();
}

function sorobanTx(resourceFee: number) {
  return new TransactionBuilder(source, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.extendFootprintTtl({ extendTo: 1000 }))
    .setSorobanData(
      new SorobanDataBuilder().setResourceFee(resourceFee).build(),
    )
    .setTimeout(30)
    .build();
}

function result(feeCharged: number) {
  return new xdr.TransactionResult({
    feeCharged: BigInt(feeCharged),
    result: xdr.TransactionResultResult.txSuccess([]),
    ext: xdr.TransactionResultExt.v0(),
  });
}

function sorobanExt(nonRefundable: number, refundable: number, rent: number) {
  return xdr.SorobanTransactionMetaExt.v1(
    new xdr.SorobanTransactionMetaExtV1({
      ext: xdr.ExtensionPoint.v0(),
      totalNonRefundableResourceFeeCharged: BigInt(nonRefundable),
      totalRefundableResourceFeeCharged: BigInt(refundable),
      rentFeeCharged: BigInt(rent),
    }),
  );
}

const feeSource = Keypair.random().publicKey();

const beforeAllTxs =
  xdr.TransactionEventStage.transactionEventStageBeforeAllTxs;
const afterAllTxs = xdr.TransactionEventStage.transactionEventStageAfterAllTxs;

// A fee event as core writes it: the charge before all transactions, and the
// refund (a negative amount) after them. The options build events core would
// not write.
function feeEvent(
  amount: number,
  {
    stage = amount > 0 ? beforeAllTxs : afterAllTxs,
    topic = "fee",
    data = nativeToScVal(amount, { type: "i128" }),
  }: {
    stage?: StellarSdk.xdr.TransactionEventStage;
    topic?: string;
    data?: StellarSdk.xdr.ScVal;
  } = {},
) {
  return new xdr.TransactionEvent({
    stage,
    event: new xdr.ContractEvent({
      ext: xdr.ExtensionPoint.v0(),
      contractId: new xdr.ContractId(
        StrKey.decodeContract(Asset.native().contractId(Networks.TESTNET)),
      ),
      type: xdr.ContractEventType.contract,
      body: xdr.ContractEventBody.v0(
        new xdr.ContractEventV0({
          topics: [
            nativeToScVal(topic, { type: "symbol" }),
            new Address(feeSource).toScVal(),
          ],
          data,
        }),
      ),
    }),
  });
}

function metaV4(
  ext: StellarSdk.xdr.SorobanTransactionMetaExt | null,
  events: StellarSdk.xdr.TransactionEvent[] = [],
) {
  return xdr.TransactionMeta.v4(
    new xdr.TransactionMetaV4({
      ext: xdr.ExtensionPoint.v0(),
      txChangesBefore: [],
      operations: [],
      txChangesAfter: [],
      sorobanMeta:
        ext === null
          ? null
          : new xdr.SorobanTransactionMetaV2({ ext, returnValue: null }),
      events,
      diagnosticEvents: [],
    }),
  );
}

function metaV3(ext: StellarSdk.xdr.SorobanTransactionMetaExt) {
  return xdr.TransactionMeta.v3(
    new xdr.TransactionMetaV3({
      ext: xdr.ExtensionPoint.v0(),
      txChangesBefore: [],
      operations: [],
      txChangesAfter: [],
      sorobanMeta: new xdr.SorobanTransactionMeta({
        ext,
        events: [],
        returnValue: xdr.ScVal.scvVoid(),
        diagnosticEvents: [],
      }),
    }),
  );
}

const metaV2 = xdr.TransactionMeta.v2(
  new xdr.TransactionMetaV2({
    txChangesBefore: [],
    operations: [],
    txChangesAfter: [],
  }),
);

describe("rpc.inspectChargedFees", () => {
  it("splits a Soroban transaction's fee from meta v4", () => {
    // 60100 declared: 100 inclusion + 60000 resource
    const fees = rpc.inspectChargedFees({
      envelopeXdr: sorobanTx(60000).toEnvelope(),
      resultXdr: result(58990),
      resultMetaXdr: metaV4(sorobanExt(55618, 3272, 1000)),
    });

    expect(fees).toEqual({
      declared: { max: "60100", resource: "60000", inclusion: "100" },
      charged: {
        total: "58990",
        inclusion: "100",
        resource: {
          total: "58890",
          nonRefundable: "55618",
          refundable: "3272",
          rent: "1000",
        },
      },
      refunded: "1110",
    });
  });

  it("reads the split from meta v3", () => {
    const fees = rpc.inspectChargedFees({
      envelopeXdr: sorobanTx(60000).toEnvelope(),
      resultXdr: result(58990),
      resultMetaXdr: metaV3(sorobanExt(55618, 3272, 0)),
    });

    expect(fees.charged.inclusion).toBe("100");
    expect(fees.charged.resource?.total).toBe("58890");
    expect(fees.refunded).toBe("1110");
  });

  it("reports a failed transaction's zero refundable fee as fully refunded", () => {
    const fees = rpc.inspectChargedFees({
      envelopeXdr: sorobanTx(60000).toEnvelope(),
      resultXdr: result(3487),
      resultMetaXdr: metaV4(sorobanExt(3387, 0, 0)),
    });

    expect(fees.charged.inclusion).toBe("100");
    expect(fees.charged.resource?.refundable).toBe("0");
    expect(fees.refunded).toBe("56613");
  });

  it("uses the outer fee and inner resource fee for a fee bump", () => {
    const bump = TransactionBuilder.buildFeeBumpTransaction(
      Keypair.random(),
      "200",
      sorobanTx(60000),
      Networks.TESTNET,
    );
    // 200 per operation, for the inner operation plus the bump
    expect(bump.fee).toBe("60400");

    const fees = rpc.inspectChargedFees({
      envelopeXdr: bump.toEnvelope(),
      resultXdr: result(59290),
      resultMetaXdr: metaV4(sorobanExt(55618, 3272, 0)),
    });

    expect(fees.declared).toEqual({
      max: "60400",
      resource: "60000",
      inclusion: "400",
    });
    expect(fees.charged.inclusion).toBe("400");
    expect(fees.refunded).toBe("1110");
  });

  it("leaves the split null when the meta has no Soroban fee breakdown", () => {
    for (const meta of [
      metaV4(xdr.SorobanTransactionMetaExt.v0()),
      metaV4(null),
      metaV2,
    ]) {
      const fees = rpc.inspectChargedFees({
        envelopeXdr: sorobanTx(60000).toEnvelope(),
        resultXdr: result(58990),
        resultMetaXdr: meta,
      });

      expect(fees.declared.resource).toBe("60000");
      expect(fees.charged).toEqual({
        total: "58990",
        inclusion: null,
        resource: null,
      });
      expect(fees.refunded).toBeNull();
    }
  });

  // Without fee events the split is derived. Core skips the refund when the
  // fee source was merged, leaving feeCharged at the full declared resource
  // fee while meta still shows what was consumed.
  it("leaves inclusion and refund null when a derived refund was skipped", () => {
    const fees = rpc.inspectChargedFees({
      envelopeXdr: sorobanTx(60000).toEnvelope(),
      resultXdr: result(60100),
      resultMetaXdr: metaV4(sorobanExt(55618, 3272, 1000)),
    });

    expect(fees.charged.inclusion).toBeNull();
    expect(fees.charged.resource?.total).toBe("58890");
    expect(fees.refunded).toBeNull();
  });

  describe("with fee events", () => {
    // Both paths give the same answer when core paid the refund. The tests
    // below tell them apart.
    it("agrees with the derived split when core paid the refund", () => {
      const input = {
        envelopeXdr: sorobanTx(60000).toEnvelope(),
        resultXdr: result(58990),
      };
      const fees = rpc.inspectChargedFees({
        ...input,
        resultMetaXdr: metaV4(sorobanExt(55618, 3272, 1000), [
          feeEvent(60100),
          feeEvent(-1110),
        ]),
      });

      expect(fees.charged.inclusion).toBe("100");
      expect(fees.refunded).toBe("1110");
      expect(fees).toEqual(
        rpc.inspectChargedFees({
          ...input,
          resultMetaXdr: metaV4(sorobanExt(55618, 3272, 1000)),
        }),
      );
    });

    // 10,060,000 declared: a 10,000,000 inclusion bid hides the skipped
    // refund from the derived path, which would report 1210 and 1110.
    it("reports a skipped refund as zero, even under a high bid", () => {
      const tx = new TransactionBuilder(source, {
        fee: "10000000",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.extendFootprintTtl({ extendTo: 1000 }))
        .setSorobanData(new SorobanDataBuilder().setResourceFee(60000).build())
        .setTimeout(30)
        .build();
      const input = {
        envelopeXdr: tx.toEnvelope(),
        resultXdr: result(60100),
      };

      const fees = rpc.inspectChargedFees({
        ...input,
        resultMetaXdr: metaV4(sorobanExt(55618, 3272, 1000), [feeEvent(60100)]),
      });
      expect(fees.charged.total).toBe("60100");
      expect(fees.charged.inclusion).toBe("100");
      expect(fees.charged.resource?.total).toBe("58890");
      expect(fees.refunded).toBe("0");

      const derived = rpc.inspectChargedFees({
        ...input,
        resultMetaXdr: metaV4(sorobanExt(55618, 3272, 1000)),
      });
      expect(derived.charged.inclusion).toBe("1210");
      expect(derived.refunded).toBe("1110");
    });

    it("reads them without a Soroban fee breakdown", () => {
      const fees = rpc.inspectChargedFees({
        envelopeXdr: sorobanTx(60000).toEnvelope(),
        resultXdr: result(58990),
        resultMetaXdr: metaV4(xdr.SorobanTransactionMetaExt.v0(), [
          feeEvent(60100),
          feeEvent(-1110),
        ]),
      });

      expect(fees.charged.inclusion).toBe("100");
      expect(fees.charged.resource).toBeNull();
      expect(fees.refunded).toBe("1110");
    });

    it("falls back to the derived split when they don't add up to the fee charged", () => {
      const fees = rpc.inspectChargedFees({
        envelopeXdr: sorobanTx(60000).toEnvelope(),
        resultXdr: result(58990),
        resultMetaXdr: metaV4(sorobanExt(55618, 3272, 1000), [
          feeEvent(60100),
          feeEvent(-5),
        ]),
      });

      expect(fees.charged.inclusion).toBe("100");
      expect(fees.refunded).toBe("1110");
    });

    // These add up to the fee charged, so only the topic or data type gives
    // them away. With no fee breakdown to fall back on, nothing is reported.
    it("ignores events that aren't core's fee events", () => {
      for (const events of [
        [
          feeEvent(60100, { topic: "transfer" }),
          feeEvent(-1110, { topic: "transfer" }),
        ],
        [
          feeEvent(60100, { data: nativeToScVal(60100, { type: "u64" }) }),
          feeEvent(-1110),
        ],
      ]) {
        const fees = rpc.inspectChargedFees({
          envelopeXdr: sorobanTx(60000).toEnvelope(),
          resultXdr: result(58990),
          resultMetaXdr: metaV4(xdr.SorobanTransactionMetaExt.v0(), events),
        });

        expect(fees.charged.inclusion).toBeNull();
        expect(fees.refunded).toBeNull();
      }
    });

    // The stage, not the sign, says which side an amount is on. A positive
    // amount after all transactions is a negative refund: 60050 + 50 = 60100.
    it("ignores events with a negative refund", () => {
      const fees = rpc.inspectChargedFees({
        envelopeXdr: sorobanTx(60000).toEnvelope(),
        resultXdr: result(60100),
        resultMetaXdr: metaV4(xdr.SorobanTransactionMetaExt.v0(), [
          feeEvent(60050),
          feeEvent(50, { stage: afterAllTxs }),
        ]),
      });

      expect(fees.charged.inclusion).toBeNull();
      expect(fees.refunded).toBeNull();
    });

    it("leaves inclusion null when the events put it outside the declared one", () => {
      for (const [charge, refund] of [
        [60300, -1310], // 300, above the 100 declared
        [59900, -910], // -100
      ] as const) {
        const fees = rpc.inspectChargedFees({
          envelopeXdr: sorobanTx(60000).toEnvelope(),
          resultXdr: result(58990),
          resultMetaXdr: metaV4(xdr.SorobanTransactionMetaExt.v0(), [
            feeEvent(charge),
            feeEvent(refund),
          ]),
        });

        expect(fees.charged.inclusion).toBeNull();
      }
    });
  });

  it("drops a breakdown that doesn't fit the declared resource fee", () => {
    for (const meta of [
      sorobanExt(55618, 5000, 0), // resource above declared
      sorobanExt(55618, 3272, 4000), // rent above refundable
      sorobanExt(-1, 3272, 0), // negative non-refundable fee
      sorobanExt(55618, 3272, -1), // negative rent
    ]) {
      const fees = rpc.inspectChargedFees({
        envelopeXdr: sorobanTx(60000).toEnvelope(),
        resultXdr: result(58990),
        resultMetaXdr: metaV4(meta),
      });

      expect(fees.charged.inclusion).toBeNull();
      expect(fees.charged.resource).toBeNull();
      expect(fees.refunded).toBeNull();
    }
  });

  it("keeps the breakdown when the fee charged doesn't fit it", () => {
    for (const feeCharged of [
      70000, // above the declared fee
      50000, // below the consumed resource fee
    ]) {
      const fees = rpc.inspectChargedFees({
        envelopeXdr: sorobanTx(60000).toEnvelope(),
        resultXdr: result(feeCharged),
        resultMetaXdr: metaV4(sorobanExt(55618, 3272, 0)),
      });

      expect(fees.charged.inclusion).toBeNull();
      expect(fees.charged.resource?.total).toBe("58890");
      expect(fees.refunded).toBeNull();
    }
  });

  it("reports a negative declared inclusion fee", () => {
    const bump = TransactionBuilder.buildFeeBumpTransaction(
      Keypair.random(),
      "200",
      sorobanTx(60000),
      Networks.TESTNET,
    ).toEnvelope();
    if (bump.type !== "envelopeTypeTxFeeBump") {
      throw new Error("not a fee bump");
    }
    const low = xdr.TransactionEnvelope.envelopeTypeTxFeeBump(
      new xdr.FeeBumpTransactionEnvelope({
        tx: new xdr.FeeBumpTransaction({
          feeSource: bump.feeBump.tx.feeSource,
          fee: 59500n,
          innerTx: bump.feeBump.tx.innerTx,
          ext: bump.feeBump.tx.ext,
        }),
        signatures: [],
      }),
    );
    // No charged inclusion fee fits a negative bid, whatever the events say.
    const fees = rpc.inspectChargedFees({
      envelopeXdr: low,
      resultXdr: result(58390),
      resultMetaXdr: metaV4(sorobanExt(55618, 3272, 0), [
        feeEvent(59500),
        feeEvent(-1110),
      ]),
    });

    expect(fees.declared).toEqual({
      max: "59500",
      resource: "60000",
      inclusion: "-500",
    });
    expect(fees.charged.inclusion).toBeNull();
  });

  it("throws for a response with no transaction", () => {
    expect(() =>
      rpc.inspectChargedFees({
        status: "NOT_FOUND",
      } as unknown as StellarSdk.rpc.ChargedFeesInput),
    ).toThrow(/landed transaction/);
  });

  it("throws when the envelope, result or meta is missing", () => {
    const input = {
      envelopeXdr: classicTx().toEnvelope(),
      resultXdr: result(100),
      resultMetaXdr: metaV4(null),
    };
    expect(() => rpc.inspectChargedFees(input)).not.toThrow();

    for (const field of ["envelopeXdr", "resultXdr", "resultMetaXdr"]) {
      expect(() =>
        rpc.inspectChargedFees({
          ...input,
          [field]: undefined,
        } as unknown as StellarSdk.rpc.ChargedFeesInput),
      ).toThrow(/landed transaction/);
    }
  });

  it("reports a classic transaction's whole fee as inclusion", () => {
    const fees = rpc.inspectChargedFees({
      envelopeXdr: classicTx().toEnvelope(),
      resultXdr: result(100),
      resultMetaXdr: metaV4(null),
    });

    expect(fees).toEqual({
      declared: { max: "100", resource: null, inclusion: "100" },
      charged: { total: "100", inclusion: "100", resource: null },
      refunded: null,
    });
  });

  it("reads the fee from a v0 envelope", () => {
    const envelope = xdr.TransactionEnvelope.envelopeTypeTxV0(
      new xdr.TransactionV0Envelope({
        tx: new xdr.TransactionV0({
          sourceAccountEd25519: Keypair.random().rawPublicKey(),
          fee: 100,
          seqNum: 2n,
          timeBounds: null,
          memo: xdr.Memo.memoNone(),
          operations: [],
          ext: xdr.TransactionV0Ext.v0(),
        }),
        signatures: [],
      }),
    );

    const fees = rpc.inspectChargedFees({
      envelopeXdr: envelope,
      resultXdr: result(100),
      resultMetaXdr: metaV2,
    });

    expect(fees.declared).toEqual({
      max: "100",
      resource: null,
      inclusion: "100",
    });
    expect(fees.charged.inclusion).toBe("100");
  });
});
