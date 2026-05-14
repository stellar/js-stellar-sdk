import {
  isValidAmount,
  constructAmountRequirementsError,
  toXDRAmount,
  toXDRPrice,
  setSourceAccount,
} from "../util/operations.js";
import {
  Int64,
  Operation,
  OperationBody,
  PoolId,
  Price,
} from "../generated/index.js";
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

  // PoolId is typed only as a type alias (Hash = Opaque[]), not a runtime class.
  // Buffer.from produces the correct runtime value; cast to satisfy the type checker.
  const liquidityPoolIdXdr = Buffer.from(
    liquidityPoolId,
    "hex",
  ) as unknown as PoolId;

  if (!isValidAmount(maxAmountA, true)) {
    throw new TypeError(constructAmountRequirementsError("maxAmountA"));
  }
  const maxAmountAXdr: Int64 = toXDRAmount(maxAmountA);

  if (!isValidAmount(maxAmountB, true)) {
    throw new TypeError(constructAmountRequirementsError("maxAmountB"));
  }
  const maxAmountBXdr: Int64 = toXDRAmount(maxAmountB);

  if (minPrice === undefined) {
    throw new TypeError("minPrice argument is required");
  }
  const minPriceXdr: Price = toXDRPrice(minPrice);

  if (maxPrice === undefined) {
    throw new TypeError("maxPrice argument is required");
  }
  const maxPriceXdr: Price = toXDRPrice(maxPrice);

  const liquidityPoolDepositOp = {
    liquidityPoolId: liquidityPoolIdXdr,
    maxAmountA: maxAmountAXdr,
    maxAmountB: maxAmountBXdr,
    minPrice: minPriceXdr,
    maxPrice: maxPriceXdr,
  };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.liquidityPoolDeposit(liquidityPoolDepositOp),
  };

  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
