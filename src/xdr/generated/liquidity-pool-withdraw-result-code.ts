import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type LiquidityPoolWithdrawResultCodeWire = number;

export type LiquidityPoolWithdrawResultCodeName =
  | "liquidityPoolWithdrawSuccess"
  | "liquidityPoolWithdrawMalformed"
  | "liquidityPoolWithdrawNoTrust"
  | "liquidityPoolWithdrawUnderfunded"
  | "liquidityPoolWithdrawLineFull"
  | "liquidityPoolWithdrawUnderMinimum"
  | "liquidityPoolWithdrawTrustlineFrozen";

/**
 * ```xdr
 * enum LiquidityPoolWithdrawResultCode
 * {
 *     // codes considered as "success" for the operation
 *     LIQUIDITY_POOL_WITHDRAW_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     LIQUIDITY_POOL_WITHDRAW_MALFORMED = -1,    // bad input
 *     LIQUIDITY_POOL_WITHDRAW_NO_TRUST = -2,     // no trust line for one of the
 *                                                // assets
 *     LIQUIDITY_POOL_WITHDRAW_UNDERFUNDED = -3,  // not enough balance of the
 *                                                // pool share
 *     LIQUIDITY_POOL_WITHDRAW_LINE_FULL = -4,    // would go above limit for one
 *                                                // of the assets
 *     LIQUIDITY_POOL_WITHDRAW_UNDER_MINIMUM = -5, // didn't withdraw enough
 *     LIQUIDITY_POOL_WITHDRAW_TRUSTLINE_FROZEN = -6  // trustline for one of the
 *                                                    // assets is frozen
 * };
 * ```
 */
export class LiquidityPoolWithdrawResultCode extends EnumValue<LiquidityPoolWithdrawResultCodeName> {
  static readonly liquidityPoolWithdrawSuccess =
    new LiquidityPoolWithdrawResultCode("liquidityPoolWithdrawSuccess", 0);
  static readonly liquidityPoolWithdrawMalformed =
    new LiquidityPoolWithdrawResultCode("liquidityPoolWithdrawMalformed", -1);
  static readonly liquidityPoolWithdrawNoTrust =
    new LiquidityPoolWithdrawResultCode("liquidityPoolWithdrawNoTrust", -2);
  static readonly liquidityPoolWithdrawUnderfunded =
    new LiquidityPoolWithdrawResultCode("liquidityPoolWithdrawUnderfunded", -3);
  static readonly liquidityPoolWithdrawLineFull =
    new LiquidityPoolWithdrawResultCode("liquidityPoolWithdrawLineFull", -4);
  static readonly liquidityPoolWithdrawUnderMinimum =
    new LiquidityPoolWithdrawResultCode(
      "liquidityPoolWithdrawUnderMinimum",
      -5,
    );
  static readonly liquidityPoolWithdrawTrustlineFrozen =
    new LiquidityPoolWithdrawResultCode(
      "liquidityPoolWithdrawTrustlineFrozen",
      -6,
    );

  static readonly schema = withMemberPrefix(
    enumType("LiquidityPoolWithdrawResultCode", {
      liquidityPoolWithdrawSuccess: 0,
      liquidityPoolWithdrawMalformed: -1,
      liquidityPoolWithdrawNoTrust: -2,
      liquidityPoolWithdrawUnderfunded: -3,
      liquidityPoolWithdrawLineFull: -4,
      liquidityPoolWithdrawUnderMinimum: -5,
      liquidityPoolWithdrawTrustlineFrozen: -6,
    }),
    "liquidityPoolWithdraw",
  );

  static fromValue(value: number): LiquidityPoolWithdrawResultCode {
    return enumFromValue(
      "LiquidityPoolWithdrawResultCode",
      LiquidityPoolWithdrawResultCode.schema,
      LiquidityPoolWithdrawResultCode,
      value,
    );
  }

  static fromName(
    name: LiquidityPoolWithdrawResultCodeName,
  ): LiquidityPoolWithdrawResultCode {
    return enumFromName(
      "LiquidityPoolWithdrawResultCode",
      LiquidityPoolWithdrawResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): LiquidityPoolWithdrawResultCode {
    return LiquidityPoolWithdrawResultCode.fromValue(wire);
  }
}
