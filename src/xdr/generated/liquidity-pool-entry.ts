import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PoolId, type PoolIdWire } from "./pool-id.js";
import {
  LiquidityPoolEntryBody,
  type LiquidityPoolEntryBodyWire,
} from "./liquidity-pool-entry-body.js";

export interface LiquidityPoolEntryWire {
  liquidityPoolId: PoolIdWire;
  body: LiquidityPoolEntryBodyWire;
}

/**
 * ```xdr
 * struct LiquidityPoolEntry
 * {
 *     PoolID liquidityPoolID;
 *
 *     union switch (LiquidityPoolType type)
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
 *     body;
 * };
 * ```
 */
export class LiquidityPoolEntry extends XdrValue {
  readonly liquidityPoolId: PoolId;
  readonly body: LiquidityPoolEntryBody;

  static readonly schema: XdrType<LiquidityPoolEntryWire> = struct(
    "LiquidityPoolEntry",
    {
      liquidityPoolId: PoolId.schema,
      body: LiquidityPoolEntryBody.schema,
    },
  );

  constructor(input: {
    liquidityPoolId: PoolId;
    body: LiquidityPoolEntryBody;
  }) {
    super();
    this.liquidityPoolId = input.liquidityPoolId;
    this.body = input.body;
  }

  toXdrObject(): LiquidityPoolEntryWire {
    return {
      liquidityPoolId: this.liquidityPoolId.toXdrObject(),
      body: this.body.toXdrObject(),
    };
  }

  static fromXdrObject(wire: LiquidityPoolEntryWire): LiquidityPoolEntry {
    return new LiquidityPoolEntry({
      liquidityPoolId: PoolId.fromXdrObject(wire.liquidityPoolId),
      body: LiquidityPoolEntryBody.fromXdrObject(wire.body),
    });
  }
}
