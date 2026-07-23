/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { LiquidityPoolType } from "./liquidity-pool-type.js";
import {
  LiquidityPoolConstantProductParameters,
  type LiquidityPoolConstantProductParametersWire,
} from "./liquidity-pool-constant-product-parameters.js";

export type LiquidityPoolParametersWire = {
  type: 0;
  constantProduct: LiquidityPoolConstantProductParametersWire;
};

export type LiquidityPoolParametersVariantName = "liquidityPoolConstantProduct";

/**
 * ```xdr
 * union LiquidityPoolParameters switch (LiquidityPoolType type)
 * {
 * case LIQUIDITY_POOL_CONSTANT_PRODUCT:
 *     LiquidityPoolConstantProductParameters constantProduct;
 * };
 * ```
 */
abstract class LiquidityPoolParametersBase extends XdrValue {
  abstract readonly type: LiquidityPoolParametersVariantName;

  static readonly schema: XdrType<LiquidityPoolParametersWire> = union(
    "LiquidityPoolParameters",
    {
      switchOn: LiquidityPoolType.schema,
      cases: [
        case_(
          "liquidityPoolConstantProduct",
          0,
          field(
            "constantProduct",
            LiquidityPoolConstantProductParameters.schema,
          ),
        ),
      ],
    },
  );

  static liquidityPoolConstantProduct(
    constantProduct: LiquidityPoolConstantProductParameters,
  ): LiquidityPoolParametersLiquidityPoolConstantProduct {
    return new LiquidityPoolParametersLiquidityPoolConstantProduct(
      constantProduct,
    );
  }

  static fromXdrObject(
    wire: LiquidityPoolParametersWire,
  ): LiquidityPoolParameters {
    switch (wire.type) {
      case 0:
        return new LiquidityPoolParametersLiquidityPoolConstantProduct(
          LiquidityPoolConstantProductParameters.fromXdrObject(
            wire.constantProduct,
          ),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LiquidityPoolParameters variant.
   * Use this instead of `instanceof LiquidityPoolParameters`: the exported `LiquidityPoolParameters` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LiquidityPoolParameters.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LiquidityPoolParameters {
    return value instanceof LiquidityPoolParametersBase;
  }

  abstract toXdrObject(): LiquidityPoolParametersWire;
}

export class LiquidityPoolParametersLiquidityPoolConstantProduct extends LiquidityPoolParametersBase {
  readonly type = "liquidityPoolConstantProduct" as const;
  readonly constantProduct: LiquidityPoolConstantProductParameters;

  constructor(constantProduct: LiquidityPoolConstantProductParameters) {
    super();
    this.constantProduct = constantProduct;
  }

  get value(): LiquidityPoolConstantProductParameters {
    return this.constantProduct;
  }

  toXdrObject(): Extract<LiquidityPoolParametersWire, { type: 0 }> {
    return { type: 0, constantProduct: this.constantProduct.toXdrObject() };
  }
}

export type LiquidityPoolParameters =
  LiquidityPoolParametersLiquidityPoolConstantProduct;
export const LiquidityPoolParameters = LiquidityPoolParametersBase;
