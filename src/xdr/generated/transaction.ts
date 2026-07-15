import { array, int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { MuxedAccount, type MuxedAccountWire } from "./muxed-account.js";
import { Preconditions, type PreconditionsWire } from "./preconditions.js";
import { Memo, type MemoWire } from "./memo.js";
import { Operation, type OperationWire } from "./operation.js";
import { TransactionExt, type TransactionExtWire } from "./transaction-ext.js";

export interface TransactionWire {
  sourceAccount: MuxedAccountWire;
  fee: number;
  seqNum: bigint;
  cond: PreconditionsWire;
  memo: MemoWire;
  operations: OperationWire[];
  ext: TransactionExtWire;
}

/**
 * ```xdr
 * struct Transaction
 * {
 *     // account used to run the transaction
 *     MuxedAccount sourceAccount;
 *
 *     // the fee the sourceAccount will pay
 *     uint32 fee;
 *
 *     // sequence number to consume in the account
 *     SequenceNumber seqNum;
 *
 *     // validity conditions
 *     Preconditions cond;
 *
 *     Memo memo;
 *
 *     Operation operations<MAX_OPS_PER_TX>;
 *
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         SorobanTransactionData sorobanData;
 *     }
 *     ext;
 * };
 * ```
 */
export class Transaction extends XdrValue {
  readonly sourceAccount: MuxedAccount;
  readonly fee: number;
  readonly seqNum: bigint;
  readonly cond: Preconditions;
  readonly memo: Memo;
  readonly operations: Operation[];
  readonly ext: TransactionExt;

  static readonly schema: XdrType<TransactionWire> = struct("Transaction", {
    sourceAccount: MuxedAccount.schema,
    fee: uint32(),
    seqNum: int64(),
    cond: Preconditions.schema,
    memo: Memo.schema,
    operations: array(Operation.schema, 100),
    ext: TransactionExt.schema,
  });

  constructor(input: {
    sourceAccount: MuxedAccount;
    fee: number;
    seqNum: bigint;
    cond: Preconditions;
    memo: Memo;
    operations: Operation[];
    ext: TransactionExt;
  }) {
    super();
    this.sourceAccount = input.sourceAccount;
    this.fee = input.fee;
    this.seqNum = input.seqNum;
    this.cond = input.cond;
    this.memo = input.memo;
    this.operations = input.operations;
    this.ext = input.ext;
  }

  toXdrObject(): TransactionWire {
    return {
      sourceAccount: this.sourceAccount.toXdrObject(),
      fee: this.fee,
      seqNum: this.seqNum,
      cond: this.cond.toXdrObject(),
      memo: this.memo.toXdrObject(),
      operations: this.operations.map((v) => v.toXdrObject()),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: TransactionWire): Transaction {
    return new Transaction({
      sourceAccount: MuxedAccount.fromXdrObject(wire.sourceAccount),
      fee: wire.fee,
      seqNum: wire.seqNum,
      cond: Preconditions.fromXdrObject(wire.cond),
      memo: Memo.fromXdrObject(wire.memo),
      operations: wire.operations.map((w) => Operation.fromXdrObject(w)),
      ext: TransactionExt.fromXdrObject(wire.ext),
    });
  }
}
