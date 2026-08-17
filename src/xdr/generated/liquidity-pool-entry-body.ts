/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
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

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === LiquidityPoolEntryBodyBase) {
      throw new TypeError(
        "new xdr.LiquidityPoolEntryBody(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.LiquidityPoolEntryBody.liquidityPoolConstantProduct(...) " +
          "(or another arm factory) instead.",
      );
    }
  }

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
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `LiquidityPoolEntryBody: unknown type ${(wire as { type: unknown }).type}`,
    );
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
