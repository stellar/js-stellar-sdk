/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export type LedgerHeaderHistoryEntryExtWire = { v: 0 };

export type LedgerHeaderHistoryEntryExtVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 * ```
 */
abstract class LedgerHeaderHistoryEntryExtBase extends XdrValue {
  abstract readonly type: LedgerHeaderHistoryEntryExtVariantName;

  static readonly schema: XdrType<LedgerHeaderHistoryEntryExtWire> = union(
    "LedgerHeaderHistoryEntryExt",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, voidType())],
      switchKey: "v",
    },
  );

  static v0(): LedgerHeaderHistoryEntryExtV0 {
    return new LedgerHeaderHistoryEntryExtV0();
  }

  static fromXdrObject(
    wire: LedgerHeaderHistoryEntryExtWire,
  ): LedgerHeaderHistoryEntryExt {
    switch (wire.v) {
      case 0:
        return new LedgerHeaderHistoryEntryExtV0();
    }
  }

  abstract toXdrObject(): LedgerHeaderHistoryEntryExtWire;
}

export class LedgerHeaderHistoryEntryExtV0 extends LedgerHeaderHistoryEntryExtBase {
  readonly type = "v0" as const;

  toXdrObject(): Extract<LedgerHeaderHistoryEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export type LedgerHeaderHistoryEntryExt = LedgerHeaderHistoryEntryExtV0;
export const LedgerHeaderHistoryEntryExt = LedgerHeaderHistoryEntryExtBase;
