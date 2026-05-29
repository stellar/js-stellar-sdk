import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type CreateAccountResultCodeWire = number;

export type CreateAccountResultCodeName =
  | "createAccountSuccess"
  | "createAccountMalformed"
  | "createAccountUnderfunded"
  | "createAccountLowReserve"
  | "createAccountAlreadyExist";

/**
 * ```xdr
 * enum CreateAccountResultCode
 * {
 *     // codes considered as "success" for the operation
 *     CREATE_ACCOUNT_SUCCESS = 0, // account was created
 *
 *     // codes considered as "failure" for the operation
 *     CREATE_ACCOUNT_MALFORMED = -1,   // invalid destination
 *     CREATE_ACCOUNT_UNDERFUNDED = -2, // not enough funds in source account
 *     CREATE_ACCOUNT_LOW_RESERVE =
 *         -3, // would create an account below the min reserve
 *     CREATE_ACCOUNT_ALREADY_EXIST = -4 // account already exists
 * };
 * ```
 */
export class CreateAccountResultCode extends EnumValue<CreateAccountResultCodeName> {
  static readonly createAccountSuccess = new CreateAccountResultCode(
    "createAccountSuccess",
    0,
  );
  static readonly createAccountMalformed = new CreateAccountResultCode(
    "createAccountMalformed",
    -1,
  );
  static readonly createAccountUnderfunded = new CreateAccountResultCode(
    "createAccountUnderfunded",
    -2,
  );
  static readonly createAccountLowReserve = new CreateAccountResultCode(
    "createAccountLowReserve",
    -3,
  );
  static readonly createAccountAlreadyExist = new CreateAccountResultCode(
    "createAccountAlreadyExist",
    -4,
  );

  static readonly schema = enumType("CreateAccountResultCode", {
    createAccountSuccess: 0,
    createAccountMalformed: -1,
    createAccountUnderfunded: -2,
    createAccountLowReserve: -3,
    createAccountAlreadyExist: -4,
  });

  static fromValue(value: number): CreateAccountResultCode {
    return enumFromValue(
      "CreateAccountResultCode",
      CreateAccountResultCode.schema,
      CreateAccountResultCode,
      value,
    );
  }

  static fromName(name: CreateAccountResultCodeName): CreateAccountResultCode {
    return enumFromName(
      "CreateAccountResultCode",
      CreateAccountResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): CreateAccountResultCode {
    return CreateAccountResultCode.fromValue(wire);
  }
}
