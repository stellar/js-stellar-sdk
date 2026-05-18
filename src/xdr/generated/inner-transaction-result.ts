import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  InnerTransactionResultResult,
  type InnerTransactionResultResultWire,
} from "./inner-transaction-result-result.js";
import {
  InnerTransactionResultExt,
  type InnerTransactionResultExtWire,
} from "./inner-transaction-result-ext.js";

export interface InnerTransactionResultWire {
  feeCharged: bigint;
  result: InnerTransactionResultResultWire;
  ext: InnerTransactionResultExtWire;
}

/**
 * ```xdr
 * struct InnerTransactionResult
 * {
 *     // Always 0. Here for binary compatibility.
 *     int64 feeCharged;
 *
 *     union switch (TransactionResultCode code)
 *     {
 *     // txFEE_BUMP_INNER_SUCCESS is not included
 *     case txSUCCESS:
 *     case txFAILED:
 *         OperationResult results<>;
 *     case txTOO_EARLY:
 *     case txTOO_LATE:
 *     case txMISSING_OPERATION:
 *     case txBAD_SEQ:
 *     case txBAD_AUTH:
 *     case txINSUFFICIENT_BALANCE:
 *     case txNO_ACCOUNT:
 *     case txINSUFFICIENT_FEE:
 *     case txBAD_AUTH_EXTRA:
 *     case txINTERNAL_ERROR:
 *     case txNOT_SUPPORTED:
 *     // txFEE_BUMP_INNER_FAILED is not included
 *     case txBAD_SPONSORSHIP:
 *     case txBAD_MIN_SEQ_AGE_OR_GAP:
 *     case txMALFORMED:
 *     case txSOROBAN_INVALID:
 *     case txFROZEN_KEY_ACCESSED:
 *         void;
 *     }
 *     result;
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class InnerTransactionResult extends XdrValue {
  readonly feeCharged: bigint;
  readonly result: InnerTransactionResultResult;
  readonly ext: InnerTransactionResultExt;

  static readonly schema: XdrType<InnerTransactionResultWire> = struct(
    "InnerTransactionResult",
    {
      feeCharged: int64(),
      result: InnerTransactionResultResult.schema,
      ext: InnerTransactionResultExt.schema,
    },
  );

  constructor(input: {
    feeCharged: bigint;
    result: InnerTransactionResultResult;
    ext: InnerTransactionResultExt;
  }) {
    super();
    this.feeCharged = input.feeCharged;
    this.result = input.result;
    this.ext = input.ext;
  }

  toXdrObject(): InnerTransactionResultWire {
    return {
      feeCharged: this.feeCharged,
      result: this.result.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: InnerTransactionResultWire,
  ): InnerTransactionResult {
    return new InnerTransactionResult({
      feeCharged: wire.feeCharged,
      result: InnerTransactionResultResult.fromXdrObject(wire.result),
      ext: InnerTransactionResultExt.fromXdrObject(wire.ext),
    });
  }
}
