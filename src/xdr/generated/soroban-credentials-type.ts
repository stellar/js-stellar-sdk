import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, SorobanCredentialsType>
  > = {
    0: SorobanCredentialsType.sorobanCredentialsSourceAccount,
    1: SorobanCredentialsType.sorobanCredentialsAddress,
  };

  static readonly schema = enumType("SorobanCredentialsType", {
    sorobanCredentialsSourceAccount: 0,
    sorobanCredentialsAddress: 1,
  });

  static fromValue(value: number): SorobanCredentialsType {
    return enumLookup(
      "SorobanCredentialsType",
      SorobanCredentialsType.byValue,
      value,
    ) as SorobanCredentialsType;
  }

  static fromName(name: SorobanCredentialsTypeName): SorobanCredentialsType {
    switch (name) {
      case "sorobanCredentialsSourceAccount":
        return SorobanCredentialsType.sorobanCredentialsSourceAccount;
      case "sorobanCredentialsAddress":
        return SorobanCredentialsType.sorobanCredentialsAddress;
      default:
        throw new XdrError(`SorobanCredentialsType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): SorobanCredentialsType {
    return SorobanCredentialsType.fromValue(wire);
  }
}
