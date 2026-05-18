import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, BumpSequenceResultCode>
  > = {
    0: BumpSequenceResultCode.bumpSequenceSuccess,
    "-1": BumpSequenceResultCode.bumpSequenceBadSeq,
  };

  static readonly schema = enumType("BumpSequenceResultCode", {
    bumpSequenceSuccess: 0,
    bumpSequenceBadSeq: -1,
  });

  static fromValue(value: number): BumpSequenceResultCode {
    return enumLookup(
      "BumpSequenceResultCode",
      BumpSequenceResultCode.byValue,
      value,
    ) as BumpSequenceResultCode;
  }

  static fromName(name: BumpSequenceResultCodeName): BumpSequenceResultCode {
    switch (name) {
      case "bumpSequenceSuccess":
        return BumpSequenceResultCode.bumpSequenceSuccess;
      case "bumpSequenceBadSeq":
        return BumpSequenceResultCode.bumpSequenceBadSeq;
      default:
        throw new XdrError(`BumpSequenceResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): BumpSequenceResultCode {
    return BumpSequenceResultCode.fromValue(wire);
  }
}
