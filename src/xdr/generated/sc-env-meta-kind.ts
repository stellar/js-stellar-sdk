import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ScEnvMetaKindWire = number;

export type ScEnvMetaKindName = "scEnvMetaKindInterfaceVersion";

/**
 * ```xdr
 * enum SCEnvMetaKind
 * {
 *     SC_ENV_META_KIND_INTERFACE_VERSION = 0
 * };
 * ```
 */
export class ScEnvMetaKind extends EnumValue<ScEnvMetaKindName> {
  static readonly scEnvMetaKindInterfaceVersion = new ScEnvMetaKind(
    "scEnvMetaKindInterfaceVersion",
    0,
  );

  private static readonly byValue: Readonly<Record<number, ScEnvMetaKind>> = {
    0: ScEnvMetaKind.scEnvMetaKindInterfaceVersion,
  };

  static readonly schema = enumType("ScEnvMetaKind", {
    scEnvMetaKindInterfaceVersion: 0,
  });

  static fromValue(value: number): ScEnvMetaKind {
    return enumLookup(
      "ScEnvMetaKind",
      ScEnvMetaKind.byValue,
      value,
    ) as ScEnvMetaKind;
  }

  static fromName(name: ScEnvMetaKindName): ScEnvMetaKind {
    switch (name) {
      case "scEnvMetaKindInterfaceVersion":
        return ScEnvMetaKind.scEnvMetaKindInterfaceVersion;
      default:
        throw new XdrError(`ScEnvMetaKind: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScEnvMetaKind {
    return ScEnvMetaKind.fromValue(wire);
  }
}
