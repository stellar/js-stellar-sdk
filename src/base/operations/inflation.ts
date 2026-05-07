import { setSourceAccount } from "../util/operations.js";
import xdr from "../xdr.js";
import {
  InflationOpts,
  InflationResult,
  OperationAttributes,
} from "./types.js";

/**
 * This operation generates the inflation.
 * @param opts - Options object
 * @param opts.source - The optional source account.
 */
export function inflation(
  opts: InflationOpts = {},
): xdr.Operation<InflationResult> {
  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.inflation(),
  };
  setSourceAccount(opAttributes, opts);
  return new xdr.Operation(opAttributes);
}
