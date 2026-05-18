import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type CreateClaimableBalanceResultCodeWire = number;

export type CreateClaimableBalanceResultCodeName =
  | "createClaimableBalanceSuccess"
  | "createClaimableBalanceMalformed"
  | "createClaimableBalanceLowReserve"
  | "createClaimableBalanceNoTrust"
  | "createClaimableBalanceNotAuthorized"
  | "createClaimableBalanceUnderfunded";

/**
 * ```xdr
 * enum CreateClaimableBalanceResultCode
 * {
 *     CREATE_CLAIMABLE_BALANCE_SUCCESS = 0,
 *     CREATE_CLAIMABLE_BALANCE_MALFORMED = -1,
 *     CREATE_CLAIMABLE_BALANCE_LOW_RESERVE = -2,
 *     CREATE_CLAIMABLE_BALANCE_NO_TRUST = -3,
 *     CREATE_CLAIMABLE_BALANCE_NOT_AUTHORIZED = -4,
 *     CREATE_CLAIMABLE_BALANCE_UNDERFUNDED = -5
 * };
 * ```
 */
export class CreateClaimableBalanceResultCode extends EnumValue<CreateClaimableBalanceResultCodeName> {
  static readonly createClaimableBalanceSuccess =
    new CreateClaimableBalanceResultCode("createClaimableBalanceSuccess", 0);
  static readonly createClaimableBalanceMalformed =
    new CreateClaimableBalanceResultCode("createClaimableBalanceMalformed", -1);
  static readonly createClaimableBalanceLowReserve =
    new CreateClaimableBalanceResultCode(
      "createClaimableBalanceLowReserve",
      -2,
    );
  static readonly createClaimableBalanceNoTrust =
    new CreateClaimableBalanceResultCode("createClaimableBalanceNoTrust", -3);
  static readonly createClaimableBalanceNotAuthorized =
    new CreateClaimableBalanceResultCode(
      "createClaimableBalanceNotAuthorized",
      -4,
    );
  static readonly createClaimableBalanceUnderfunded =
    new CreateClaimableBalanceResultCode(
      "createClaimableBalanceUnderfunded",
      -5,
    );

  private static readonly byValue: Readonly<
    Record<number, CreateClaimableBalanceResultCode>
  > = {
    0: CreateClaimableBalanceResultCode.createClaimableBalanceSuccess,
    "-1": CreateClaimableBalanceResultCode.createClaimableBalanceMalformed,
    "-2": CreateClaimableBalanceResultCode.createClaimableBalanceLowReserve,
    "-3": CreateClaimableBalanceResultCode.createClaimableBalanceNoTrust,
    "-4": CreateClaimableBalanceResultCode.createClaimableBalanceNotAuthorized,
    "-5": CreateClaimableBalanceResultCode.createClaimableBalanceUnderfunded,
  };

  static readonly schema = enumType("CreateClaimableBalanceResultCode", {
    createClaimableBalanceSuccess: 0,
    createClaimableBalanceMalformed: -1,
    createClaimableBalanceLowReserve: -2,
    createClaimableBalanceNoTrust: -3,
    createClaimableBalanceNotAuthorized: -4,
    createClaimableBalanceUnderfunded: -5,
  });

  static fromValue(value: number): CreateClaimableBalanceResultCode {
    return enumLookup(
      "CreateClaimableBalanceResultCode",
      CreateClaimableBalanceResultCode.byValue,
      value,
    ) as CreateClaimableBalanceResultCode;
  }

  static fromName(
    name: CreateClaimableBalanceResultCodeName,
  ): CreateClaimableBalanceResultCode {
    switch (name) {
      case "createClaimableBalanceSuccess":
        return CreateClaimableBalanceResultCode.createClaimableBalanceSuccess;
      case "createClaimableBalanceMalformed":
        return CreateClaimableBalanceResultCode.createClaimableBalanceMalformed;
      case "createClaimableBalanceLowReserve":
        return CreateClaimableBalanceResultCode.createClaimableBalanceLowReserve;
      case "createClaimableBalanceNoTrust":
        return CreateClaimableBalanceResultCode.createClaimableBalanceNoTrust;
      case "createClaimableBalanceNotAuthorized":
        return CreateClaimableBalanceResultCode.createClaimableBalanceNotAuthorized;
      case "createClaimableBalanceUnderfunded":
        return CreateClaimableBalanceResultCode.createClaimableBalanceUnderfunded;
      default:
        throw new XdrError(
          `CreateClaimableBalanceResultCode: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): CreateClaimableBalanceResultCode {
    return CreateClaimableBalanceResultCode.fromValue(wire);
  }
}
