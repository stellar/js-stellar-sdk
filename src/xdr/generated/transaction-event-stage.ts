import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("TransactionEventStage", {
      transactionEventStageBeforeAllTxs: 0,
      transactionEventStageAfterTx: 1,
      transactionEventStageAfterAllTxs: 2,
    }),
    "transactionEventStage",
  );

  static fromValue(value: number): TransactionEventStage {
    return enumFromValue(
      "TransactionEventStage",
      TransactionEventStage.schema,
      TransactionEventStage,
      value,
    );
  }

  static fromName(name: TransactionEventStageName): TransactionEventStage {
    return enumFromName("TransactionEventStage", TransactionEventStage, name);
  }

  static fromXdrObject(wire: number): TransactionEventStage {
    return TransactionEventStage.fromValue(wire);
  }
}
