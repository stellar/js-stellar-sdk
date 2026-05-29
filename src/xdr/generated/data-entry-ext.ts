/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export type DataEntryExtWire = { v: 0 };

export type DataEntryExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class DataEntryExtBase extends XdrValue {
  abstract readonly type: DataEntryExtVariantName;

  static readonly schema: XdrType<DataEntryExtWire> = union("DataEntryExt", {
    switchOn: int32(),
    cases: [case_("v0", 0, voidType())],
    switchKey: "v",
  });

  static v0(): DataEntryExtV0 {
    return new DataEntryExtV0();
  }

  static fromXdrObject(wire: DataEntryExtWire): DataEntryExt {
    switch (wire.v) {
      case 0:
        return new DataEntryExtV0();
    }
  }

  abstract toXdrObject(): DataEntryExtWire;
}

export class DataEntryExtV0 extends DataEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<DataEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type DataEntryExt = DataEntryExtV0;
export const DataEntryExt = DataEntryExtBase;
