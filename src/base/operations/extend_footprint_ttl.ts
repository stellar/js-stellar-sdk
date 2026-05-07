import { setSourceAccount } from "../util/operations.js";
import xdr from "../xdr.js";
import {
  ExtendFootprintTTLResult,
  ExtendFootprintTtlOpts,
  OperationAttributes,
} from "./types.js";

/**
 * Builds an operation to bump the time-to-live (TTL) of the ledger keys. The
 * keys for extension have to be provided in the read-only footprint of
 * the transaction.
 *
 * The only parameter of the operation itself is the new minimum TTL for
 * all the provided entries. If an entry already has a higher TTL, then it
 * will just be skipped.
 *
 * TTL is the number of ledgers from the current ledger (exclusive) until
 * the last ledger the entry is still considered alive (inclusive). Thus
 * the exact ledger until the entries will live will only be determined
 * when transaction has been applied.
 *
 * The footprint has to be specified in the transaction. See
 * {@link TransactionBuilder}'s `opts.sorobanData` parameter, which is a
 * {@link xdr.SorobanTransactionData} instance that contains fee data & resource
 * usage as part of {@link xdr.SorobanResources}.
 *
 *
 * @param opts - object holding operation parameters
 * @param opts.extendTo - the minimum TTL that all the entries in
 *    the read-only footprint will have
 * @param opts.source - an optional source account
 */
export function extendFootprintTtl(
  opts: ExtendFootprintTtlOpts,
): xdr.Operation<ExtendFootprintTTLResult> {
  if ((opts.extendTo ?? -1) <= 0) {
    throw new RangeError("extendTo has to be positive");
  }

  const extendFootprintOp = new xdr.ExtendFootprintTtlOp({
    ext: new xdr.ExtensionPoint(0),
    extendTo: opts.extendTo,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.extendFootprintTtl(extendFootprintOp),
  };
  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
