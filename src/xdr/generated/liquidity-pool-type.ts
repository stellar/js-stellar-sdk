import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, LiquidityPoolType>> =
    {
      0: LiquidityPoolType.liquidityPoolConstantProduct,
    };

  static readonly schema = enumType("LiquidityPoolType", {
    liquidityPoolConstantProduct: 0,
  });

  static fromValue(value: number): LiquidityPoolType {
    return enumLookup(
      "LiquidityPoolType",
      LiquidityPoolType.byValue,
      value,
    ) as LiquidityPoolType;
  }

  static fromName(name: LiquidityPoolTypeName): LiquidityPoolType {
    switch (name) {
      case "liquidityPoolConstantProduct":
        return LiquidityPoolType.liquidityPoolConstantProduct;
      default:
        throw new XdrError(`LiquidityPoolType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): LiquidityPoolType {
    return LiquidityPoolType.fromValue(wire);
  }
}
