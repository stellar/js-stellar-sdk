/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScMetaKind } from "./sc-meta-kind.js";
import { ScMetaV0, type ScMetaV0Wire } from "./sc-meta-v0.js";

export type ScMetaEntryWire = { kind: 0; v0: ScMetaV0Wire };

export type ScMetaEntryVariantName = "scMetaV0";

/**
 * ```xdr
 * union SCMetaEntry switch (SCMetaKind kind)
 * {
 * case SC_META_V0:
 *     SCMetaV0 v0;
 * };
 * ```
 */
abstract class ScMetaEntryBase extends XdrValue {
  abstract readonly type: ScMetaEntryVariantName;

  static readonly schema: XdrType<ScMetaEntryWire> = union("ScMetaEntry", {
    switchOn: ScMetaKind.schema,
    cases: [case_("scMetaV0", 0, field("v0", ScMetaV0.schema))],
    switchKey: "kind",
  });

  static scMetaV0(v0: ScMetaV0): ScMetaEntryScMetaV0 {
    return new ScMetaEntryScMetaV0(v0);
  }

  static fromXdrObject(wire: ScMetaEntryWire): ScMetaEntry {
    switch (wire.kind) {
      case 0:
        return new ScMetaEntryScMetaV0(ScMetaV0.fromXdrObject(wire.v0));
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ScMetaEntry variant.
   * Use this instead of `instanceof ScMetaEntry`: the exported `ScMetaEntry` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ScMetaEntry.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ScMetaEntry {
    return value instanceof ScMetaEntryBase;
  }

  abstract toXdrObject(): ScMetaEntryWire;
}

export class ScMetaEntryScMetaV0 extends ScMetaEntryBase {
  readonly type = "scMetaV0" as const;
  readonly v0: ScMetaV0;

  constructor(v0: ScMetaV0) {
    super();
    this.v0 = v0;
  }

  get value(): ScMetaV0 {
    return this.v0;
  }

  toXdrObject(): Extract<ScMetaEntryWire, { kind: 0 }> {
    return { kind: 0, v0: this.v0.toXdrObject() };
  }
}

export type ScMetaEntry = ScMetaEntryScMetaV0;
export const ScMetaEntry = ScMetaEntryBase;
