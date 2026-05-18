import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, ScMetaKind>> = {
    0: ScMetaKind.scMetaV0,
  };

  static readonly schema = enumType("ScMetaKind", {
    scMetaV0: 0,
  });

  static fromValue(value: number): ScMetaKind {
    return enumLookup("ScMetaKind", ScMetaKind.byValue, value) as ScMetaKind;
  }

  static fromName(name: ScMetaKindName): ScMetaKind {
    switch (name) {
      case "scMetaV0":
        return ScMetaKind.scMetaV0;
      default:
        throw new XdrError(`ScMetaKind: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScMetaKind {
    return ScMetaKind.fromValue(wire);
  }
}
