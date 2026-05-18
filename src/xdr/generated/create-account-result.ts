/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { CreateAccountResultCode } from "./create-account-result-code.js";

export type CreateAccountResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 };

export type CreateAccountResultVariantName =
  | "createAccountSuccess"
  | "createAccountMalformed"
  | "createAccountUnderfunded"
  | "createAccountLowReserve"
  | "createAccountAlreadyExist";

/**
 * ```xdr
 * union CreateAccountResult switch (CreateAccountResultCode code)
 * {
 * case CREATE_ACCOUNT_SUCCESS:
 *     void;
 * case CREATE_ACCOUNT_MALFORMED:
 * case CREATE_ACCOUNT_UNDERFUNDED:
 * case CREATE_ACCOUNT_LOW_RESERVE:
 * case CREATE_ACCOUNT_ALREADY_EXIST:
 *     void;
 * };
 * ```
 */
abstract class CreateAccountResultBase extends XdrValue {
  abstract readonly type: CreateAccountResultVariantName;

  static readonly schema: XdrType<CreateAccountResultWire> = union(
    "CreateAccountResult",
    {
      switchOn: CreateAccountResultCode.schema,
      cases: [
        case_("createAccountSuccess", 0, voidType()),
        case_("createAccountMalformed", -1, voidType()),
        case_("createAccountUnderfunded", -2, voidType()),
        case_("createAccountLowReserve", -3, voidType()),
        case_("createAccountAlreadyExist", -4, voidType()),
      ],
      switchKey: "code",
    },
  );

  static createAccountSuccess(): CreateAccountResultSuccess {
    return new CreateAccountResultSuccess();
  }

  static createAccountMalformed(): CreateAccountResultMalformed {
    return new CreateAccountResultMalformed();
  }

  static createAccountUnderfunded(): CreateAccountResultUnderfunded {
    return new CreateAccountResultUnderfunded();
  }

  static createAccountLowReserve(): CreateAccountResultLowReserve {
    return new CreateAccountResultLowReserve();
  }

  static createAccountAlreadyExist(): CreateAccountResultAlreadyExist {
    return new CreateAccountResultAlreadyExist();
  }

  static fromXdrObject(wire: CreateAccountResultWire): CreateAccountResult {
    switch (wire.code) {
      case 0:
        return new CreateAccountResultSuccess();
      case -1:
        return new CreateAccountResultMalformed();
      case -2:
        return new CreateAccountResultUnderfunded();
      case -3:
        return new CreateAccountResultLowReserve();
      case -4:
        return new CreateAccountResultAlreadyExist();
    }
  }

  abstract toXdrObject(): CreateAccountResultWire;
}

export class CreateAccountResultSuccess extends CreateAccountResultBase {
  readonly type = "createAccountSuccess" as const;

  toXdrObject(): Extract<CreateAccountResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class CreateAccountResultMalformed extends CreateAccountResultBase {
  readonly type = "createAccountMalformed" as const;

  toXdrObject(): Extract<CreateAccountResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class CreateAccountResultUnderfunded extends CreateAccountResultBase {
  readonly type = "createAccountUnderfunded" as const;

  toXdrObject(): Extract<CreateAccountResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class CreateAccountResultLowReserve extends CreateAccountResultBase {
  readonly type = "createAccountLowReserve" as const;

  toXdrObject(): Extract<CreateAccountResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class CreateAccountResultAlreadyExist extends CreateAccountResultBase {
  readonly type = "createAccountAlreadyExist" as const;

  toXdrObject(): Extract<CreateAccountResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export type CreateAccountResult =
  | CreateAccountResultSuccess
  | CreateAccountResultMalformed
  | CreateAccountResultUnderfunded
  | CreateAccountResultLowReserve
  | CreateAccountResultAlreadyExist;
export const CreateAccountResult = CreateAccountResultBase;
