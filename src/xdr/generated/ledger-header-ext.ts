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
  LedgerHeaderExtensionV1,
  type LedgerHeaderExtensionV1Wire,
} from "./ledger-header-extension-v1.js";

export type LedgerHeaderExtWire =
  | { v: 0 }
  | { v: 1; v1: LedgerHeaderExtensionV1Wire };

export type LedgerHeaderExtVariantName = "v0" | "v1";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         LedgerHeaderExtensionV1 v1;
 *     }
 * ```
 */
abstract class LedgerHeaderExtBase extends XdrValue {
  abstract readonly type: LedgerHeaderExtVariantName;

  static readonly schema: XdrType<LedgerHeaderExtWire> = union(
    "LedgerHeaderExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v1", 1, field("v1", LedgerHeaderExtensionV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): LedgerHeaderExtV0 {
    return new LedgerHeaderExtV0();
  }

  static v1(v1: LedgerHeaderExtensionV1): LedgerHeaderExtV1 {
    return new LedgerHeaderExtV1(v1);
  }

  static fromXdrObject(wire: LedgerHeaderExtWire): LedgerHeaderExt {
    switch (wire.v) {
      case 0:
        return new LedgerHeaderExtV0();
      case 1:
        return new LedgerHeaderExtV1(
          LedgerHeaderExtensionV1.fromXdrObject(wire.v1),
        );
    }
  }

  abstract toXdrObject(): LedgerHeaderExtWire;
}

export class LedgerHeaderExtV0 extends LedgerHeaderExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LedgerHeaderExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class LedgerHeaderExtV1 extends LedgerHeaderExtBase {
  readonly type = "v1" as const;
  readonly v1: LedgerHeaderExtensionV1;

  constructor(v1: LedgerHeaderExtensionV1) {
    super();
    this.v1 = v1;
  }

  get value(): LedgerHeaderExtensionV1 {
    return this.v1;
  }

  toXdrObject(): Extract<LedgerHeaderExtWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type LedgerHeaderExt = LedgerHeaderExtV0 | LedgerHeaderExtV1;
export const LedgerHeaderExt = LedgerHeaderExtBase;
