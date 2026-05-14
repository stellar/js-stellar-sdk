import { setSourceAccount } from "../util/operations.js";
import { Operation, OperationBody } from "../generated/index.js";
import {
  EndSponsoringFutureReservesOpts,
  OperationAttributes,
} from "./types.js";

/**
 * Create an "end sponsoring future reserves" operation.
 * @param opts - Options object
 * @param opts.source - The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * const op = Operation.endSponsoringFutureReserves();
 *
 */
export function endSponsoringFutureReserves(
  opts: EndSponsoringFutureReservesOpts = {},
): Operation {
  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.endSponsoringFutureReserves(),
  };
  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
