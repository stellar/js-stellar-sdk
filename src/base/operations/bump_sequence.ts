import BigNumber from "../util/bignumber.js";
import { setSourceAccount } from "../util/operations.js";
import { Int64, Operation, OperationBody } from "../generated/index.js";
import { BumpSequenceOpts, OperationAttributes } from "./types.js";

/**
 * This operation bumps sequence number.
 * @param opts - Options object
 * @param opts.bumpTo - Sequence number to bump to.
 * @param opts.source - The optional source account.
 */
export function bumpSequence(opts: BumpSequenceOpts): Operation {
  if (typeof opts.bumpTo !== "string") {
    throw new Error("bumpTo must be a string");
  }

  try {
    new BigNumber(opts.bumpTo);
  } catch {
    throw new Error("bumpTo must be a stringified number");
  }

  const bumpTo: Int64 = BigInt(opts.bumpTo);

  const bumpSequenceOp = { bumpTo };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.bumpSequence(bumpSequenceOp),
  };

  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
