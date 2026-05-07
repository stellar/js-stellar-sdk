import xdr from "../xdr.js";
import { Asset } from "../asset.js";
import { LiquidityPoolAsset } from "../liquidity_pool_asset.js";
import {
  ChangeTrustResult,
  ChangeTrustOpts,
  OperationAttributes,
} from "./types.js";
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
export function changeTrust(
  opts: ChangeTrustOpts,
): xdr.Operation<ChangeTrustResult> {
  // Accept `line` as an alias for `asset` so that the output of
  // fromXDRObject (which uses `line`) can round-trip back through here.
  const asset =
    opts.asset ??
    (opts as unknown as { line?: Asset | LiquidityPoolAsset }).line;
  let line: xdr.ChangeTrustAsset;

  if (asset instanceof Asset) {
    line = asset.toChangeTrustXDRObject();
  } else if (asset instanceof LiquidityPoolAsset) {
    line = asset.toXDRObject();
  } else {
    throw new TypeError("asset must be Asset or LiquidityPoolAsset");
  }

  if (opts.limit !== undefined && !isValidAmount(opts.limit, true)) {
    throw new TypeError(constructAmountRequirementsError("limit"));
  }

  const limit: xdr.Int64 = opts.limit
    ? toXDRAmount(opts.limit)
    : xdr.Int64.fromString(MAX_INT64);

  const changeTrustOp = new xdr.ChangeTrustOp({ line, limit });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.changeTrust(changeTrustOp),
  };

  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
