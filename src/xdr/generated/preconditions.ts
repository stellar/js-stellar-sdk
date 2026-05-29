/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PreconditionType } from "./precondition-type.js";
import { TimeBounds, type TimeBoundsWire } from "./time-bounds.js";
import {
  PreconditionsV2,
  type PreconditionsV2Wire,
} from "./preconditions-v2.js";

export type PreconditionsWire =
  | { type: 0 }
  | { type: 1; timeBounds: TimeBoundsWire }
  | { type: 2; v2: PreconditionsV2Wire };

export type PreconditionsVariantName =
  | "precondNone"
  | "precondTime"
  | "precondV2";

/**
 * ```xdr
 * union Preconditions switch (PreconditionType type)
 * {
 * case PRECOND_NONE:
 *     void;
 * case PRECOND_TIME:
 *     TimeBounds timeBounds;
 * case PRECOND_V2:
 *     PreconditionsV2 v2;
 * };
 * ```
 */
abstract class PreconditionsBase extends XdrValue {
  abstract readonly type: PreconditionsVariantName;

  static readonly schema: XdrType<PreconditionsWire> = union("Preconditions", {
    switchOn: PreconditionType.schema,
    cases: [
      case_("precondNone", 0, voidType()),
      case_("precondTime", 1, field("timeBounds", TimeBounds.schema)),
      case_("precondV2", 2, field("v2", PreconditionsV2.schema)),
    ],
  });

  static precondNone(): PreconditionsNone {
    return new PreconditionsNone();
  }

  static precondTime(timeBounds: TimeBounds): PreconditionsTime {
    return new PreconditionsTime(timeBounds);
  }

  static precondV2(v2: PreconditionsV2): PreconditionsV2Arm {
    return new PreconditionsV2Arm(v2);
  }

  static fromXdrObject(wire: PreconditionsWire): Preconditions {
    switch (wire.type) {
      case 0:
        return new PreconditionsNone();
      case 1:
        return new PreconditionsTime(TimeBounds.fromXdrObject(wire.timeBounds));
      case 2:
        return new PreconditionsV2Arm(PreconditionsV2.fromXdrObject(wire.v2));
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete Preconditions variant.
   * Use this instead of `instanceof Preconditions`: the exported `Preconditions` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `Preconditions.is(x)` narrows to the union.
   */
  static is(value: unknown): value is Preconditions {
    return value instanceof PreconditionsBase;
  }

  abstract toXdrObject(): PreconditionsWire;
}

export class PreconditionsNone extends PreconditionsBase {
  readonly type = "precondNone" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PreconditionsWire, { type: 0 }> {
    return { type: 0 };
  }
}

export class PreconditionsTime extends PreconditionsBase {
  readonly type = "precondTime" as const;
  readonly timeBounds: TimeBounds;

  constructor(timeBounds: TimeBounds) {
    super();
    this.timeBounds = timeBounds;
  }

  get value(): TimeBounds {
    return this.timeBounds;
  }

  toXdrObject(): Extract<PreconditionsWire, { type: 1 }> {
    return { type: 1, timeBounds: this.timeBounds.toXdrObject() };
  }
}

export class PreconditionsV2Arm extends PreconditionsBase {
  readonly type = "precondV2" as const;
  readonly v2: PreconditionsV2;

  constructor(v2: PreconditionsV2) {
    super();
    this.v2 = v2;
  }

  get value(): PreconditionsV2 {
    return this.v2;
  }

  toXdrObject(): Extract<PreconditionsWire, { type: 2 }> {
    return { type: 2, v2: this.v2.toXdrObject() };
  }
}

export type Preconditions =
  | PreconditionsNone
  | PreconditionsTime
  | PreconditionsV2Arm;
export const Preconditions = PreconditionsBase;
