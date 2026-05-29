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
  LedgerCloseMetaExtV1,
  type LedgerCloseMetaExtV1Wire,
} from "./ledger-close-meta-ext-v1.js";

export type LedgerCloseMetaExtWire =
  | { v: 0 }
  | { v: 1; v1: LedgerCloseMetaExtV1Wire };

export type LedgerCloseMetaExtVariantName = "v0" | "v1";

/**
 * ```xdr
 * union LedgerCloseMetaExt switch (int v)
 * {
 * case 0:
 *     void;
 * case 1:
 *     LedgerCloseMetaExtV1 v1;
 * };
 * ```
 */
abstract class LedgerCloseMetaExtBase extends XdrValue {
  abstract readonly type: LedgerCloseMetaExtVariantName;

  static readonly schema: XdrType<LedgerCloseMetaExtWire> = union(
    "LedgerCloseMetaExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v1", 1, field("v1", LedgerCloseMetaExtV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): LedgerCloseMetaExtV0 {
    return new LedgerCloseMetaExtV0();
  }

  static v1(v1: LedgerCloseMetaExtV1): LedgerCloseMetaExtV1Arm {
    return new LedgerCloseMetaExtV1Arm(v1);
  }

  static fromXdrObject(wire: LedgerCloseMetaExtWire): LedgerCloseMetaExt {
    switch (wire.v) {
      case 0:
        return new LedgerCloseMetaExtV0();
      case 1:
        return new LedgerCloseMetaExtV1Arm(
          LedgerCloseMetaExtV1.fromXdrObject(wire.v1),
        );
    }
  }

  abstract toXdrObject(): LedgerCloseMetaExtWire;
}

export class LedgerCloseMetaExtV0 extends LedgerCloseMetaExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LedgerCloseMetaExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class LedgerCloseMetaExtV1Arm extends LedgerCloseMetaExtBase {
  readonly type = "v1" as const;
  readonly v1: LedgerCloseMetaExtV1;

  constructor(v1: LedgerCloseMetaExtV1) {
    super();
    this.v1 = v1;
  }

  get value(): LedgerCloseMetaExtV1 {
    return this.v1;
  }

  toXdrObject(): Extract<LedgerCloseMetaExtWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type LedgerCloseMetaExt = LedgerCloseMetaExtV0 | LedgerCloseMetaExtV1Arm;
export const LedgerCloseMetaExt = LedgerCloseMetaExtBase;
