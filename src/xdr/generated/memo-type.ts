import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type MemoTypeWire = number;

export type MemoTypeName =
  | "memoNone"
  | "memoText"
  | "memoId"
  | "memoHash"
  | "memoReturn";

/**
 * ```xdr
 * enum MemoType
 * {
 *     MEMO_NONE = 0,
 *     MEMO_TEXT = 1,
 *     MEMO_ID = 2,
 *     MEMO_HASH = 3,
 *     MEMO_RETURN = 4
 * };
 * ```
 */
export class MemoType extends EnumValue<MemoTypeName> {
  static readonly memoNone = new MemoType("memoNone", 0);
  static readonly memoText = new MemoType("memoText", 1);
  static readonly memoId = new MemoType("memoId", 2);
  static readonly memoHash = new MemoType("memoHash", 3);
  static readonly memoReturn = new MemoType("memoReturn", 4);

  private static readonly byValue: Readonly<Record<number, MemoType>> = {
    0: MemoType.memoNone,
    1: MemoType.memoText,
    2: MemoType.memoId,
    3: MemoType.memoHash,
    4: MemoType.memoReturn,
  };

  static readonly schema = enumType("MemoType", {
    memoNone: 0,
    memoText: 1,
    memoId: 2,
    memoHash: 3,
    memoReturn: 4,
  });

  static fromValue(value: number): MemoType {
    return enumLookup("MemoType", MemoType.byValue, value) as MemoType;
  }

  static fromName(name: MemoTypeName): MemoType {
    switch (name) {
      case "memoNone":
        return MemoType.memoNone;
      case "memoText":
        return MemoType.memoText;
      case "memoId":
        return MemoType.memoId;
      case "memoHash":
        return MemoType.memoHash;
      case "memoReturn":
        return MemoType.memoReturn;
      default:
        throw new XdrError(`MemoType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): MemoType {
    return MemoType.fromValue(wire);
  }
}
