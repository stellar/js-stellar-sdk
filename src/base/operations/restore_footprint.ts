import { setSourceAccount } from "../util/operations.js";
import {
  ExtensionPoint,
  Operation,
  OperationBody,
  RestoreFootprintOp,
} from "../../xdr/index.js";
import { OperationAttributes, RestoreFootprintOpts } from "./types.js";

/**
 * Builds an operation to restore the archived ledger entries specified
 * by the ledger keys.
 *
 * The ledger keys to restore are specified separately from the operation
 * in read-write footprint of the transaction.
 *
 * It takes no parameters because the relevant footprint is derived from the
 * transaction itself. See {@link TransactionBuilder}'s `opts.sorobanData`
 * parameter (or {@link TransactionBuilder.setSorobanData} /
 * {@link TransactionBuilder.setLedgerKeys}), which is a
 * {@link xdr.SorobanTransactionData} instance that contains fee data & resource
 * usage as part of {@link xdr.SorobanTransactionData}.
 *
 *
 * @param opts - an optional set of parameters
 * @param opts.source - an optional source account
 */
export function restoreFootprint(opts: RestoreFootprintOpts = {}): Operation {
  const op = new RestoreFootprintOp({
    ext: ExtensionPoint.v0(),
  });
  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.restoreFootprint(op),
  };
  setSourceAccount(opAttributes, opts);
  return new Operation(opAttributes);
}
