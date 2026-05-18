/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { BeginSponsoringFutureReservesResultCode } from "./begin-sponsoring-future-reserves-result-code.js";

export type BeginSponsoringFutureReservesResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 };

export type BeginSponsoringFutureReservesResultVariantName =
  | "beginSponsoringFutureReservesSuccess"
  | "beginSponsoringFutureReservesMalformed"
  | "beginSponsoringFutureReservesAlreadySponsored"
  | "beginSponsoringFutureReservesRecursive";

/**
 * ```xdr
 * union BeginSponsoringFutureReservesResult switch (
 *     BeginSponsoringFutureReservesResultCode code)
 * {
 * case BEGIN_SPONSORING_FUTURE_RESERVES_SUCCESS:
 *     void;
 * case BEGIN_SPONSORING_FUTURE_RESERVES_MALFORMED:
 * case BEGIN_SPONSORING_FUTURE_RESERVES_ALREADY_SPONSORED:
 * case BEGIN_SPONSORING_FUTURE_RESERVES_RECURSIVE:
 *     void;
 * };
 * ```
 */
abstract class BeginSponsoringFutureReservesResultBase extends XdrValue {
  abstract readonly type: BeginSponsoringFutureReservesResultVariantName;

  static readonly schema: XdrType<BeginSponsoringFutureReservesResultWire> =
    union("BeginSponsoringFutureReservesResult", {
      switchOn: BeginSponsoringFutureReservesResultCode.schema,
      cases: [
        case_("beginSponsoringFutureReservesSuccess", 0, voidType()),
        case_("beginSponsoringFutureReservesMalformed", -1, voidType()),
        case_("beginSponsoringFutureReservesAlreadySponsored", -2, voidType()),
        case_("beginSponsoringFutureReservesRecursive", -3, voidType()),
      ],
      switchKey: "code",
    });

  static beginSponsoringFutureReservesSuccess(): BeginSponsoringFutureReservesResultSuccess {
    return new BeginSponsoringFutureReservesResultSuccess();
  }

  static beginSponsoringFutureReservesMalformed(): BeginSponsoringFutureReservesResultMalformed {
    return new BeginSponsoringFutureReservesResultMalformed();
  }

  static beginSponsoringFutureReservesAlreadySponsored(): BeginSponsoringFutureReservesResultAlreadySponsored {
    return new BeginSponsoringFutureReservesResultAlreadySponsored();
  }

  static beginSponsoringFutureReservesRecursive(): BeginSponsoringFutureReservesResultRecursive {
    return new BeginSponsoringFutureReservesResultRecursive();
  }

  static fromXdrObject(
    wire: BeginSponsoringFutureReservesResultWire,
  ): BeginSponsoringFutureReservesResult {
    switch (wire.code) {
      case 0:
        return new BeginSponsoringFutureReservesResultSuccess();
      case -1:
        return new BeginSponsoringFutureReservesResultMalformed();
      case -2:
        return new BeginSponsoringFutureReservesResultAlreadySponsored();
      case -3:
        return new BeginSponsoringFutureReservesResultRecursive();
    }
  }

  abstract toXdrObject(): BeginSponsoringFutureReservesResultWire;
}

export class BeginSponsoringFutureReservesResultSuccess extends BeginSponsoringFutureReservesResultBase {
  readonly type = "beginSponsoringFutureReservesSuccess" as const;

  toXdrObject(): Extract<BeginSponsoringFutureReservesResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class BeginSponsoringFutureReservesResultMalformed extends BeginSponsoringFutureReservesResultBase {
  readonly type = "beginSponsoringFutureReservesMalformed" as const;

  toXdrObject(): Extract<
    BeginSponsoringFutureReservesResultWire,
    { code: -1 }
  > {
    return { code: -1 };
  }
}

export class BeginSponsoringFutureReservesResultAlreadySponsored extends BeginSponsoringFutureReservesResultBase {
  readonly type = "beginSponsoringFutureReservesAlreadySponsored" as const;

  toXdrObject(): Extract<
    BeginSponsoringFutureReservesResultWire,
    { code: -2 }
  > {
    return { code: -2 };
  }
}

export class BeginSponsoringFutureReservesResultRecursive extends BeginSponsoringFutureReservesResultBase {
  readonly type = "beginSponsoringFutureReservesRecursive" as const;

  toXdrObject(): Extract<
    BeginSponsoringFutureReservesResultWire,
    { code: -3 }
  > {
    return { code: -3 };
  }
}

export type BeginSponsoringFutureReservesResult =
  | BeginSponsoringFutureReservesResultSuccess
  | BeginSponsoringFutureReservesResultMalformed
  | BeginSponsoringFutureReservesResultAlreadySponsored
  | BeginSponsoringFutureReservesResultRecursive;
export const BeginSponsoringFutureReservesResult =
  BeginSponsoringFutureReservesResultBase;
