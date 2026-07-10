import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type SorobanCredentialsTypeWire = number;

export type SorobanCredentialsTypeName =
  | "sorobanCredentialsSourceAccount"
  | "sorobanCredentialsAddress"
  | "sorobanCredentialsAddressV2"
  | "sorobanCredentialsAddressWithDelegates";

/**
 * ```xdr
 * enum SorobanCredentialsType
 * {
 *     SOROBAN_CREDENTIALS_SOURCE_ACCOUNT = 0,
 *     SOROBAN_CREDENTIALS_ADDRESS = 1,
 *     SOROBAN_CREDENTIALS_ADDRESS_V2 = 2,
 *     SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES = 3
 * };
 * ```
 */
export class SorobanCredentialsType extends EnumValue<SorobanCredentialsTypeName> {
  static readonly sorobanCredentialsSourceAccount = new SorobanCredentialsType(
    "sorobanCredentialsSourceAccount",
    0,
  );
  static readonly sorobanCredentialsAddress = new SorobanCredentialsType(
    "sorobanCredentialsAddress",
    1,
  );
  static readonly sorobanCredentialsAddressV2 = new SorobanCredentialsType(
    "sorobanCredentialsAddressV2",
    2,
  );
  static readonly sorobanCredentialsAddressWithDelegates =
    new SorobanCredentialsType("sorobanCredentialsAddressWithDelegates", 3);

  static readonly schema = withMemberPrefix(
    enumType("SorobanCredentialsType", {
      sorobanCredentialsSourceAccount: 0,
      sorobanCredentialsAddress: 1,
      sorobanCredentialsAddressV2: 2,
      sorobanCredentialsAddressWithDelegates: 3,
    }),
    "sorobanCredentials",
  );

  static fromValue(value: number): SorobanCredentialsType {
    return enumFromValue(
      "SorobanCredentialsType",
      SorobanCredentialsType.schema,
      SorobanCredentialsType,
      value,
    );
  }

  static fromName(name: SorobanCredentialsTypeName): SorobanCredentialsType {
    return enumFromName("SorobanCredentialsType", SorobanCredentialsType, name);
  }

  static fromXdrObject(wire: number): SorobanCredentialsType {
    return SorobanCredentialsType.fromValue(wire);
  }
}
