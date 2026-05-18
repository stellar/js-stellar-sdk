import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ScAddressTypeWire = number;

export type ScAddressTypeName =
  | "scAddressTypeAccount"
  | "scAddressTypeContract"
  | "scAddressTypeMuxedAccount"
  | "scAddressTypeClaimableBalance"
  | "scAddressTypeLiquidityPool";

/**
 * ```xdr
 * enum SCAddressType
 * {
 *     SC_ADDRESS_TYPE_ACCOUNT = 0,
 *     SC_ADDRESS_TYPE_CONTRACT = 1,
 *     SC_ADDRESS_TYPE_MUXED_ACCOUNT = 2,
 *     SC_ADDRESS_TYPE_CLAIMABLE_BALANCE = 3,
 *     SC_ADDRESS_TYPE_LIQUIDITY_POOL = 4
 * };
 * ```
 */
export class ScAddressType extends EnumValue<ScAddressTypeName> {
  static readonly scAddressTypeAccount = new ScAddressType(
    "scAddressTypeAccount",
    0,
  );
  static readonly scAddressTypeContract = new ScAddressType(
    "scAddressTypeContract",
    1,
  );
  static readonly scAddressTypeMuxedAccount = new ScAddressType(
    "scAddressTypeMuxedAccount",
    2,
  );
  static readonly scAddressTypeClaimableBalance = new ScAddressType(
    "scAddressTypeClaimableBalance",
    3,
  );
  static readonly scAddressTypeLiquidityPool = new ScAddressType(
    "scAddressTypeLiquidityPool",
    4,
  );

  private static readonly byValue: Readonly<Record<number, ScAddressType>> = {
    0: ScAddressType.scAddressTypeAccount,
    1: ScAddressType.scAddressTypeContract,
    2: ScAddressType.scAddressTypeMuxedAccount,
    3: ScAddressType.scAddressTypeClaimableBalance,
    4: ScAddressType.scAddressTypeLiquidityPool,
  };

  static readonly schema = enumType("ScAddressType", {
    scAddressTypeAccount: 0,
    scAddressTypeContract: 1,
    scAddressTypeMuxedAccount: 2,
    scAddressTypeClaimableBalance: 3,
    scAddressTypeLiquidityPool: 4,
  });

  static fromValue(value: number): ScAddressType {
    return enumLookup(
      "ScAddressType",
      ScAddressType.byValue,
      value,
    ) as ScAddressType;
  }

  static fromName(name: ScAddressTypeName): ScAddressType {
    switch (name) {
      case "scAddressTypeAccount":
        return ScAddressType.scAddressTypeAccount;
      case "scAddressTypeContract":
        return ScAddressType.scAddressTypeContract;
      case "scAddressTypeMuxedAccount":
        return ScAddressType.scAddressTypeMuxedAccount;
      case "scAddressTypeClaimableBalance":
        return ScAddressType.scAddressTypeClaimableBalance;
      case "scAddressTypeLiquidityPool":
        return ScAddressType.scAddressTypeLiquidityPool;
      default:
        throw new XdrError(`ScAddressType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScAddressType {
    return ScAddressType.fromValue(wire);
  }
}
