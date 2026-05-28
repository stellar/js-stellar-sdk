import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type LedgerHeaderFlagsWire = number;

export type LedgerHeaderFlagsName =
  | "disableLiquidityPoolTradingFlag"
  | "disableLiquidityPoolDepositFlag"
  | "disableLiquidityPoolWithdrawalFlag";

/**
 * ```xdr
 * enum LedgerHeaderFlags
 * {
 *     DISABLE_LIQUIDITY_POOL_TRADING_FLAG = 0x1,
 *     DISABLE_LIQUIDITY_POOL_DEPOSIT_FLAG = 0x2,
 *     DISABLE_LIQUIDITY_POOL_WITHDRAWAL_FLAG = 0x4
 * };
 * ```
 */
export class LedgerHeaderFlags extends EnumValue<LedgerHeaderFlagsName> {
  static readonly disableLiquidityPoolTradingFlag = new LedgerHeaderFlags(
    "disableLiquidityPoolTradingFlag",
    1,
  );
  static readonly disableLiquidityPoolDepositFlag = new LedgerHeaderFlags(
    "disableLiquidityPoolDepositFlag",
    2,
  );
  static readonly disableLiquidityPoolWithdrawalFlag = new LedgerHeaderFlags(
    "disableLiquidityPoolWithdrawalFlag",
    4,
  );

  static readonly schema = enumType("LedgerHeaderFlags", {
    disableLiquidityPoolTradingFlag: 1,
    disableLiquidityPoolDepositFlag: 2,
    disableLiquidityPoolWithdrawalFlag: 4,
  });

  static fromValue(value: number): LedgerHeaderFlags {
    return enumFromValue(
      "LedgerHeaderFlags",
      LedgerHeaderFlags.schema,
      LedgerHeaderFlags,
      value,
    );
  }

  static fromName(name: LedgerHeaderFlagsName): LedgerHeaderFlags {
    return enumFromName("LedgerHeaderFlags", LedgerHeaderFlags, name);
  }

  static fromXdrObject(wire: number): LedgerHeaderFlags {
    return LedgerHeaderFlags.fromValue(wire);
  }
}
