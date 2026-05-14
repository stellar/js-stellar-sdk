import {
  ChangeTrustAsset,
  ChangeTrustOp,
  Int64,
  Operation,
  OperationBody,
} from "../generated/index.js";
import { Asset } from "../asset.js";
import { LiquidityPoolAsset } from "../liquidity_pool_asset.js";
import { ChangeTrustOpts, OperationAttributes } from "./types.js";
import {
  constructAmountRequirementsError,
  isValidAmount,
  setSourceAccount,
  toXDRAmount,
} from "../util/operations.js";

const MAX_INT64 = "9223372036854775807";

/**
 * A "change trust" operation adds, removes, or updates a trust line for a
 * given asset from the source account to another.
 *
 * @param opts - Options object
 * @param opts.asset - The asset for the trust line.
 * @param opts.limit - The limit for the asset, defaults to max int64.
 *                     If the limit is set to "0" it deletes the trustline.
 * @param opts.source - The source account (defaults to transaction source).
 */
export function changeTrust(opts: ChangeTrustOpts): Operation {
  // Accept `line` as an alias for `asset` so that the output of
  // fromXDRObject (which uses `line`) can round-trip back through here.
  const asset =
    opts.asset ??
    (opts as unknown as { line?: Asset | LiquidityPoolAsset }).line;
  let line: ChangeTrustAsset;

  if (asset instanceof Asset) {
    line = asset.toWireChangeTrustXDRObject();
  } else if (asset instanceof LiquidityPoolAsset) {
    line = asset.toXDRObject();
  } else {
    throw new TypeError("asset must be Asset or LiquidityPoolAsset");
  }

  if (opts.limit !== undefined && !isValidAmount(opts.limit, true)) {
    throw new TypeError(constructAmountRequirementsError("limit"));
  }

  const limit: Int64 = opts.limit ? toXDRAmount(opts.limit) : BigInt(MAX_INT64);

  const changeTrustOp: ChangeTrustOp = { line, limit };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.changeTrust(changeTrustOp),
  };

  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
