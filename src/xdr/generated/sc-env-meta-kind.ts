import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("ScEnvMetaKind", {
    scEnvMetaKindInterfaceVersion: 0,
  });

  static fromValue(value: number): ScEnvMetaKind {
    return enumFromValue(
      "ScEnvMetaKind",
      ScEnvMetaKind.schema,
      ScEnvMetaKind,
      value,
    );
  }

  static fromName(name: ScEnvMetaKindName): ScEnvMetaKind {
    return enumFromName("ScEnvMetaKind", ScEnvMetaKind, name);
  }

  static fromXdrObject(wire: number): ScEnvMetaKind {
    return ScEnvMetaKind.fromValue(wire);
  }
}
