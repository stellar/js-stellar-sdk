/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, int32, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerCloseMetaV0,
  type LedgerCloseMetaV0Wire,
} from "./ledger-close-meta-v0.js";
import {
  LedgerCloseMetaV1,
  type LedgerCloseMetaV1Wire,
} from "./ledger-close-meta-v1.js";
import {
  LedgerCloseMetaV2,
  type LedgerCloseMetaV2Wire,
} from "./ledger-close-meta-v2.js";

export type LedgerCloseMetaWire =
  | { v: 0; v0: LedgerCloseMetaV0Wire }
  | { v: 1; v1: LedgerCloseMetaV1Wire }
  | { v: 2; v2: LedgerCloseMetaV2Wire };

export type LedgerCloseMetaVariantName = "v0" | "v1" | "v2";

/**
 * ```xdr
 * union LedgerCloseMeta switch (int v)
 * {
 * case 0:
 *     LedgerCloseMetaV0 v0;
 * case 1:
 *     LedgerCloseMetaV1 v1;
 * case 2:
 *     LedgerCloseMetaV2 v2;
 * };
 * ```
 */
abstract class LedgerCloseMetaBase extends XdrValue {
  abstract readonly type: LedgerCloseMetaVariantName;

  static readonly schema: XdrType<LedgerCloseMetaWire> = union(
    "LedgerCloseMeta",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, field("v0", LedgerCloseMetaV0.schema)),
        case_("v1", 1, field("v1", LedgerCloseMetaV1.schema)),
        case_("v2", 2, field("v2", LedgerCloseMetaV2.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(v0: LedgerCloseMetaV0): LedgerCloseMetaV0Arm {
    return new LedgerCloseMetaV0Arm(v0);
  }

  static v1(v1: LedgerCloseMetaV1): LedgerCloseMetaV1Arm {
    return new LedgerCloseMetaV1Arm(v1);
  }

  static v2(v2: LedgerCloseMetaV2): LedgerCloseMetaV2Arm {
    return new LedgerCloseMetaV2Arm(v2);
  }

  static fromXdrObject(wire: LedgerCloseMetaWire): LedgerCloseMeta {
    switch (wire.v) {
      case 0:
        return new LedgerCloseMetaV0Arm(
          LedgerCloseMetaV0.fromXdrObject(wire.v0),
        );
      case 1:
        return new LedgerCloseMetaV1Arm(
          LedgerCloseMetaV1.fromXdrObject(wire.v1),
        );
      case 2:
        return new LedgerCloseMetaV2Arm(
          LedgerCloseMetaV2.fromXdrObject(wire.v2),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LedgerCloseMeta variant.
   * Use this instead of `instanceof LedgerCloseMeta`: the exported `LedgerCloseMeta` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LedgerCloseMeta.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LedgerCloseMeta {
    return value instanceof LedgerCloseMetaBase;
  }

  abstract toXdrObject(): LedgerCloseMetaWire;
}

export class LedgerCloseMetaV0Arm extends LedgerCloseMetaBase {
  readonly type = "v0" as const;
  readonly v0: LedgerCloseMetaV0;

  constructor(v0: LedgerCloseMetaV0) {
    super();
    this.v0 = v0;
  }

  get value(): LedgerCloseMetaV0 {
    return this.v0;
  }

  toXdrObject(): Extract<LedgerCloseMetaWire, { v: 0 }> {
    return { v: 0, v0: this.v0.toXdrObject() };
  }
}

export class LedgerCloseMetaV1Arm extends LedgerCloseMetaBase {
  readonly type = "v1" as const;
  readonly v1: LedgerCloseMetaV1;

  constructor(v1: LedgerCloseMetaV1) {
    super();
    this.v1 = v1;
  }

  get value(): LedgerCloseMetaV1 {
    return this.v1;
  }

  toXdrObject(): Extract<LedgerCloseMetaWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export class LedgerCloseMetaV2Arm extends LedgerCloseMetaBase {
  readonly type = "v2" as const;
  readonly v2: LedgerCloseMetaV2;

  constructor(v2: LedgerCloseMetaV2) {
    super();
    this.v2 = v2;
  }

  get value(): LedgerCloseMetaV2 {
    return this.v2;
  }

  toXdrObject(): Extract<LedgerCloseMetaWire, { v: 2 }> {
    return { v: 2, v2: this.v2.toXdrObject() };
  }
}

export type LedgerCloseMeta =
  | LedgerCloseMetaV0Arm
  | LedgerCloseMetaV1Arm
  | LedgerCloseMetaV2Arm;
export const LedgerCloseMeta = LedgerCloseMetaBase;
