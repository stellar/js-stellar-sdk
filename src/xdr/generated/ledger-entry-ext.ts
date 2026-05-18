/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerEntryExtensionV1,
  type LedgerEntryExtensionV1Wire,
} from "./ledger-entry-extension-v1.js";

export type LedgerEntryExtWire =
  | { v: 0 }
  | { v: 1; v1: LedgerEntryExtensionV1Wire };

export type LedgerEntryExtVariantName = "v0" | "v1";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         LedgerEntryExtensionV1 v1;
 *     }
 * ```
 */
abstract class LedgerEntryExtBase extends XdrValue {
  abstract readonly type: LedgerEntryExtVariantName;

  static readonly schema: XdrType<LedgerEntryExtWire> = union(
    "LedgerEntryExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v1", 1, field("v1", LedgerEntryExtensionV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): LedgerEntryExtV0 {
    return new LedgerEntryExtV0();
  }

  static v1(v1: LedgerEntryExtensionV1): LedgerEntryExtV1 {
    return new LedgerEntryExtV1(v1);
  }

  static fromXdrObject(wire: LedgerEntryExtWire): LedgerEntryExt {
    switch (wire.v) {
      case 0:
        return new LedgerEntryExtV0();
      case 1:
        return new LedgerEntryExtV1(
          LedgerEntryExtensionV1.fromXdrObject(wire.v1),
        );
    }
  }

  abstract toXdrObject(): LedgerEntryExtWire;
}

export class LedgerEntryExtV0 extends LedgerEntryExtBase {
  readonly type = "v0" as const;

  toXdrObject(): Extract<LedgerEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class LedgerEntryExtV1 extends LedgerEntryExtBase {
  readonly type = "v1" as const;
  readonly v1: LedgerEntryExtensionV1;

  constructor(v1: LedgerEntryExtensionV1) {
    super();
    this.v1 = v1;
  }

  get value(): LedgerEntryExtensionV1 {
    return this.v1;
  }

  toXdrObject(): Extract<LedgerEntryExtWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type LedgerEntryExt = LedgerEntryExtV0 | LedgerEntryExtV1;
export const LedgerEntryExt = LedgerEntryExtBase;
