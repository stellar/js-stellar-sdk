import BigNumber from "../util/bignumber.js";
import { setSourceAccount } from "../util/operations.js";
import xdr from "../xdr.js";
import {
  BumpSequenceResult,
  BumpSequenceOpts,
  OperationAttributes,
} from "./types.js";

/**
 * This operation bumps sequence number.
 * @param opts - Options object
 * @param opts.bumpTo - Sequence number to bump to.
 * @param opts.source - The optional source account.
 */
export function bumpSequence(
  opts: BumpSequenceOpts,
): xdr.Operation<BumpSequenceResult> {
  if (typeof opts.bumpTo !== "string") {
    throw new Error("bumpTo must be a string");
  }

  try {
    new BigNumber(opts.bumpTo);
  } catch (e) {
    throw new Error("bumpTo must be a stringified number");
  }

  const bumpTo: xdr.Int64 = xdr.Int64.fromString(opts.bumpTo);

  const bumpSequenceOp = new xdr.BumpSequenceOp({ bumpTo });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.bumpSequence(bumpSequenceOp),
  };

  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
