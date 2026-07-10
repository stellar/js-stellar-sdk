import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("ScAddressType", {
      scAddressTypeAccount: 0,
      scAddressTypeContract: 1,
      scAddressTypeMuxedAccount: 2,
      scAddressTypeClaimableBalance: 3,
      scAddressTypeLiquidityPool: 4,
    }),
    "scAddressType",
  );

  static fromValue(value: number): ScAddressType {
    return enumFromValue(
      "ScAddressType",
      ScAddressType.schema,
      ScAddressType,
      value,
    );
  }

  static fromName(name: ScAddressTypeName): ScAddressType {
    return enumFromName("ScAddressType", ScAddressType, name);
  }

  static fromXdrObject(wire: number): ScAddressType {
    return ScAddressType.fromValue(wire);
  }
}
