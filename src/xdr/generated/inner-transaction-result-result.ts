/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { TransactionResultCode } from "./transaction-result-code.js";
import {
  OperationResult,
  type OperationResultWire,
} from "./operation-result.js";

export type InnerTransactionResultResultWire =
  | { code: 0; results: OperationResultWire[] }
  | { code: -1; results: OperationResultWire[] }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 }
  | { code: -7 }
  | { code: -8 }
  | { code: -9 }
  | { code: -10 }
  | { code: -11 }
  | { code: -12 }
  | { code: -14 }
  | { code: -15 }
  | { code: -16 }
  | { code: -17 }
  | { code: -18 };

export type InnerTransactionResultResultVariantName =
  | "txSuccess"
  | "txFailed"
  | "txTooEarly"
  | "txTooLate"
  | "txMissingOperation"
  | "txBadSeq"
  | "txBadAuth"
  | "txInsufficientBalance"
  | "txNoAccount"
  | "txInsufficientFee"
  | "txBadAuthExtra"
  | "txInternalError"
  | "txNotSupported"
  | "txBadSponsorship"
  | "txBadMinSeqAgeOrGap"
  | "txMalformed"
  | "txSorobanInvalid"
  | "txFrozenKeyAccessed";

/**
 * ```xdr
 * union switch (TransactionResultCode code)
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
 * ```
 */
abstract class InnerTransactionResultResultBase extends XdrValue {
  abstract readonly type: InnerTransactionResultResultVariantName;

  static readonly schema: XdrType<InnerTransactionResultResultWire> = union(
    "InnerTransactionResultResult",
    {
      switchOn: TransactionResultCode.schema,
      cases: [
        case_(
          "txSuccess",
          0,
          field("results", array(OperationResult.schema, UNBOUNDED_MAX_LENGTH)),
        ),
        case_(
          "txFailed",
          -1,
          field("results", array(OperationResult.schema, UNBOUNDED_MAX_LENGTH)),
        ),
        case_("txTooEarly", -2, voidType()),
        case_("txTooLate", -3, voidType()),
        case_("txMissingOperation", -4, voidType()),
        case_("txBadSeq", -5, voidType()),
        case_("txBadAuth", -6, voidType()),
        case_("txInsufficientBalance", -7, voidType()),
        case_("txNoAccount", -8, voidType()),
        case_("txInsufficientFee", -9, voidType()),
        case_("txBadAuthExtra", -10, voidType()),
        case_("txInternalError", -11, voidType()),
        case_("txNotSupported", -12, voidType()),
        case_("txBadSponsorship", -14, voidType()),
        case_("txBadMinSeqAgeOrGap", -15, voidType()),
        case_("txMalformed", -16, voidType()),
        case_("txSorobanInvalid", -17, voidType()),
        case_("txFrozenKeyAccessed", -18, voidType()),
      ],
      switchKey: "code",
    },
  );

  static txSuccess(
    results: OperationResult[],
  ): InnerTransactionResultResultTxSuccess {
    return new InnerTransactionResultResultTxSuccess(results);
  }

  static txFailed(
    results: OperationResult[],
  ): InnerTransactionResultResultTxFailed {
    return new InnerTransactionResultResultTxFailed(results);
  }

  static txTooEarly(): InnerTransactionResultResultTxTooEarly {
    return new InnerTransactionResultResultTxTooEarly();
  }

  static txTooLate(): InnerTransactionResultResultTxTooLate {
    return new InnerTransactionResultResultTxTooLate();
  }

  static txMissingOperation(): InnerTransactionResultResultTxMissingOperation {
    return new InnerTransactionResultResultTxMissingOperation();
  }

  static txBadSeq(): InnerTransactionResultResultTxBadSeq {
    return new InnerTransactionResultResultTxBadSeq();
  }

  static txBadAuth(): InnerTransactionResultResultTxBadAuth {
    return new InnerTransactionResultResultTxBadAuth();
  }

  static txInsufficientBalance(): InnerTransactionResultResultTxInsufficientBalance {
    return new InnerTransactionResultResultTxInsufficientBalance();
  }

  static txNoAccount(): InnerTransactionResultResultTxNoAccount {
    return new InnerTransactionResultResultTxNoAccount();
  }

  static txInsufficientFee(): InnerTransactionResultResultTxInsufficientFee {
    return new InnerTransactionResultResultTxInsufficientFee();
  }

  static txBadAuthExtra(): InnerTransactionResultResultTxBadAuthExtra {
    return new InnerTransactionResultResultTxBadAuthExtra();
  }

  static txInternalError(): InnerTransactionResultResultTxInternalError {
    return new InnerTransactionResultResultTxInternalError();
  }

  static txNotSupported(): InnerTransactionResultResultTxNotSupported {
    return new InnerTransactionResultResultTxNotSupported();
  }

  static txBadSponsorship(): InnerTransactionResultResultTxBadSponsorship {
    return new InnerTransactionResultResultTxBadSponsorship();
  }

  static txBadMinSeqAgeOrGap(): InnerTransactionResultResultTxBadMinSeqAgeOrGap {
    return new InnerTransactionResultResultTxBadMinSeqAgeOrGap();
  }

  static txMalformed(): InnerTransactionResultResultTxMalformed {
    return new InnerTransactionResultResultTxMalformed();
  }

  static txSorobanInvalid(): InnerTransactionResultResultTxSorobanInvalid {
    return new InnerTransactionResultResultTxSorobanInvalid();
  }

  static txFrozenKeyAccessed(): InnerTransactionResultResultTxFrozenKeyAccessed {
    return new InnerTransactionResultResultTxFrozenKeyAccessed();
  }

  static fromXdrObject(
    wire: InnerTransactionResultResultWire,
  ): InnerTransactionResultResult {
    switch (wire.code) {
      case 0:
        return new InnerTransactionResultResultTxSuccess(
          wire.results.map((w) => OperationResult.fromXdrObject(w)),
        );
      case -1:
        return new InnerTransactionResultResultTxFailed(
          wire.results.map((w) => OperationResult.fromXdrObject(w)),
        );
      case -2:
        return new InnerTransactionResultResultTxTooEarly();
      case -3:
        return new InnerTransactionResultResultTxTooLate();
      case -4:
        return new InnerTransactionResultResultTxMissingOperation();
      case -5:
        return new InnerTransactionResultResultTxBadSeq();
      case -6:
        return new InnerTransactionResultResultTxBadAuth();
      case -7:
        return new InnerTransactionResultResultTxInsufficientBalance();
      case -8:
        return new InnerTransactionResultResultTxNoAccount();
      case -9:
        return new InnerTransactionResultResultTxInsufficientFee();
      case -10:
        return new InnerTransactionResultResultTxBadAuthExtra();
      case -11:
        return new InnerTransactionResultResultTxInternalError();
      case -12:
        return new InnerTransactionResultResultTxNotSupported();
      case -14:
        return new InnerTransactionResultResultTxBadSponsorship();
      case -15:
        return new InnerTransactionResultResultTxBadMinSeqAgeOrGap();
      case -16:
        return new InnerTransactionResultResultTxMalformed();
      case -17:
        return new InnerTransactionResultResultTxSorobanInvalid();
      case -18:
        return new InnerTransactionResultResultTxFrozenKeyAccessed();
    }
  }

  abstract toXdrObject(): InnerTransactionResultResultWire;
}

export class InnerTransactionResultResultTxSuccess extends InnerTransactionResultResultBase {
  readonly type = "txSuccess" as const;
  readonly results: OperationResult[];

  constructor(results: OperationResult[]) {
    super();
    this.results = results;
  }

  get value(): OperationResult[] {
    return this.results;
  }

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: 0 }> {
    return { code: 0, results: this.results.map((v) => v.toXdrObject()) };
  }
}

export class InnerTransactionResultResultTxFailed extends InnerTransactionResultResultBase {
  readonly type = "txFailed" as const;
  readonly results: OperationResult[];

  constructor(results: OperationResult[]) {
    super();
    this.results = results;
  }

  get value(): OperationResult[] {
    return this.results;
  }

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -1 }> {
    return { code: -1, results: this.results.map((v) => v.toXdrObject()) };
  }
}

export class InnerTransactionResultResultTxTooEarly extends InnerTransactionResultResultBase {
  readonly type = "txTooEarly" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class InnerTransactionResultResultTxTooLate extends InnerTransactionResultResultBase {
  readonly type = "txTooLate" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class InnerTransactionResultResultTxMissingOperation extends InnerTransactionResultResultBase {
  readonly type = "txMissingOperation" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class InnerTransactionResultResultTxBadSeq extends InnerTransactionResultResultBase {
  readonly type = "txBadSeq" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class InnerTransactionResultResultTxBadAuth extends InnerTransactionResultResultBase {
  readonly type = "txBadAuth" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class InnerTransactionResultResultTxInsufficientBalance extends InnerTransactionResultResultBase {
  readonly type = "txInsufficientBalance" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class InnerTransactionResultResultTxNoAccount extends InnerTransactionResultResultBase {
  readonly type = "txNoAccount" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export class InnerTransactionResultResultTxInsufficientFee extends InnerTransactionResultResultBase {
  readonly type = "txInsufficientFee" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -9 }> {
    return { code: -9 };
  }
}

export class InnerTransactionResultResultTxBadAuthExtra extends InnerTransactionResultResultBase {
  readonly type = "txBadAuthExtra" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -10 }> {
    return { code: -10 };
  }
}

export class InnerTransactionResultResultTxInternalError extends InnerTransactionResultResultBase {
  readonly type = "txInternalError" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -11 }> {
    return { code: -11 };
  }
}

export class InnerTransactionResultResultTxNotSupported extends InnerTransactionResultResultBase {
  readonly type = "txNotSupported" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -12 }> {
    return { code: -12 };
  }
}

export class InnerTransactionResultResultTxBadSponsorship extends InnerTransactionResultResultBase {
  readonly type = "txBadSponsorship" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -14 }> {
    return { code: -14 };
  }
}

export class InnerTransactionResultResultTxBadMinSeqAgeOrGap extends InnerTransactionResultResultBase {
  readonly type = "txBadMinSeqAgeOrGap" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -15 }> {
    return { code: -15 };
  }
}

export class InnerTransactionResultResultTxMalformed extends InnerTransactionResultResultBase {
  readonly type = "txMalformed" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -16 }> {
    return { code: -16 };
  }
}

export class InnerTransactionResultResultTxSorobanInvalid extends InnerTransactionResultResultBase {
  readonly type = "txSorobanInvalid" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -17 }> {
    return { code: -17 };
  }
}

export class InnerTransactionResultResultTxFrozenKeyAccessed extends InnerTransactionResultResultBase {
  readonly type = "txFrozenKeyAccessed" as const;

  toXdrObject(): Extract<InnerTransactionResultResultWire, { code: -18 }> {
    return { code: -18 };
  }
}

export type InnerTransactionResultResult =
  | InnerTransactionResultResultTxSuccess
  | InnerTransactionResultResultTxFailed
  | InnerTransactionResultResultTxTooEarly
  | InnerTransactionResultResultTxTooLate
  | InnerTransactionResultResultTxMissingOperation
  | InnerTransactionResultResultTxBadSeq
  | InnerTransactionResultResultTxBadAuth
  | InnerTransactionResultResultTxInsufficientBalance
  | InnerTransactionResultResultTxNoAccount
  | InnerTransactionResultResultTxInsufficientFee
  | InnerTransactionResultResultTxBadAuthExtra
  | InnerTransactionResultResultTxInternalError
  | InnerTransactionResultResultTxNotSupported
  | InnerTransactionResultResultTxBadSponsorship
  | InnerTransactionResultResultTxBadMinSeqAgeOrGap
  | InnerTransactionResultResultTxMalformed
  | InnerTransactionResultResultTxSorobanInvalid
  | InnerTransactionResultResultTxFrozenKeyAccessed;
export const InnerTransactionResultResult = InnerTransactionResultResultBase;
