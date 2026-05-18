import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, ScSpecUdtUnionCaseV0Kind>
  > = {
    0: ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0,
    1: ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0,
  };

  static readonly schema = enumType("ScSpecUdtUnionCaseV0Kind", {
    scSpecUdtUnionCaseVoidV0: 0,
    scSpecUdtUnionCaseTupleV0: 1,
  });

  static fromValue(value: number): ScSpecUdtUnionCaseV0Kind {
    return enumLookup(
      "ScSpecUdtUnionCaseV0Kind",
      ScSpecUdtUnionCaseV0Kind.byValue,
      value,
    ) as ScSpecUdtUnionCaseV0Kind;
  }

  static fromName(
    name: ScSpecUdtUnionCaseV0KindName,
  ): ScSpecUdtUnionCaseV0Kind {
    switch (name) {
      case "scSpecUdtUnionCaseVoidV0":
        return ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0;
      case "scSpecUdtUnionCaseTupleV0":
        return ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0;
      default:
        throw new XdrError(`ScSpecUdtUnionCaseV0Kind: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScSpecUdtUnionCaseV0Kind {
    return ScSpecUdtUnionCaseV0Kind.fromValue(wire);
  }
}
