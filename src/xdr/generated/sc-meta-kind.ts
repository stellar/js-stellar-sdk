import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ScMetaKindWire = number;

export type ScMetaKindName = "scMetaV0";

/**
 * ```xdr
 * enum SCMetaKind
 * {
 *     SC_META_V0 = 0
 * };
 * ```
 */
export class ScMetaKind extends EnumValue<ScMetaKindName> {
  static readonly scMetaV0 = new ScMetaKind("scMetaV0", 0);

  static readonly schema = enumType("ScMetaKind", {
    scMetaV0: 0,
  });

  static fromValue(value: number): ScMetaKind {
    return enumFromValue("ScMetaKind", ScMetaKind.schema, ScMetaKind, value);
  }

  static fromName(name: ScMetaKindName): ScMetaKind {
    return enumFromName("ScMetaKind", ScMetaKind, name);
  }

  static fromXdrObject(wire: number): ScMetaKind {
    return ScMetaKind.fromValue(wire);
  }
}
