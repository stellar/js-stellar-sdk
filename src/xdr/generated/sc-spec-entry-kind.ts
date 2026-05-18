import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ScSpecEntryKindWire = number;

export type ScSpecEntryKindName =
  | "scSpecEntryFunctionV0"
  | "scSpecEntryUdtStructV0"
  | "scSpecEntryUdtUnionV0"
  | "scSpecEntryUdtEnumV0"
  | "scSpecEntryUdtErrorEnumV0"
  | "scSpecEntryEventV0";

/**
 * ```xdr
 * enum SCSpecEntryKind
 * {
 *     SC_SPEC_ENTRY_FUNCTION_V0 = 0,
 *     SC_SPEC_ENTRY_UDT_STRUCT_V0 = 1,
 *     SC_SPEC_ENTRY_UDT_UNION_V0 = 2,
 *     SC_SPEC_ENTRY_UDT_ENUM_V0 = 3,
 *     SC_SPEC_ENTRY_UDT_ERROR_ENUM_V0 = 4,
 *     SC_SPEC_ENTRY_EVENT_V0 = 5
 * };
 * ```
 */
export class ScSpecEntryKind extends EnumValue<ScSpecEntryKindName> {
  static readonly scSpecEntryFunctionV0 = new ScSpecEntryKind(
    "scSpecEntryFunctionV0",
    0,
  );
  static readonly scSpecEntryUdtStructV0 = new ScSpecEntryKind(
    "scSpecEntryUdtStructV0",
    1,
  );
  static readonly scSpecEntryUdtUnionV0 = new ScSpecEntryKind(
    "scSpecEntryUdtUnionV0",
    2,
  );
  static readonly scSpecEntryUdtEnumV0 = new ScSpecEntryKind(
    "scSpecEntryUdtEnumV0",
    3,
  );
  static readonly scSpecEntryUdtErrorEnumV0 = new ScSpecEntryKind(
    "scSpecEntryUdtErrorEnumV0",
    4,
  );
  static readonly scSpecEntryEventV0 = new ScSpecEntryKind(
    "scSpecEntryEventV0",
    5,
  );

  private static readonly byValue: Readonly<Record<number, ScSpecEntryKind>> = {
    0: ScSpecEntryKind.scSpecEntryFunctionV0,
    1: ScSpecEntryKind.scSpecEntryUdtStructV0,
    2: ScSpecEntryKind.scSpecEntryUdtUnionV0,
    3: ScSpecEntryKind.scSpecEntryUdtEnumV0,
    4: ScSpecEntryKind.scSpecEntryUdtErrorEnumV0,
    5: ScSpecEntryKind.scSpecEntryEventV0,
  };

  static readonly schema = enumType("ScSpecEntryKind", {
    scSpecEntryFunctionV0: 0,
    scSpecEntryUdtStructV0: 1,
    scSpecEntryUdtUnionV0: 2,
    scSpecEntryUdtEnumV0: 3,
    scSpecEntryUdtErrorEnumV0: 4,
    scSpecEntryEventV0: 5,
  });

  static fromValue(value: number): ScSpecEntryKind {
    return enumLookup(
      "ScSpecEntryKind",
      ScSpecEntryKind.byValue,
      value,
    ) as ScSpecEntryKind;
  }

  static fromName(name: ScSpecEntryKindName): ScSpecEntryKind {
    switch (name) {
      case "scSpecEntryFunctionV0":
        return ScSpecEntryKind.scSpecEntryFunctionV0;
      case "scSpecEntryUdtStructV0":
        return ScSpecEntryKind.scSpecEntryUdtStructV0;
      case "scSpecEntryUdtUnionV0":
        return ScSpecEntryKind.scSpecEntryUdtUnionV0;
      case "scSpecEntryUdtEnumV0":
        return ScSpecEntryKind.scSpecEntryUdtEnumV0;
      case "scSpecEntryUdtErrorEnumV0":
        return ScSpecEntryKind.scSpecEntryUdtErrorEnumV0;
      case "scSpecEntryEventV0":
        return ScSpecEntryKind.scSpecEntryEventV0;
      default:
        throw new XdrError(`ScSpecEntryKind: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScSpecEntryKind {
    return ScSpecEntryKind.fromValue(wire);
  }
}
