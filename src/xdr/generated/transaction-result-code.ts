import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type TransactionResultCodeWire = number;

export type TransactionResultCodeName =
  | "txFeeBumpInnerSuccess"
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
  | "txFeeBumpInnerFailed"
  | "txBadSponsorship"
  | "txBadMinSeqAgeOrGap"
  | "txMalformed"
  | "txSorobanInvalid"
  | "txFrozenKeyAccessed";

/**
 * ```xdr
 * enum TransactionResultCode
 * {
 *     txFEE_BUMP_INNER_SUCCESS = 1, // fee bump inner transaction succeeded
 *     txSUCCESS = 0,                // all operations succeeded
 *
 *     txFAILED = -1, // one of the operations failed (none were applied)
 *
 *     txTOO_EARLY = -2,         // ledger closeTime before minTime
 *     txTOO_LATE = -3,          // ledger closeTime after maxTime
 *     txMISSING_OPERATION = -4, // no operation was specified
 *     txBAD_SEQ = -5,           // sequence number does not match source account
 *
 *     txBAD_AUTH = -6,             // too few valid signatures / wrong network
 *     txINSUFFICIENT_BALANCE = -7, // fee would bring account below reserve
 *     txNO_ACCOUNT = -8,           // source account not found
 *     txINSUFFICIENT_FEE = -9,     // fee is too small
 *     txBAD_AUTH_EXTRA = -10,      // unused signatures attached to transaction
 *     txINTERNAL_ERROR = -11,      // an unknown error occurred
 *
 *     txNOT_SUPPORTED = -12,          // transaction type not supported
 *     txFEE_BUMP_INNER_FAILED = -13,  // fee bump inner transaction failed
 *     txBAD_SPONSORSHIP = -14,        // sponsorship not confirmed
 *     txBAD_MIN_SEQ_AGE_OR_GAP = -15, // minSeqAge or minSeqLedgerGap conditions not met
 *     txMALFORMED = -16,              // precondition is invalid
 *     txSOROBAN_INVALID = -17,        // soroban-specific preconditions were not met
 *     txFROZEN_KEY_ACCESSED = -18     // a 'frozen' ledger key is accessed by any operation
 * };
 * ```
 */
export class TransactionResultCode extends EnumValue<TransactionResultCodeName> {
  static readonly txFeeBumpInnerSuccess = new TransactionResultCode(
    "txFeeBumpInnerSuccess",
    1,
  );
  static readonly txSuccess = new TransactionResultCode("txSuccess", 0);
  static readonly txFailed = new TransactionResultCode("txFailed", -1);
  static readonly txTooEarly = new TransactionResultCode("txTooEarly", -2);
  static readonly txTooLate = new TransactionResultCode("txTooLate", -3);
  static readonly txMissingOperation = new TransactionResultCode(
    "txMissingOperation",
    -4,
  );
  static readonly txBadSeq = new TransactionResultCode("txBadSeq", -5);
  static readonly txBadAuth = new TransactionResultCode("txBadAuth", -6);
  static readonly txInsufficientBalance = new TransactionResultCode(
    "txInsufficientBalance",
    -7,
  );
  static readonly txNoAccount = new TransactionResultCode("txNoAccount", -8);
  static readonly txInsufficientFee = new TransactionResultCode(
    "txInsufficientFee",
    -9,
  );
  static readonly txBadAuthExtra = new TransactionResultCode(
    "txBadAuthExtra",
    -10,
  );
  static readonly txInternalError = new TransactionResultCode(
    "txInternalError",
    -11,
  );
  static readonly txNotSupported = new TransactionResultCode(
    "txNotSupported",
    -12,
  );
  static readonly txFeeBumpInnerFailed = new TransactionResultCode(
    "txFeeBumpInnerFailed",
    -13,
  );
  static readonly txBadSponsorship = new TransactionResultCode(
    "txBadSponsorship",
    -14,
  );
  static readonly txBadMinSeqAgeOrGap = new TransactionResultCode(
    "txBadMinSeqAgeOrGap",
    -15,
  );
  static readonly txMalformed = new TransactionResultCode("txMalformed", -16);
  static readonly txSorobanInvalid = new TransactionResultCode(
    "txSorobanInvalid",
    -17,
  );
  static readonly txFrozenKeyAccessed = new TransactionResultCode(
    "txFrozenKeyAccessed",
    -18,
  );

  static readonly schema = enumType("TransactionResultCode", {
    txFeeBumpInnerSuccess: 1,
    txSuccess: 0,
    txFailed: -1,
    txTooEarly: -2,
    txTooLate: -3,
    txMissingOperation: -4,
    txBadSeq: -5,
    txBadAuth: -6,
    txInsufficientBalance: -7,
    txNoAccount: -8,
    txInsufficientFee: -9,
    txBadAuthExtra: -10,
    txInternalError: -11,
    txNotSupported: -12,
    txFeeBumpInnerFailed: -13,
    txBadSponsorship: -14,
    txBadMinSeqAgeOrGap: -15,
    txMalformed: -16,
    txSorobanInvalid: -17,
    txFrozenKeyAccessed: -18,
  });

  static fromValue(value: number): TransactionResultCode {
    return enumFromValue(
      "TransactionResultCode",
      TransactionResultCode.schema,
      TransactionResultCode,
      value,
    );
  }

  static fromName(name: TransactionResultCodeName): TransactionResultCode {
    return enumFromName("TransactionResultCode", TransactionResultCode, name);
  }

  static fromXdrObject(wire: number): TransactionResultCode {
    return TransactionResultCode.fromValue(wire);
  }
}
