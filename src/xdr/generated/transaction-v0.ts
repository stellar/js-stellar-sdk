import { array, int64, opaque, option, struct, uint32 } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { TimeBounds, type TimeBoundsWire } from "./time-bounds.js";
import { Memo, type MemoWire } from "./memo.js";
import { Operation, type OperationWire } from "./operation.js";
import {
  TransactionV0Ext,
  type TransactionV0ExtWire,
} from "./transaction-v0-ext.js";

export interface TransactionV0Wire {
  sourceAccountEd25519: Uint8Array;
  fee: number;
  seqNum: bigint;
  timeBounds: TimeBoundsWire | null;
  memo: MemoWire;
  operations: OperationWire[];
  ext: TransactionV0ExtWire;
}

/**
 * ```xdr
 * struct TransactionV0
 * {
 *     uint256 sourceAccountEd25519;
 *     uint32 fee;
 *     SequenceNumber seqNum;
 *     TimeBounds* timeBounds;
 *     Memo memo;
 *     Operation operations<MAX_OPS_PER_TX>;
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class TransactionV0 extends XdrValue {
  readonly sourceAccountEd25519: Uint8Array;
  readonly fee: number;
  readonly seqNum: bigint;
  readonly timeBounds: TimeBounds | null;
  readonly memo: Memo;
  readonly operations: Operation[];
  readonly ext: TransactionV0Ext;

  static readonly schema: XdrType<TransactionV0Wire> = struct("TransactionV0", {
    sourceAccountEd25519: opaque(32),
    fee: uint32(),
    seqNum: int64(),
    timeBounds: option(TimeBounds.schema),
    memo: Memo.schema,
    operations: array(Operation.schema, UNBOUNDED_MAX_LENGTH),
    ext: TransactionV0Ext.schema,
  });

  constructor(input: {
    sourceAccountEd25519: Uint8Array;
    fee: number;
    seqNum: bigint;
    timeBounds: TimeBounds | null;
    memo: Memo;
    operations: Operation[];
    ext: TransactionV0Ext;
  }) {
    super();
    this.sourceAccountEd25519 = input.sourceAccountEd25519;
    this.fee = input.fee;
    this.seqNum = input.seqNum;
    this.timeBounds = input.timeBounds;
    this.memo = input.memo;
    this.operations = input.operations;
    this.ext = input.ext;
  }

  toXdrObject(): TransactionV0Wire {
    return {
      sourceAccountEd25519: this.sourceAccountEd25519,
      fee: this.fee,
      seqNum: this.seqNum,
      timeBounds:
        this.timeBounds === null ? null : this.timeBounds.toXdrObject(),
      memo: this.memo.toXdrObject(),
      operations: this.operations.map((v) => v.toXdrObject()),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: TransactionV0Wire): TransactionV0 {
    return new TransactionV0({
      sourceAccountEd25519: wire.sourceAccountEd25519,
      fee: wire.fee,
      seqNum: wire.seqNum,
      timeBounds:
        wire.timeBounds === null
          ? null
          : TimeBounds.fromXdrObject(wire.timeBounds),
      memo: Memo.fromXdrObject(wire.memo),
      operations: wire.operations.map((w) => Operation.fromXdrObject(w)),
      ext: TransactionV0Ext.fromXdrObject(wire.ext),
    });
  }
}
