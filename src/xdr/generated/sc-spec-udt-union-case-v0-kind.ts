import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type ScSpecUdtUnionCaseV0KindWire = number;

export type ScSpecUdtUnionCaseV0KindName =
  | "scSpecUdtUnionCaseVoidV0"
  | "scSpecUdtUnionCaseTupleV0";

/**
 * ```xdr
 * enum SCSpecUDTUnionCaseV0Kind
 * {
 *     SC_SPEC_UDT_UNION_CASE_VOID_V0 = 0,
 *     SC_SPEC_UDT_UNION_CASE_TUPLE_V0 = 1
 * };
 * ```
 */
export class ScSpecUdtUnionCaseV0Kind extends EnumValue<ScSpecUdtUnionCaseV0KindName> {
  static readonly scSpecUdtUnionCaseVoidV0 = new ScSpecUdtUnionCaseV0Kind(
    "scSpecUdtUnionCaseVoidV0",
    0,
  );
  static readonly scSpecUdtUnionCaseTupleV0 = new ScSpecUdtUnionCaseV0Kind(
    "scSpecUdtUnionCaseTupleV0",
    1,
  );

  static readonly schema = withMemberPrefix(
    enumType("ScSpecUdtUnionCaseV0Kind", {
      scSpecUdtUnionCaseVoidV0: 0,
      scSpecUdtUnionCaseTupleV0: 1,
    }),
    "scSpecUdtUnionCase",
  );

  static fromValue(value: number): ScSpecUdtUnionCaseV0Kind {
    return enumFromValue(
      "ScSpecUdtUnionCaseV0Kind",
      ScSpecUdtUnionCaseV0Kind.schema,
      ScSpecUdtUnionCaseV0Kind,
      value,
    );
  }

  static fromName(
    name: ScSpecUdtUnionCaseV0KindName,
  ): ScSpecUdtUnionCaseV0Kind {
    return enumFromName(
      "ScSpecUdtUnionCaseV0Kind",
      ScSpecUdtUnionCaseV0Kind,
      name,
    );
  }

  static fromXdrObject(wire: number): ScSpecUdtUnionCaseV0Kind {
    return ScSpecUdtUnionCaseV0Kind.fromValue(wire);
  }
}
