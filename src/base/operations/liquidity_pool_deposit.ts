import {
  isValidAmount,
  constructAmountRequirementsError,
  toXdrAmount,
  toXdrPrice,
  setSourceAccount,
} from "../util/operations.js";
import {
  Int64,
  LiquidityPoolDepositOp,
  Operation,
  OperationBody,
  PoolId,
  Price,
} from "../../xdr/index.js";
// PoolId is an alias for Hash; we need the runtime class to construct instances.
import { LiquidityPoolDepositOpts, OperationAttributes } from "./types.js";

/**
 * Creates a liquidity pool deposit operation.
 *
 * @see https://developers.stellar.org/docs/start/list-of-operations/#liquidity-pool-deposit
 *
 * @param opts - Options object
 * @param opts.liquidityPoolId - The liquidity pool ID.
 * @param opts.maxAmountA - Maximum amount of first asset to deposit.
 * @param opts.maxAmountB - Maximum amount of second asset to deposit.
 * @param opts.minPrice - Minimum depositA/depositB price.
 * @param opts.minPrice.n - If `opts.minPrice` is an object: the price numerator
 * @param opts.minPrice.d - If `opts.minPrice` is an object: the price denominator
 * @param opts.maxPrice - Maximum depositA/depositB price.
 * @param opts.maxPrice.n - If `opts.maxPrice` is an object: the price numerator
 * @param opts.maxPrice.d - If `opts.maxPrice` is an object: the price denominator
 * @param opts.source - The source account for the operation. Defaults to the transaction's source account.
 */
export function liquidityPoolDeposit(
  opts: LiquidityPoolDepositOpts = {} as LiquidityPoolDepositOpts,
): Operation {
  const { liquidityPoolId, maxAmountA, maxAmountB, minPrice, maxPrice } = opts;

  if (!liquidityPoolId) {
    throw new TypeError("liquidityPoolId argument is required");
  }

  const liquidityPoolIdXdr = new PoolId(Buffer.from(liquidityPoolId, "hex"));

  if (!isValidAmount(maxAmountA, true)) {
    throw new TypeError(constructAmountRequirementsError("maxAmountA"));
  }
  const maxAmountAXdr: Int64 = toXdrAmount(maxAmountA);

  if (!isValidAmount(maxAmountB, true)) {
    throw new TypeError(constructAmountRequirementsError("maxAmountB"));
  }
  const maxAmountBXdr: Int64 = toXdrAmount(maxAmountB);

  if (minPrice === undefined) {
    throw new TypeError("minPrice argument is required");
  }
  const minPriceXdr: Price = toXdrPrice(minPrice);

  if (maxPrice === undefined) {
    throw new TypeError("maxPrice argument is required");
  }
  const maxPriceXdr: Price = toXdrPrice(maxPrice);

  const liquidityPoolDepositOp = new LiquidityPoolDepositOp({
    liquidityPoolId: liquidityPoolIdXdr,
    maxAmountA: maxAmountAXdr,
    maxAmountB: maxAmountBXdr,
    minPrice: minPriceXdr,
    maxPrice: maxPriceXdr,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.liquidityPoolDeposit(liquidityPoolDepositOp),
  };

  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}
