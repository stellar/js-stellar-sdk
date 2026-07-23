import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("MemoType", {
      memoNone: 0,
      memoText: 1,
      memoId: 2,
      memoHash: 3,
      memoReturn: 4,
    }),
    "memo",
  );

  static fromValue(value: number): MemoType {
    return enumFromValue("MemoType", MemoType.schema, MemoType, value);
  }

  static fromName(name: MemoTypeName): MemoType {
    return enumFromName("MemoType", MemoType, name);
  }

  static fromXdrObject(wire: number): MemoType {
    return MemoType.fromValue(wire);
  }
}
