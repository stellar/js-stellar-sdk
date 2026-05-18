/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScEnvMetaKind } from "./sc-env-meta-kind.js";
import {
  ScEnvMetaEntryInterfaceVersion,
  type ScEnvMetaEntryInterfaceVersionWire,
} from "./sc-env-meta-entry-interface-version.js";

export type ScEnvMetaEntryWire = {
  kind: 0;
  interfaceVersion: ScEnvMetaEntryInterfaceVersionWire;
};

export type ScEnvMetaEntryVariantName = "scEnvMetaKindInterfaceVersion";

/**
 * ```xdr
 * union SCEnvMetaEntry switch (SCEnvMetaKind kind)
 * {
 * case SC_ENV_META_KIND_INTERFACE_VERSION:
 *     struct {
 *         uint32 protocol;
 *         uint32 preRelease;
 *     } interfaceVersion;
 * };
 * ```
 */
abstract class ScEnvMetaEntryBase extends XdrValue {
  abstract readonly type: ScEnvMetaEntryVariantName;

  static readonly schema: XdrType<ScEnvMetaEntryWire> = union(
    "ScEnvMetaEntry",
    {
      switchOn: ScEnvMetaKind.schema,
      cases: [
        case_(
          "scEnvMetaKindInterfaceVersion",
          0,
          field("interfaceVersion", ScEnvMetaEntryInterfaceVersion.schema),
        ),
      ],
      switchKey: "kind",
    },
  );

  static scEnvMetaKindInterfaceVersion(
    interfaceVersion: ScEnvMetaEntryInterfaceVersion,
  ): ScEnvMetaEntryInterfaceVersionArm {
    return new ScEnvMetaEntryInterfaceVersionArm(interfaceVersion);
  }

  static fromXdrObject(wire: ScEnvMetaEntryWire): ScEnvMetaEntry {
    switch (wire.kind) {
      case 0:
        return new ScEnvMetaEntryInterfaceVersionArm(
          ScEnvMetaEntryInterfaceVersion.fromXdrObject(wire.interfaceVersion),
        );
    }
  }

  abstract toXdrObject(): ScEnvMetaEntryWire;
}

export class ScEnvMetaEntryInterfaceVersionArm extends ScEnvMetaEntryBase {
  readonly type = "scEnvMetaKindInterfaceVersion" as const;
  readonly interfaceVersion: ScEnvMetaEntryInterfaceVersion;

  constructor(interfaceVersion: ScEnvMetaEntryInterfaceVersion) {
    super();
    this.interfaceVersion = interfaceVersion;
  }

  get value(): ScEnvMetaEntryInterfaceVersion {
    return this.interfaceVersion;
  }

  toXdrObject(): Extract<ScEnvMetaEntryWire, { kind: 0 }> {
    return { kind: 0, interfaceVersion: this.interfaceVersion.toXdrObject() };
  }
}

export type ScEnvMetaEntry = ScEnvMetaEntryInterfaceVersionArm;
export const ScEnvMetaEntry = ScEnvMetaEntryBase;
