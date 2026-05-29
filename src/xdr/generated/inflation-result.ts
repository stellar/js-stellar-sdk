/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { InflationResultCode } from "./inflation-result-code.js";
import {
  InflationPayout,
  type InflationPayoutWire,
} from "./inflation-payout.js";

export type InflationResultWire =
  | { code: 0; payouts: InflationPayoutWire[] }
  | { code: -1 };

export type InflationResultVariantName =
  | "inflationSuccess"
  | "inflationNotTime";

/**
 * ```xdr
 * union InflationResult switch (InflationResultCode code)
 * {
 * case INFLATION_SUCCESS:
 *     InflationPayout payouts<>;
 * case INFLATION_NOT_TIME:
 *     void;
 * };
 * ```
 */
abstract class InflationResultBase extends XdrValue {
  abstract readonly type: InflationResultVariantName;

  static readonly schema: XdrType<InflationResultWire> = union(
    "InflationResult",
    {
      switchOn: InflationResultCode.schema,
      cases: [
        case_(
          "inflationSuccess",
          0,
          field("payouts", array(InflationPayout.schema, UNBOUNDED_MAX_LENGTH)),
        ),
        case_("inflationNotTime", -1, voidType()),
      ],
      switchKey: "code",
    },
  );

  static inflationSuccess(payouts: InflationPayout[]): InflationResultSuccess {
    return new InflationResultSuccess(payouts);
  }

  static inflationNotTime(): InflationResultNotTime {
    return new InflationResultNotTime();
  }

  static fromXdrObject(wire: InflationResultWire): InflationResult {
    switch (wire.code) {
      case 0:
        return new InflationResultSuccess(
          wire.payouts.map((w) => InflationPayout.fromXdrObject(w)),
        );
      case -1:
        return new InflationResultNotTime();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete InflationResult variant.
   * Use this instead of `instanceof InflationResult`: the exported `InflationResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `InflationResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is InflationResult {
    return value instanceof InflationResultBase;
  }

  abstract toXdrObject(): InflationResultWire;
}

export class InflationResultSuccess extends InflationResultBase {
  readonly type = "inflationSuccess" as const;
  readonly payouts: InflationPayout[];

  constructor(payouts: InflationPayout[]) {
    super();
    this.payouts = payouts;
  }

  get value(): InflationPayout[] {
    return this.payouts;
  }

  toXdrObject(): Extract<InflationResultWire, { code: 0 }> {
    return { code: 0, payouts: this.payouts.map((v) => v.toXdrObject()) };
  }
}

export class InflationResultNotTime extends InflationResultBase {
  readonly type = "inflationNotTime" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<InflationResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export type InflationResult = InflationResultSuccess | InflationResultNotTime;
export const InflationResult = InflationResultBase;
