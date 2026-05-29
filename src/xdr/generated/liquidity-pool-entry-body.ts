/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { LiquidityPoolType } from "./liquidity-pool-type.js";
import {
  LiquidityPoolEntryConstantProduct,
  type LiquidityPoolEntryConstantProductWire,
} from "./liquidity-pool-entry-constant-product.js";

export type LiquidityPoolEntryBodyWire = {
  type: 0;
  constantProduct: LiquidityPoolEntryConstantProductWire;
};

export type LiquidityPoolEntryBodyVariantName = "liquidityPoolConstantProduct";

/**
 * ```xdr
 * union switch (LiquidityPoolType type)
 *     {
 *     case LIQUIDITY_POOL_CONSTANT_PRODUCT:
 *         struct
 *         {
 *             LiquidityPoolConstantProductParameters params;
 *
 *             int64 reserveA;        // amount of A in the pool
 *             int64 reserveB;        // amount of B in the pool
 *             int64 totalPoolShares; // total number of pool shares issued
 *             int64 poolSharesTrustLineCount; // number of trust lines for the
 *                                             // associated pool shares
 *         } constantProduct;
 *     }
 * ```
 */
abstract class LiquidityPoolEntryBodyBase extends XdrValue {
  abstract readonly type: LiquidityPoolEntryBodyVariantName;

  static readonly schema: XdrType<LiquidityPoolEntryBodyWire> = union(
    "LiquidityPoolEntryBody",
    {
      switchOn: LiquidityPoolType.schema,
      cases: [
        case_(
          "liquidityPoolConstantProduct",
          0,
          field("constantProduct", LiquidityPoolEntryConstantProduct.schema),
        ),
      ],
    },
  );

  static liquidityPoolConstantProduct(
    constantProduct: LiquidityPoolEntryConstantProduct,
  ): LiquidityPoolEntryBodyLiquidityPoolConstantProduct {
    return new LiquidityPoolEntryBodyLiquidityPoolConstantProduct(
      constantProduct,
    );
  }

  static fromXdrObject(
    wire: LiquidityPoolEntryBodyWire,
  ): LiquidityPoolEntryBody {
    switch (wire.type) {
      case 0:
        return new LiquidityPoolEntryBodyLiquidityPoolConstantProduct(
          LiquidityPoolEntryConstantProduct.fromXdrObject(wire.constantProduct),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LiquidityPoolEntryBody variant.
   * Use this instead of `instanceof LiquidityPoolEntryBody`: the exported `LiquidityPoolEntryBody` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LiquidityPoolEntryBody.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LiquidityPoolEntryBody {
    return value instanceof LiquidityPoolEntryBodyBase;
  }

  abstract toXdrObject(): LiquidityPoolEntryBodyWire;
}

export class LiquidityPoolEntryBodyLiquidityPoolConstantProduct extends LiquidityPoolEntryBodyBase {
  readonly type = "liquidityPoolConstantProduct" as const;
  readonly constantProduct: LiquidityPoolEntryConstantProduct;

  constructor(constantProduct: LiquidityPoolEntryConstantProduct) {
    super();
    this.constantProduct = constantProduct;
  }

  get value(): LiquidityPoolEntryConstantProduct {
    return this.constantProduct;
  }

  toXdrObject(): Extract<LiquidityPoolEntryBodyWire, { type: 0 }> {
    return { type: 0, constantProduct: this.constantProduct.toXdrObject() };
  }
}

export type LiquidityPoolEntryBody =
  LiquidityPoolEntryBodyLiquidityPoolConstantProduct;
export const LiquidityPoolEntryBody = LiquidityPoolEntryBodyBase;
