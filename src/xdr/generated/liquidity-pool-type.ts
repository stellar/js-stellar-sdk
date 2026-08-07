import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type LiquidityPoolTypeWire = number;

export type LiquidityPoolTypeName = "liquidityPoolConstantProduct";

/**
 * ```xdr
 * enum LiquidityPoolType
 * {
 *     LIQUIDITY_POOL_CONSTANT_PRODUCT = 0
 * };
 * ```
 */
export class LiquidityPoolType extends EnumValue<LiquidityPoolTypeName> {
  static readonly liquidityPoolConstantProduct = new LiquidityPoolType(
    "liquidityPoolConstantProduct",
    0,
  );

  static readonly schema = enumType("LiquidityPoolType", {
    liquidityPoolConstantProduct: 0,
  });

  static fromValue(value: number): LiquidityPoolType {
    return enumFromValue(
      "LiquidityPoolType",
      LiquidityPoolType.schema,
      LiquidityPoolType,
      value,
    );
  }

  static fromName(name: LiquidityPoolTypeName): LiquidityPoolType {
    return enumFromName("LiquidityPoolType", LiquidityPoolType, name);
  }

  static fromXdrObject(wire: number): LiquidityPoolType {
    return LiquidityPoolType.fromValue(wire);
  }
}
