import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type BumpSequenceResultCodeWire = number;

export type BumpSequenceResultCodeName =
  | "bumpSequenceSuccess"
  | "bumpSequenceBadSeq";

/**
 * ```xdr
 * enum BumpSequenceResultCode
 * {
 *     // codes considered as "success" for the operation
 *     BUMP_SEQUENCE_SUCCESS = 0,
 *     // codes considered as "failure" for the operation
 *     BUMP_SEQUENCE_BAD_SEQ = -1 // `bumpTo` is not within bounds
 * };
 * ```
 */
export class BumpSequenceResultCode extends EnumValue<BumpSequenceResultCodeName> {
  static readonly bumpSequenceSuccess = new BumpSequenceResultCode(
    "bumpSequenceSuccess",
    0,
  );
  static readonly bumpSequenceBadSeq = new BumpSequenceResultCode(
    "bumpSequenceBadSeq",
    -1,
  );

  static readonly schema = enumType("BumpSequenceResultCode", {
    bumpSequenceSuccess: 0,
    bumpSequenceBadSeq: -1,
  });

  static fromValue(value: number): BumpSequenceResultCode {
    return enumFromValue(
      "BumpSequenceResultCode",
      BumpSequenceResultCode.schema,
      BumpSequenceResultCode,
      value,
    );
  }

  static fromName(name: BumpSequenceResultCodeName): BumpSequenceResultCode {
    return enumFromName("BumpSequenceResultCode", BumpSequenceResultCode, name);
  }

  static fromXdrObject(wire: number): BumpSequenceResultCode {
    return BumpSequenceResultCode.fromValue(wire);
  }
}
