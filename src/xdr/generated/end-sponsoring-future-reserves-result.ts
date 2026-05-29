/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { EndSponsoringFutureReservesResultCode } from "./end-sponsoring-future-reserves-result-code.js";

export type EndSponsoringFutureReservesResultWire = { code: 0 } | { code: -1 };

export type EndSponsoringFutureReservesResultVariantName =
  | "endSponsoringFutureReservesSuccess"
  | "endSponsoringFutureReservesNotSponsored";

/**
 * ```xdr
 * union EndSponsoringFutureReservesResult switch (
 *     EndSponsoringFutureReservesResultCode code)
 * {
 * case END_SPONSORING_FUTURE_RESERVES_SUCCESS:
 *     void;
 * case END_SPONSORING_FUTURE_RESERVES_NOT_SPONSORED:
 *     void;
 * };
 * ```
 */
abstract class EndSponsoringFutureReservesResultBase extends XdrValue {
  abstract readonly type: EndSponsoringFutureReservesResultVariantName;

  static readonly schema: XdrType<EndSponsoringFutureReservesResultWire> =
    union("EndSponsoringFutureReservesResult", {
      switchOn: EndSponsoringFutureReservesResultCode.schema,
      cases: [
        case_("endSponsoringFutureReservesSuccess", 0, voidType()),
        case_("endSponsoringFutureReservesNotSponsored", -1, voidType()),
      ],
      switchKey: "code",
    });

  static endSponsoringFutureReservesSuccess(): EndSponsoringFutureReservesResultSuccess {
    return new EndSponsoringFutureReservesResultSuccess();
  }

  static endSponsoringFutureReservesNotSponsored(): EndSponsoringFutureReservesResultNotSponsored {
    return new EndSponsoringFutureReservesResultNotSponsored();
  }

  static fromXdrObject(
    wire: EndSponsoringFutureReservesResultWire,
  ): EndSponsoringFutureReservesResult {
    switch (wire.code) {
      case 0:
        return new EndSponsoringFutureReservesResultSuccess();
      case -1:
        return new EndSponsoringFutureReservesResultNotSponsored();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete EndSponsoringFutureReservesResult variant.
   * Use this instead of `instanceof EndSponsoringFutureReservesResult`: the exported `EndSponsoringFutureReservesResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `EndSponsoringFutureReservesResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is EndSponsoringFutureReservesResult {
    return value instanceof EndSponsoringFutureReservesResultBase;
  }

  abstract toXdrObject(): EndSponsoringFutureReservesResultWire;
}

export class EndSponsoringFutureReservesResultSuccess extends EndSponsoringFutureReservesResultBase {
  readonly type = "endSponsoringFutureReservesSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<EndSponsoringFutureReservesResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class EndSponsoringFutureReservesResultNotSponsored extends EndSponsoringFutureReservesResultBase {
  readonly type = "endSponsoringFutureReservesNotSponsored" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<EndSponsoringFutureReservesResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export type EndSponsoringFutureReservesResult =
  | EndSponsoringFutureReservesResultSuccess
  | EndSponsoringFutureReservesResultNotSponsored;
export const EndSponsoringFutureReservesResult =
  EndSponsoringFutureReservesResultBase;
