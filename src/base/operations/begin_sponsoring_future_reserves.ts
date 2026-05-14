import { Operation, OperationBody } from "../generated/index.js";
import { StrKey } from "../strkey.js";
import { Keypair } from "../keypair.js";
import {
  BeginSponsoringFutureReservesOpts,
  OperationAttributes,
} from "./types.js";
import { setSourceAccount } from "../util/operations.js";

/**
 * Create a "begin sponsoring future reserves" operation.
 * @param opts - Options object
 * @param opts.sponsoredId - The sponsored account id.
 * @param opts.source - The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * const op = Operation.beginSponsoringFutureReserves({
 *   sponsoredId: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
 * });
 *
 */
export function beginSponsoringFutureReserves(
  opts: BeginSponsoringFutureReservesOpts,
): Operation {
  if (!StrKey.isValidEd25519PublicKey(opts.sponsoredId)) {
    throw new Error("sponsoredId is invalid");
  }
  const op = {
    sponsoredId: Keypair.fromPublicKey(opts.sponsoredId).xdrAccountId(),
  };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.beginSponsoringFutureReserves(op),
  };
  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
