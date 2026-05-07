import xdr from "../xdr.js";
import { Keypair } from "../keypair.js";
import { StrKey } from "../strkey.js";
import {
  CreateAccountResult,
  CreateAccountOpts,
  OperationAttributes,
} from "./types.js";
import {
  constructAmountRequirementsError,
  isValidAmount,
  setSourceAccount,
  toXDRAmount,
} from "../util/operations.js";

/**
 * Create and fund a non-existent account.
 *
 * @param opts - Options object
 * @param opts.destination - Destination account ID to create an account for.
 * @param opts.startingBalance - Amount in XLM the account should be funded for. Must be greater
 *     than the {@link https://developers.stellar.org/docs/glossary/fees/ | reserve balance amount}.
 * @param opts.source - The source account for the payment. Defaults to the transaction's source account.
 */
export function createAccount(
  opts: CreateAccountOpts,
): xdr.Operation<CreateAccountResult> {
  if (!StrKey.isValidEd25519PublicKey(opts.destination)) {
    throw new Error("destination is invalid");
  }
  if (!isValidAmount(opts.startingBalance, true)) {
    throw new TypeError(constructAmountRequirementsError("startingBalance"));
  }

  const createAccountOp = new xdr.CreateAccountOp({
    destination: Keypair.fromPublicKey(opts.destination).xdrAccountId(),
    startingBalance: toXDRAmount(opts.startingBalance),
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.createAccount(createAccountOp),
  };
  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
