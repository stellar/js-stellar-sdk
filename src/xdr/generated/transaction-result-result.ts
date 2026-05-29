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
  InnerTransactionResultPair,
  type InnerTransactionResultPairWire,
} from "./inner-transaction-result-pair.js";
import {
  OperationResult,
  type OperationResultWire,
} from "./operation-result.js";

export type TransactionResultResultWire =
  | { code: 1; innerResultPair: InnerTransactionResultPairWire }
  | { code: -13; innerResultPair: InnerTransactionResultPairWire }
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

export type TransactionResultResultVariantName =
  | "txFeeBumpInnerSuccess"
  | "txFeeBumpInnerFailed"
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
 *     case txFEE_BUMP_INNER_SUCCESS:
 *     case txFEE_BUMP_INNER_FAILED:
 *         InnerTransactionResultPair innerResultPair;
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
 *     // case txFEE_BUMP_INNER_FAILED: handled above
 *     case txBAD_SPONSORSHIP:
 *     case txBAD_MIN_SEQ_AGE_OR_GAP:
 *     case txMALFORMED:
 *     case txSOROBAN_INVALID:
 *     case txFROZEN_KEY_ACCESSED:
 *         void;
 *     }
 * ```
 */
abstract class TransactionResultResultBase extends XdrValue {
  abstract readonly type: TransactionResultResultVariantName;

  static readonly schema: XdrType<TransactionResultResultWire> = union(
    "TransactionResultResult",
    {
      switchOn: TransactionResultCode.schema,
      cases: [
        case_(
          "txFeeBumpInnerSuccess",
          1,
          field("innerResultPair", InnerTransactionResultPair.schema),
        ),
        case_(
          "txFeeBumpInnerFailed",
          -13,
          field("innerResultPair", InnerTransactionResultPair.schema),
        ),
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

  static txFeeBumpInnerSuccess(
    innerResultPair: InnerTransactionResultPair,
  ): TransactionResultResultTxFeeBumpInnerSuccess {
    return new TransactionResultResultTxFeeBumpInnerSuccess(innerResultPair);
  }

  static txFeeBumpInnerFailed(
    innerResultPair: InnerTransactionResultPair,
  ): TransactionResultResultTxFeeBumpInnerFailed {
    return new TransactionResultResultTxFeeBumpInnerFailed(innerResultPair);
  }

  static txSuccess(
    results: OperationResult[],
  ): TransactionResultResultTxSuccess {
    return new TransactionResultResultTxSuccess(results);
  }

  static txFailed(results: OperationResult[]): TransactionResultResultTxFailed {
    return new TransactionResultResultTxFailed(results);
  }

  static txTooEarly(): TransactionResultResultTxTooEarly {
    return new TransactionResultResultTxTooEarly();
  }

  static txTooLate(): TransactionResultResultTxTooLate {
    return new TransactionResultResultTxTooLate();
  }

  static txMissingOperation(): TransactionResultResultTxMissingOperation {
    return new TransactionResultResultTxMissingOperation();
  }

  static txBadSeq(): TransactionResultResultTxBadSeq {
    return new TransactionResultResultTxBadSeq();
  }

  static txBadAuth(): TransactionResultResultTxBadAuth {
    return new TransactionResultResultTxBadAuth();
  }

  static txInsufficientBalance(): TransactionResultResultTxInsufficientBalance {
    return new TransactionResultResultTxInsufficientBalance();
  }

  static txNoAccount(): TransactionResultResultTxNoAccount {
    return new TransactionResultResultTxNoAccount();
  }

  static txInsufficientFee(): TransactionResultResultTxInsufficientFee {
    return new TransactionResultResultTxInsufficientFee();
  }

  static txBadAuthExtra(): TransactionResultResultTxBadAuthExtra {
    return new TransactionResultResultTxBadAuthExtra();
  }

  static txInternalError(): TransactionResultResultTxInternalError {
    return new TransactionResultResultTxInternalError();
  }

  static txNotSupported(): TransactionResultResultTxNotSupported {
    return new TransactionResultResultTxNotSupported();
  }

  static txBadSponsorship(): TransactionResultResultTxBadSponsorship {
    return new TransactionResultResultTxBadSponsorship();
  }

  static txBadMinSeqAgeOrGap(): TransactionResultResultTxBadMinSeqAgeOrGap {
    return new TransactionResultResultTxBadMinSeqAgeOrGap();
  }

  static txMalformed(): TransactionResultResultTxMalformed {
    return new TransactionResultResultTxMalformed();
  }

  static txSorobanInvalid(): TransactionResultResultTxSorobanInvalid {
    return new TransactionResultResultTxSorobanInvalid();
  }

  static txFrozenKeyAccessed(): TransactionResultResultTxFrozenKeyAccessed {
    return new TransactionResultResultTxFrozenKeyAccessed();
  }

  static fromXdrObject(
    wire: TransactionResultResultWire,
  ): TransactionResultResult {
    switch (wire.code) {
      case 1:
        return new TransactionResultResultTxFeeBumpInnerSuccess(
          InnerTransactionResultPair.fromXdrObject(wire.innerResultPair),
        );
      case -13:
        return new TransactionResultResultTxFeeBumpInnerFailed(
          InnerTransactionResultPair.fromXdrObject(wire.innerResultPair),
        );
      case 0:
        return new TransactionResultResultTxSuccess(
          wire.results.map((w) => OperationResult.fromXdrObject(w)),
        );
      case -1:
        return new TransactionResultResultTxFailed(
          wire.results.map((w) => OperationResult.fromXdrObject(w)),
        );
      case -2:
        return new TransactionResultResultTxTooEarly();
      case -3:
        return new TransactionResultResultTxTooLate();
      case -4:
        return new TransactionResultResultTxMissingOperation();
      case -5:
        return new TransactionResultResultTxBadSeq();
      case -6:
        return new TransactionResultResultTxBadAuth();
      case -7:
        return new TransactionResultResultTxInsufficientBalance();
      case -8:
        return new TransactionResultResultTxNoAccount();
      case -9:
        return new TransactionResultResultTxInsufficientFee();
      case -10:
        return new TransactionResultResultTxBadAuthExtra();
      case -11:
        return new TransactionResultResultTxInternalError();
      case -12:
        return new TransactionResultResultTxNotSupported();
      case -14:
        return new TransactionResultResultTxBadSponsorship();
      case -15:
        return new TransactionResultResultTxBadMinSeqAgeOrGap();
      case -16:
        return new TransactionResultResultTxMalformed();
      case -17:
        return new TransactionResultResultTxSorobanInvalid();
      case -18:
        return new TransactionResultResultTxFrozenKeyAccessed();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TransactionResultResult variant.
   * Use this instead of `instanceof TransactionResultResult`: the exported `TransactionResultResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TransactionResultResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TransactionResultResult {
    return value instanceof TransactionResultResultBase;
  }

  abstract toXdrObject(): TransactionResultResultWire;
}

export class TransactionResultResultTxFeeBumpInnerSuccess extends TransactionResultResultBase {
  readonly type = "txFeeBumpInnerSuccess" as const;
  readonly innerResultPair: InnerTransactionResultPair;

  constructor(innerResultPair: InnerTransactionResultPair) {
    super();
    this.innerResultPair = innerResultPair;
  }

  get value(): InnerTransactionResultPair {
    return this.innerResultPair;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: 1 }> {
    return { code: 1, innerResultPair: this.innerResultPair.toXdrObject() };
  }
}

export class TransactionResultResultTxFeeBumpInnerFailed extends TransactionResultResultBase {
  readonly type = "txFeeBumpInnerFailed" as const;
  readonly innerResultPair: InnerTransactionResultPair;

  constructor(innerResultPair: InnerTransactionResultPair) {
    super();
    this.innerResultPair = innerResultPair;
  }

  get value(): InnerTransactionResultPair {
    return this.innerResultPair;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -13 }> {
    return { code: -13, innerResultPair: this.innerResultPair.toXdrObject() };
  }
}

export class TransactionResultResultTxSuccess extends TransactionResultResultBase {
  readonly type = "txSuccess" as const;
  readonly results: OperationResult[];

  constructor(results: OperationResult[]) {
    super();
    this.results = results;
  }

  get value(): OperationResult[] {
    return this.results;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: 0 }> {
    return { code: 0, results: this.results.map((v) => v.toXdrObject()) };
  }
}

export class TransactionResultResultTxFailed extends TransactionResultResultBase {
  readonly type = "txFailed" as const;
  readonly results: OperationResult[];

  constructor(results: OperationResult[]) {
    super();
    this.results = results;
  }

  get value(): OperationResult[] {
    return this.results;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -1 }> {
    return { code: -1, results: this.results.map((v) => v.toXdrObject()) };
  }
}

export class TransactionResultResultTxTooEarly extends TransactionResultResultBase {
  readonly type = "txTooEarly" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class TransactionResultResultTxTooLate extends TransactionResultResultBase {
  readonly type = "txTooLate" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class TransactionResultResultTxMissingOperation extends TransactionResultResultBase {
  readonly type = "txMissingOperation" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class TransactionResultResultTxBadSeq extends TransactionResultResultBase {
  readonly type = "txBadSeq" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class TransactionResultResultTxBadAuth extends TransactionResultResultBase {
  readonly type = "txBadAuth" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class TransactionResultResultTxInsufficientBalance extends TransactionResultResultBase {
  readonly type = "txInsufficientBalance" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class TransactionResultResultTxNoAccount extends TransactionResultResultBase {
  readonly type = "txNoAccount" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export class TransactionResultResultTxInsufficientFee extends TransactionResultResultBase {
  readonly type = "txInsufficientFee" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -9 }> {
    return { code: -9 };
  }
}

export class TransactionResultResultTxBadAuthExtra extends TransactionResultResultBase {
  readonly type = "txBadAuthExtra" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -10 }> {
    return { code: -10 };
  }
}

export class TransactionResultResultTxInternalError extends TransactionResultResultBase {
  readonly type = "txInternalError" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -11 }> {
    return { code: -11 };
  }
}

export class TransactionResultResultTxNotSupported extends TransactionResultResultBase {
  readonly type = "txNotSupported" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -12 }> {
    return { code: -12 };
  }
}

export class TransactionResultResultTxBadSponsorship extends TransactionResultResultBase {
  readonly type = "txBadSponsorship" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -14 }> {
    return { code: -14 };
  }
}

export class TransactionResultResultTxBadMinSeqAgeOrGap extends TransactionResultResultBase {
  readonly type = "txBadMinSeqAgeOrGap" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -15 }> {
    return { code: -15 };
  }
}

export class TransactionResultResultTxMalformed extends TransactionResultResultBase {
  readonly type = "txMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -16 }> {
    return { code: -16 };
  }
}

export class TransactionResultResultTxSorobanInvalid extends TransactionResultResultBase {
  readonly type = "txSorobanInvalid" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -17 }> {
    return { code: -17 };
  }
}

export class TransactionResultResultTxFrozenKeyAccessed extends TransactionResultResultBase {
  readonly type = "txFrozenKeyAccessed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<TransactionResultResultWire, { code: -18 }> {
    return { code: -18 };
  }
}

export type TransactionResultResult =
  | TransactionResultResultTxFeeBumpInnerSuccess
  | TransactionResultResultTxFeeBumpInnerFailed
  | TransactionResultResultTxSuccess
  | TransactionResultResultTxFailed
  | TransactionResultResultTxTooEarly
  | TransactionResultResultTxTooLate
  | TransactionResultResultTxMissingOperation
  | TransactionResultResultTxBadSeq
  | TransactionResultResultTxBadAuth
  | TransactionResultResultTxInsufficientBalance
  | TransactionResultResultTxNoAccount
  | TransactionResultResultTxInsufficientFee
  | TransactionResultResultTxBadAuthExtra
  | TransactionResultResultTxInternalError
  | TransactionResultResultTxNotSupported
  | TransactionResultResultTxBadSponsorship
  | TransactionResultResultTxBadMinSeqAgeOrGap
  | TransactionResultResultTxMalformed
  | TransactionResultResultTxSorobanInvalid
  | TransactionResultResultTxFrozenKeyAccessed;
export const TransactionResultResult = TransactionResultResultBase;
