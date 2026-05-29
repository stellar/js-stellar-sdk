import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PoolId, type PoolIdWire } from "./pool-id.js";
import { Price, type PriceWire } from "./price.js";

export interface LiquidityPoolDepositOpWire {
  liquidityPoolId: PoolIdWire;
  maxAmountA: bigint;
  maxAmountB: bigint;
  minPrice: PriceWire;
  maxPrice: PriceWire;
}

/**
 * ```xdr
 * struct LiquidityPoolDepositOp
 * {
 *     PoolID liquidityPoolID;
 *     int64 maxAmountA; // maximum amount of first asset to deposit
 *     int64 maxAmountB; // maximum amount of second asset to deposit
 *     Price minPrice;   // minimum depositA/depositB
 *     Price maxPrice;   // maximum depositA/depositB
 * };
 * ```
 */
export class LiquidityPoolDepositOp extends XdrValue {
  readonly liquidityPoolId: PoolId;
  readonly maxAmountA: bigint;
  readonly maxAmountB: bigint;
  readonly minPrice: Price;
  readonly maxPrice: Price;

  static readonly schema: XdrType<LiquidityPoolDepositOpWire> = struct(
    "LiquidityPoolDepositOp",
    {
      liquidityPoolId: PoolId.schema,
      maxAmountA: int64(),
      maxAmountB: int64(),
      minPrice: Price.schema,
      maxPrice: Price.schema,
    },
  );

  constructor(input: {
    liquidityPoolId: PoolId;
    maxAmountA: bigint;
    maxAmountB: bigint;
    minPrice: Price;
    maxPrice: Price;
  }) {
    super();
    this.liquidityPoolId = input.liquidityPoolId;
    this.maxAmountA = input.maxAmountA;
    this.maxAmountB = input.maxAmountB;
    this.minPrice = input.minPrice;
    this.maxPrice = input.maxPrice;
  }

  toXdrObject(): LiquidityPoolDepositOpWire {
    return {
      liquidityPoolId: this.liquidityPoolId.toXdrObject(),
      maxAmountA: this.maxAmountA,
      maxAmountB: this.maxAmountB,
      minPrice: this.minPrice.toXdrObject(),
      maxPrice: this.maxPrice.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: LiquidityPoolDepositOpWire,
  ): LiquidityPoolDepositOp {
    return new LiquidityPoolDepositOp({
      liquidityPoolId: PoolId.fromXdrObject(wire.liquidityPoolId),
      maxAmountA: wire.maxAmountA,
      maxAmountB: wire.maxAmountB,
      minPrice: Price.fromXdrObject(wire.minPrice),
      maxPrice: Price.fromXdrObject(wire.maxPrice),
    });
  }
}
