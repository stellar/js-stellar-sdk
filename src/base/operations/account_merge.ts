import xdr from "../xdr.js";
import { decodeAddressToMuxedAccount } from "../util/decode_encode_muxed_account.js";
import {
  AccountMergeOpts,
  AccountMergeResult,
  OperationAttributes,
} from "./types.js";
import { setSourceAccount } from "../util/operations.js";

/**
 * Transfers native balance to destination account.
 *
 * @param opts - options object
 * @param opts.destination - destination to merge the source account into
 * @param opts.source - operation source account (defaults to
 *     transaction source)
 */
export function accountMerge(
  opts: AccountMergeOpts,
): xdr.Operation<AccountMergeResult> {
  let body: xdr.OperationBody;
  try {
    body = xdr.OperationBody.accountMerge(
      decodeAddressToMuxedAccount(opts.destination),
    );
  } catch {
    throw new Error("destination is invalid");
  }

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body,
  };
  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
