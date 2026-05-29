import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("ScSpecEntryKind", {
    scSpecEntryFunctionV0: 0,
    scSpecEntryUdtStructV0: 1,
    scSpecEntryUdtUnionV0: 2,
    scSpecEntryUdtEnumV0: 3,
    scSpecEntryUdtErrorEnumV0: 4,
    scSpecEntryEventV0: 5,
  });

  static fromValue(value: number): ScSpecEntryKind {
    return enumFromValue(
      "ScSpecEntryKind",
      ScSpecEntryKind.schema,
      ScSpecEntryKind,
      value,
    );
  }

  static fromName(name: ScSpecEntryKindName): ScSpecEntryKind {
    return enumFromName("ScSpecEntryKind", ScSpecEntryKind, name);
  }

  static fromXdrObject(wire: number): ScSpecEntryKind {
    return ScSpecEntryKind.fromValue(wire);
  }
}
