/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, int32, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  ScpHistoryEntryV0,
  type ScpHistoryEntryV0Wire,
} from "./scp-history-entry-v0.js";

export type ScpHistoryEntryWire = { v: 0; v0: ScpHistoryEntryV0Wire };

export type ScpHistoryEntryVariantName = "v0";

/**
 * ```xdr
 * union SCPHistoryEntry switch (int v)
 * {
 * case 0:
 *     SCPHistoryEntryV0 v0;
 * };
 * ```
 */
abstract class ScpHistoryEntryBase extends XdrValue {
  abstract readonly type: ScpHistoryEntryVariantName;

  static readonly schema: XdrType<ScpHistoryEntryWire> = union(
    "ScpHistoryEntry",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, field("v0", ScpHistoryEntryV0.schema))],
      switchKey: "v",
    },
  );

  static v0(v0: ScpHistoryEntryV0): ScpHistoryEntryV0Arm {
    return new ScpHistoryEntryV0Arm(v0);
  }

  static fromXdrObject(wire: ScpHistoryEntryWire): ScpHistoryEntry {
    switch (wire.v) {
      case 0:
        return new ScpHistoryEntryV0Arm(
          ScpHistoryEntryV0.fromXdrObject(wire.v0),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ScpHistoryEntry variant.
   * Use this instead of `instanceof ScpHistoryEntry`: the exported `ScpHistoryEntry` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ScpHistoryEntry.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ScpHistoryEntry {
    return value instanceof ScpHistoryEntryBase;
  }

  abstract toXdrObject(): ScpHistoryEntryWire;
}

export class ScpHistoryEntryV0Arm extends ScpHistoryEntryBase {
  readonly type = "v0" as const;
  readonly v0: ScpHistoryEntryV0;

  constructor(v0: ScpHistoryEntryV0) {
    super();
    this.v0 = v0;
  }

  get value(): ScpHistoryEntryV0 {
    return this.v0;
  }

  toXdrObject(): Extract<ScpHistoryEntryWire, { v: 0 }> {
    return { v: 0, v0: this.v0.toXdrObject() };
  }
}

export type ScpHistoryEntry = ScpHistoryEntryV0Arm;
export const ScpHistoryEntry = ScpHistoryEntryBase;
