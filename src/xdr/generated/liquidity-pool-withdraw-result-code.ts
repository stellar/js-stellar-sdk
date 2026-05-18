import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, LiquidityPoolWithdrawResultCode>
  > = {
    0: LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawSuccess,
    "-1": LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawMalformed,
    "-2": LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawNoTrust,
    "-3": LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawUnderfunded,
    "-4": LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawLineFull,
    "-5": LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawUnderMinimum,
    "-6": LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawTrustlineFrozen,
  };

  static readonly schema = enumType("LiquidityPoolWithdrawResultCode", {
    liquidityPoolWithdrawSuccess: 0,
    liquidityPoolWithdrawMalformed: -1,
    liquidityPoolWithdrawNoTrust: -2,
    liquidityPoolWithdrawUnderfunded: -3,
    liquidityPoolWithdrawLineFull: -4,
    liquidityPoolWithdrawUnderMinimum: -5,
    liquidityPoolWithdrawTrustlineFrozen: -6,
  });

  static fromValue(value: number): LiquidityPoolWithdrawResultCode {
    return enumLookup(
      "LiquidityPoolWithdrawResultCode",
      LiquidityPoolWithdrawResultCode.byValue,
      value,
    ) as LiquidityPoolWithdrawResultCode;
  }

  static fromName(
    name: LiquidityPoolWithdrawResultCodeName,
  ): LiquidityPoolWithdrawResultCode {
    switch (name) {
      case "liquidityPoolWithdrawSuccess":
        return LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawSuccess;
      case "liquidityPoolWithdrawMalformed":
        return LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawMalformed;
      case "liquidityPoolWithdrawNoTrust":
        return LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawNoTrust;
      case "liquidityPoolWithdrawUnderfunded":
        return LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawUnderfunded;
      case "liquidityPoolWithdrawLineFull":
        return LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawLineFull;
      case "liquidityPoolWithdrawUnderMinimum":
        return LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawUnderMinimum;
      case "liquidityPoolWithdrawTrustlineFrozen":
        return LiquidityPoolWithdrawResultCode.liquidityPoolWithdrawTrustlineFrozen;
      default:
        throw new XdrError(
          `LiquidityPoolWithdrawResultCode: unknown name ${name}`,
        );
    }
  }

  static fromXdrObject(wire: number): LiquidityPoolWithdrawResultCode {
    return LiquidityPoolWithdrawResultCode.fromValue(wire);
  }
}
