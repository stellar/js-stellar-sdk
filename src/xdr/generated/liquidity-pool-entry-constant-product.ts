import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  LiquidityPoolConstantProductParameters,
  type LiquidityPoolConstantProductParametersWire,
} from "./liquidity-pool-constant-product-parameters.js";

export interface LiquidityPoolEntryConstantProductWire {
  params: LiquidityPoolConstantProductParametersWire;
  reserveA: bigint;
  reserveB: bigint;
  totalPoolShares: bigint;
  poolSharesTrustLineCount: bigint;
}

/**
 * ```xdr
 * struct
 *         {
 *             LiquidityPoolConstantProductParameters params;
 *
 *             int64 reserveA;        // amount of A in the pool
 *             int64 reserveB;        // amount of B in the pool
 *             int64 totalPoolShares; // total number of pool shares issued
 *             int64 poolSharesTrustLineCount; // number of trust lines for the
 *                                             // associated pool shares
 *         }
 * ```
 */
export class LiquidityPoolEntryConstantProduct extends XdrValue {
  readonly params: LiquidityPoolConstantProductParameters;
  readonly reserveA: bigint;
  readonly reserveB: bigint;
  readonly totalPoolShares: bigint;
  readonly poolSharesTrustLineCount: bigint;

  static readonly schema: XdrType<LiquidityPoolEntryConstantProductWire> =
    struct("LiquidityPoolEntryConstantProduct", {
      params: LiquidityPoolConstantProductParameters.schema,
      reserveA: int64(),
      reserveB: int64(),
      totalPoolShares: int64(),
      poolSharesTrustLineCount: int64(),
    });

  constructor(input: {
    params: LiquidityPoolConstantProductParameters;
    reserveA: bigint;
    reserveB: bigint;
    totalPoolShares: bigint;
    poolSharesTrustLineCount: bigint;
  }) {
    super();
    this.params = input.params;
    this.reserveA = input.reserveA;
    this.reserveB = input.reserveB;
    this.totalPoolShares = input.totalPoolShares;
    this.poolSharesTrustLineCount = input.poolSharesTrustLineCount;
  }

  toXdrObject(): LiquidityPoolEntryConstantProductWire {
    return {
      params: this.params.toXdrObject(),
      reserveA: this.reserveA,
      reserveB: this.reserveB,
      totalPoolShares: this.totalPoolShares,
      poolSharesTrustLineCount: this.poolSharesTrustLineCount,
    };
  }

  static fromXdrObject(
    wire: LiquidityPoolEntryConstantProductWire,
  ): LiquidityPoolEntryConstantProduct {
    return new LiquidityPoolEntryConstantProduct({
      params: LiquidityPoolConstantProductParameters.fromXdrObject(wire.params),
      reserveA: wire.reserveA,
      reserveB: wire.reserveB,
      totalPoolShares: wire.totalPoolShares,
      poolSharesTrustLineCount: wire.poolSharesTrustLineCount,
    });
  }
}
