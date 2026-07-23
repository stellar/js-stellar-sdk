/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { CreateClaimableBalanceResultCode } from "./create-claimable-balance-result-code.js";
import {
  ClaimableBalanceId,
  type ClaimableBalanceIdWire,
} from "./claimable-balance-id.js";

export type CreateClaimableBalanceResultWire =
  | { code: 0; balanceId: ClaimableBalanceIdWire }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 };

export type CreateClaimableBalanceResultVariantName =
  | "createClaimableBalanceSuccess"
  | "createClaimableBalanceMalformed"
  | "createClaimableBalanceLowReserve"
  | "createClaimableBalanceNoTrust"
  | "createClaimableBalanceNotAuthorized"
  | "createClaimableBalanceUnderfunded";

/**
 * ```xdr
 * union CreateClaimableBalanceResult switch (
 *     CreateClaimableBalanceResultCode code)
 * {
 * case CREATE_CLAIMABLE_BALANCE_SUCCESS:
 *     ClaimableBalanceID balanceID;
 * case CREATE_CLAIMABLE_BALANCE_MALFORMED:
 * case CREATE_CLAIMABLE_BALANCE_LOW_RESERVE:
 * case CREATE_CLAIMABLE_BALANCE_NO_TRUST:
 * case CREATE_CLAIMABLE_BALANCE_NOT_AUTHORIZED:
 * case CREATE_CLAIMABLE_BALANCE_UNDERFUNDED:
 *     void;
 * };
 * ```
 */
abstract class CreateClaimableBalanceResultBase extends XdrValue {
  abstract readonly type: CreateClaimableBalanceResultVariantName;

  static readonly schema: XdrType<CreateClaimableBalanceResultWire> = union(
    "CreateClaimableBalanceResult",
    {
      switchOn: CreateClaimableBalanceResultCode.schema,
      cases: [
        case_(
          "createClaimableBalanceSuccess",
          0,
          field("balanceId", ClaimableBalanceId.schema),
        ),
        case_("createClaimableBalanceMalformed", -1, voidType()),
        case_("createClaimableBalanceLowReserve", -2, voidType()),
        case_("createClaimableBalanceNoTrust", -3, voidType()),
        case_("createClaimableBalanceNotAuthorized", -4, voidType()),
        case_("createClaimableBalanceUnderfunded", -5, voidType()),
      ],
      switchKey: "code",
    },
  );

  static createClaimableBalanceSuccess(
    balanceId: ClaimableBalanceId,
  ): CreateClaimableBalanceResultSuccess {
    return new CreateClaimableBalanceResultSuccess(balanceId);
  }

  static createClaimableBalanceMalformed(): CreateClaimableBalanceResultMalformed {
    return new CreateClaimableBalanceResultMalformed();
  }

  static createClaimableBalanceLowReserve(): CreateClaimableBalanceResultLowReserve {
    return new CreateClaimableBalanceResultLowReserve();
  }

  static createClaimableBalanceNoTrust(): CreateClaimableBalanceResultNoTrust {
    return new CreateClaimableBalanceResultNoTrust();
  }

  static createClaimableBalanceNotAuthorized(): CreateClaimableBalanceResultNotAuthorized {
    return new CreateClaimableBalanceResultNotAuthorized();
  }

  static createClaimableBalanceUnderfunded(): CreateClaimableBalanceResultUnderfunded {
    return new CreateClaimableBalanceResultUnderfunded();
  }

  static fromXdrObject(
    wire: CreateClaimableBalanceResultWire,
  ): CreateClaimableBalanceResult {
    switch (wire.code) {
      case 0:
        return new CreateClaimableBalanceResultSuccess(
          ClaimableBalanceId.fromXdrObject(wire.balanceId),
        );
      case -1:
        return new CreateClaimableBalanceResultMalformed();
      case -2:
        return new CreateClaimableBalanceResultLowReserve();
      case -3:
        return new CreateClaimableBalanceResultNoTrust();
      case -4:
        return new CreateClaimableBalanceResultNotAuthorized();
      case -5:
        return new CreateClaimableBalanceResultUnderfunded();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete CreateClaimableBalanceResult variant.
   * Use this instead of `instanceof CreateClaimableBalanceResult`: the exported `CreateClaimableBalanceResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `CreateClaimableBalanceResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is CreateClaimableBalanceResult {
    return value instanceof CreateClaimableBalanceResultBase;
  }

  abstract toXdrObject(): CreateClaimableBalanceResultWire;
}

export class CreateClaimableBalanceResultSuccess extends CreateClaimableBalanceResultBase {
  readonly type = "createClaimableBalanceSuccess" as const;
  readonly balanceId: ClaimableBalanceId;

  constructor(balanceId: ClaimableBalanceId) {
    super();
    this.balanceId = balanceId;
  }

  get value(): ClaimableBalanceId {
    return this.balanceId;
  }

  toXdrObject(): Extract<CreateClaimableBalanceResultWire, { code: 0 }> {
    return { code: 0, balanceId: this.balanceId.toXdrObject() };
  }
}

export class CreateClaimableBalanceResultMalformed extends CreateClaimableBalanceResultBase {
  readonly type = "createClaimableBalanceMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<CreateClaimableBalanceResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class CreateClaimableBalanceResultLowReserve extends CreateClaimableBalanceResultBase {
  readonly type = "createClaimableBalanceLowReserve" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<CreateClaimableBalanceResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class CreateClaimableBalanceResultNoTrust extends CreateClaimableBalanceResultBase {
  readonly type = "createClaimableBalanceNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<CreateClaimableBalanceResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class CreateClaimableBalanceResultNotAuthorized extends CreateClaimableBalanceResultBase {
  readonly type = "createClaimableBalanceNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<CreateClaimableBalanceResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class CreateClaimableBalanceResultUnderfunded extends CreateClaimableBalanceResultBase {
  readonly type = "createClaimableBalanceUnderfunded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<CreateClaimableBalanceResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export type CreateClaimableBalanceResult =
  | CreateClaimableBalanceResultSuccess
  | CreateClaimableBalanceResultMalformed
  | CreateClaimableBalanceResultLowReserve
  | CreateClaimableBalanceResultNoTrust
  | CreateClaimableBalanceResultNotAuthorized
  | CreateClaimableBalanceResultUnderfunded;
export const CreateClaimableBalanceResult = CreateClaimableBalanceResultBase;
