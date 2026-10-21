import { Transaction } from "../../../../src/base/transaction.js";
import { SorobanDataBuilder } from "../../../../src/base/sorobandata_builder.js";
import * as xdr from "../../../../src/xdr/index.js";
import { expectVariant } from "./xdr.js";

/**
 * Rebuild `tx` with a new `fee` and, when given, Soroban data with a new `resourceFee`. Use it for a decoded transaction that `build()` cannot make, such as one with an out-of-range resource fee.
 */
export function withFees(
  tx: Transaction,
  fee: number,
  resourceFee?: bigint,
): Transaction {
  const { tx: inner, signatures } = expectVariant(
    tx.toEnvelope(),
    "envelopeTypeTx",
  ).v1;
  return new Transaction(
    xdr.TransactionEnvelope.envelopeTypeTx(
      new xdr.TransactionV1Envelope({
        tx: new xdr.Transaction({
          sourceAccount: inner.sourceAccount,
          fee,
          seqNum: inner.seqNum,
          cond: inner.cond,
          memo: inner.memo,
          operations: inner.operations,
          ext:
            resourceFee === undefined
              ? inner.ext
              : xdr.TransactionExt.sorobanData(
                  new SorobanDataBuilder().setResourceFee(resourceFee).build(),
                ),
        }),
        signatures,
      }),
    ),
    tx.networkPassphrase,
  );
}
