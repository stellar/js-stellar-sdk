import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, CreateAccountResultCode>
  > = {
    0: CreateAccountResultCode.createAccountSuccess,
    "-1": CreateAccountResultCode.createAccountMalformed,
    "-2": CreateAccountResultCode.createAccountUnderfunded,
    "-3": CreateAccountResultCode.createAccountLowReserve,
    "-4": CreateAccountResultCode.createAccountAlreadyExist,
  };

  static readonly schema = enumType("CreateAccountResultCode", {
    createAccountSuccess: 0,
    createAccountMalformed: -1,
    createAccountUnderfunded: -2,
    createAccountLowReserve: -3,
    createAccountAlreadyExist: -4,
  });

  static fromValue(value: number): CreateAccountResultCode {
    return enumLookup(
      "CreateAccountResultCode",
      CreateAccountResultCode.byValue,
      value,
    ) as CreateAccountResultCode;
  }

  static fromName(name: CreateAccountResultCodeName): CreateAccountResultCode {
    switch (name) {
      case "createAccountSuccess":
        return CreateAccountResultCode.createAccountSuccess;
      case "createAccountMalformed":
        return CreateAccountResultCode.createAccountMalformed;
      case "createAccountUnderfunded":
        return CreateAccountResultCode.createAccountUnderfunded;
      case "createAccountLowReserve":
        return CreateAccountResultCode.createAccountLowReserve;
      case "createAccountAlreadyExist":
        return CreateAccountResultCode.createAccountAlreadyExist;
      default:
        throw new XdrError(`CreateAccountResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): CreateAccountResultCode {
    return CreateAccountResultCode.fromValue(wire);
  }
}
