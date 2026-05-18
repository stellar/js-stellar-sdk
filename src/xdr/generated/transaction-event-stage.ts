import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type TransactionEventStageWire = number;

export type TransactionEventStageName =
  | "transactionEventStageBeforeAllTxs"
  | "transactionEventStageAfterTx"
  | "transactionEventStageAfterAllTxs";

/**
 * ```xdr
 * enum TransactionEventStage {
 *     // The event has happened before any one of the transactions has its
 *     // operations applied.
 *     TRANSACTION_EVENT_STAGE_BEFORE_ALL_TXS = 0,
 *     // The event has happened immediately after operations of the transaction
 *     // have been applied.
 *     TRANSACTION_EVENT_STAGE_AFTER_TX = 1,
 *     // The event has happened after every transaction had its operations
 *     // applied.
 *     TRANSACTION_EVENT_STAGE_AFTER_ALL_TXS = 2
 * };
 * ```
 */
export class TransactionEventStage extends EnumValue<TransactionEventStageName> {
  static readonly transactionEventStageBeforeAllTxs = new TransactionEventStage(
    "transactionEventStageBeforeAllTxs",
    0,
  );
  static readonly transactionEventStageAfterTx = new TransactionEventStage(
    "transactionEventStageAfterTx",
    1,
  );
  static readonly transactionEventStageAfterAllTxs = new TransactionEventStage(
    "transactionEventStageAfterAllTxs",
    2,
  );

  private static readonly byValue: Readonly<
    Record<number, TransactionEventStage>
  > = {
    0: TransactionEventStage.transactionEventStageBeforeAllTxs,
    1: TransactionEventStage.transactionEventStageAfterTx,
    2: TransactionEventStage.transactionEventStageAfterAllTxs,
  };

  static readonly schema = enumType("TransactionEventStage", {
    transactionEventStageBeforeAllTxs: 0,
    transactionEventStageAfterTx: 1,
    transactionEventStageAfterAllTxs: 2,
  });

  static fromValue(value: number): TransactionEventStage {
    return enumLookup(
      "TransactionEventStage",
      TransactionEventStage.byValue,
      value,
    ) as TransactionEventStage;
  }

  static fromName(name: TransactionEventStageName): TransactionEventStage {
    switch (name) {
      case "transactionEventStageBeforeAllTxs":
        return TransactionEventStage.transactionEventStageBeforeAllTxs;
      case "transactionEventStageAfterTx":
        return TransactionEventStage.transactionEventStageAfterTx;
      case "transactionEventStageAfterAllTxs":
        return TransactionEventStage.transactionEventStageAfterAllTxs;
      default:
        throw new XdrError(`TransactionEventStage: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): TransactionEventStage {
    return TransactionEventStage.fromValue(wire);
  }
}
