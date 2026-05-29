import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type SorobanCredentialsTypeWire = number;

export type SorobanCredentialsTypeName =
  | "sorobanCredentialsSourceAccount"
  | "sorobanCredentialsAddress";

/**
 * ```xdr
 * enum SorobanCredentialsType
 * {
 *     SOROBAN_CREDENTIALS_SOURCE_ACCOUNT = 0,
 *     SOROBAN_CREDENTIALS_ADDRESS = 1
 * #ifdef CAP_0071
 *     ,
 *     SOROBAN_CREDENTIALS_ADDRESS_V2 = 2,
 *     SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES = 3
 * #endif
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

  static readonly schema = enumType("SorobanCredentialsType", {
    sorobanCredentialsSourceAccount: 0,
    sorobanCredentialsAddress: 1,
  });

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
