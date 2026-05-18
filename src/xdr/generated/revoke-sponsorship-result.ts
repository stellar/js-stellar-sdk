/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { RevokeSponsorshipResultCode } from "./revoke-sponsorship-result-code.js";

export type RevokeSponsorshipResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 };

export type RevokeSponsorshipResultVariantName =
  | "revokeSponsorshipSuccess"
  | "revokeSponsorshipDoesNotExist"
  | "revokeSponsorshipNotSponsor"
  | "revokeSponsorshipLowReserve"
  | "revokeSponsorshipOnlyTransferable"
  | "revokeSponsorshipMalformed";

/**
 * ```xdr
 * union RevokeSponsorshipResult switch (RevokeSponsorshipResultCode code)
 * {
 * case REVOKE_SPONSORSHIP_SUCCESS:
 *     void;
 * case REVOKE_SPONSORSHIP_DOES_NOT_EXIST:
 * case REVOKE_SPONSORSHIP_NOT_SPONSOR:
 * case REVOKE_SPONSORSHIP_LOW_RESERVE:
 * case REVOKE_SPONSORSHIP_ONLY_TRANSFERABLE:
 * case REVOKE_SPONSORSHIP_MALFORMED:
 *     void;
 * };
 * ```
 */
abstract class RevokeSponsorshipResultBase extends XdrValue {
  abstract readonly type: RevokeSponsorshipResultVariantName;

  static readonly schema: XdrType<RevokeSponsorshipResultWire> = union(
    "RevokeSponsorshipResult",
    {
      switchOn: RevokeSponsorshipResultCode.schema,
      cases: [
        case_("revokeSponsorshipSuccess", 0, voidType()),
        case_("revokeSponsorshipDoesNotExist", -1, voidType()),
        case_("revokeSponsorshipNotSponsor", -2, voidType()),
        case_("revokeSponsorshipLowReserve", -3, voidType()),
        case_("revokeSponsorshipOnlyTransferable", -4, voidType()),
        case_("revokeSponsorshipMalformed", -5, voidType()),
      ],
      switchKey: "code",
    },
  );

  static revokeSponsorshipSuccess(): RevokeSponsorshipResultSuccess {
    return new RevokeSponsorshipResultSuccess();
  }

  static revokeSponsorshipDoesNotExist(): RevokeSponsorshipResultDoesNotExist {
    return new RevokeSponsorshipResultDoesNotExist();
  }

  static revokeSponsorshipNotSponsor(): RevokeSponsorshipResultNotSponsor {
    return new RevokeSponsorshipResultNotSponsor();
  }

  static revokeSponsorshipLowReserve(): RevokeSponsorshipResultLowReserve {
    return new RevokeSponsorshipResultLowReserve();
  }

  static revokeSponsorshipOnlyTransferable(): RevokeSponsorshipResultOnlyTransferable {
    return new RevokeSponsorshipResultOnlyTransferable();
  }

  static revokeSponsorshipMalformed(): RevokeSponsorshipResultMalformed {
    return new RevokeSponsorshipResultMalformed();
  }

  static fromXdrObject(
    wire: RevokeSponsorshipResultWire,
  ): RevokeSponsorshipResult {
    switch (wire.code) {
      case 0:
        return new RevokeSponsorshipResultSuccess();
      case -1:
        return new RevokeSponsorshipResultDoesNotExist();
      case -2:
        return new RevokeSponsorshipResultNotSponsor();
      case -3:
        return new RevokeSponsorshipResultLowReserve();
      case -4:
        return new RevokeSponsorshipResultOnlyTransferable();
      case -5:
        return new RevokeSponsorshipResultMalformed();
    }
  }

  abstract toXdrObject(): RevokeSponsorshipResultWire;
}

export class RevokeSponsorshipResultSuccess extends RevokeSponsorshipResultBase {
  readonly type = "revokeSponsorshipSuccess" as const;

  toXdrObject(): Extract<RevokeSponsorshipResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class RevokeSponsorshipResultDoesNotExist extends RevokeSponsorshipResultBase {
  readonly type = "revokeSponsorshipDoesNotExist" as const;

  toXdrObject(): Extract<RevokeSponsorshipResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class RevokeSponsorshipResultNotSponsor extends RevokeSponsorshipResultBase {
  readonly type = "revokeSponsorshipNotSponsor" as const;

  toXdrObject(): Extract<RevokeSponsorshipResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class RevokeSponsorshipResultLowReserve extends RevokeSponsorshipResultBase {
  readonly type = "revokeSponsorshipLowReserve" as const;

  toXdrObject(): Extract<RevokeSponsorshipResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class RevokeSponsorshipResultOnlyTransferable extends RevokeSponsorshipResultBase {
  readonly type = "revokeSponsorshipOnlyTransferable" as const;

  toXdrObject(): Extract<RevokeSponsorshipResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class RevokeSponsorshipResultMalformed extends RevokeSponsorshipResultBase {
  readonly type = "revokeSponsorshipMalformed" as const;

  toXdrObject(): Extract<RevokeSponsorshipResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export type RevokeSponsorshipResult =
  | RevokeSponsorshipResultSuccess
  | RevokeSponsorshipResultDoesNotExist
  | RevokeSponsorshipResultNotSponsor
  | RevokeSponsorshipResultLowReserve
  | RevokeSponsorshipResultOnlyTransferable
  | RevokeSponsorshipResultMalformed;
export const RevokeSponsorshipResult = RevokeSponsorshipResultBase;
