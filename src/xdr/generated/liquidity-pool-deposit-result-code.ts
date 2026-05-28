import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type LiquidityPoolDepositResultCodeWire = number;

export type LiquidityPoolDepositResultCodeName =
  | "liquidityPoolDepositSuccess"
  | "liquidityPoolDepositMalformed"
  | "liquidityPoolDepositNoTrust"
  | "liquidityPoolDepositNotAuthorized"
  | "liquidityPoolDepositUnderfunded"
  | "liquidityPoolDepositLineFull"
  | "liquidityPoolDepositBadPrice"
  | "liquidityPoolDepositPoolFull"
  | "liquidityPoolDepositTrustlineFrozen";

/**
 * ```xdr
 * enum LiquidityPoolDepositResultCode
 * {
 *     // codes considered as "success" for the operation
 *     LIQUIDITY_POOL_DEPOSIT_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     LIQUIDITY_POOL_DEPOSIT_MALFORMED = -1,      // bad input
 *     LIQUIDITY_POOL_DEPOSIT_NO_TRUST = -2,       // no trust line for one of the
 *                                                 // assets
 *     LIQUIDITY_POOL_DEPOSIT_NOT_AUTHORIZED = -3, // not authorized for one of the
 *                                                 // assets
 *     LIQUIDITY_POOL_DEPOSIT_UNDERFUNDED = -4,    // not enough balance for one of
 *                                                 // the assets
 *     LIQUIDITY_POOL_DEPOSIT_LINE_FULL = -5,      // pool share trust line doesn't
 *                                                 // have sufficient limit
 *     LIQUIDITY_POOL_DEPOSIT_BAD_PRICE = -6,      // deposit price outside bounds
 *     LIQUIDITY_POOL_DEPOSIT_POOL_FULL = -7,      // pool reserves are full
 *     LIQUIDITY_POOL_DEPOSIT_TRUSTLINE_FROZEN = -8  // trustline for one of the
 *                                                   // assets is frozen
 * };
 * ```
 */
export class LiquidityPoolDepositResultCode extends EnumValue<LiquidityPoolDepositResultCodeName> {
  static readonly liquidityPoolDepositSuccess =
    new LiquidityPoolDepositResultCode("liquidityPoolDepositSuccess", 0);
  static readonly liquidityPoolDepositMalformed =
    new LiquidityPoolDepositResultCode("liquidityPoolDepositMalformed", -1);
  static readonly liquidityPoolDepositNoTrust =
    new LiquidityPoolDepositResultCode("liquidityPoolDepositNoTrust", -2);
  static readonly liquidityPoolDepositNotAuthorized =
    new LiquidityPoolDepositResultCode("liquidityPoolDepositNotAuthorized", -3);
  static readonly liquidityPoolDepositUnderfunded =
    new LiquidityPoolDepositResultCode("liquidityPoolDepositUnderfunded", -4);
  static readonly liquidityPoolDepositLineFull =
    new LiquidityPoolDepositResultCode("liquidityPoolDepositLineFull", -5);
  static readonly liquidityPoolDepositBadPrice =
    new LiquidityPoolDepositResultCode("liquidityPoolDepositBadPrice", -6);
  static readonly liquidityPoolDepositPoolFull =
    new LiquidityPoolDepositResultCode("liquidityPoolDepositPoolFull", -7);
  static readonly liquidityPoolDepositTrustlineFrozen =
    new LiquidityPoolDepositResultCode(
      "liquidityPoolDepositTrustlineFrozen",
      -8,
    );

  static readonly schema = enumType("LiquidityPoolDepositResultCode", {
    liquidityPoolDepositSuccess: 0,
    liquidityPoolDepositMalformed: -1,
    liquidityPoolDepositNoTrust: -2,
    liquidityPoolDepositNotAuthorized: -3,
    liquidityPoolDepositUnderfunded: -4,
    liquidityPoolDepositLineFull: -5,
    liquidityPoolDepositBadPrice: -6,
    liquidityPoolDepositPoolFull: -7,
    liquidityPoolDepositTrustlineFrozen: -8,
  });

  static fromValue(value: number): LiquidityPoolDepositResultCode {
    return enumFromValue(
      "LiquidityPoolDepositResultCode",
      LiquidityPoolDepositResultCode.schema,
      LiquidityPoolDepositResultCode,
      value,
    );
  }

  static fromName(
    name: LiquidityPoolDepositResultCodeName,
  ): LiquidityPoolDepositResultCode {
    return enumFromName(
      "LiquidityPoolDepositResultCode",
      LiquidityPoolDepositResultCode,
      name,
    );
  }

  static fromXdrObject(wire: number): LiquidityPoolDepositResultCode {
    return LiquidityPoolDepositResultCode.fromValue(wire);
  }
}
