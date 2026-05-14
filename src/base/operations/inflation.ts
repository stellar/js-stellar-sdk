import { setSourceAccount } from "../util/operations.js";
import { Operation, OperationBody } from "../generated/index.js";
import { InflationOpts, OperationAttributes } from "./types.js";

/**
 * This operation generates the inflation.
 * @param opts - Options object
 * @param opts.source - The optional source account.
 */
export function inflation(opts: InflationOpts = {}): Operation {
  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.inflation(),
  };
  setSourceAccount(opAttributes, opts);
  return opAttributes;
}
