import xdr from "../xdr.js";
import { Keypair } from "../keypair.js";
import {
  SetTrustLineFlagsOpts,
  SetTrustLineFlagsResult,
  TrustLineFlagMap,
  OperationAttributes,
} from "./types.js";
import { setSourceAccount } from "../util/operations.js";

/**
 * Creates a trustline flag configuring operation.
 *
 * For the flags, set them to true to enable them and false to disable them. Any
 * unmodified operations will be marked `undefined` in the result.
 *
 * Note that you can only **clear** the clawbackEnabled flag set; it must be set
 * account-wide via operations.SetOptions (setting
 * xdr.AccountFlags.clawbackEnabled).
 *
 *
 * @param opts - Options object
 * @param opts.trustor - the account whose trustline this is
 * @param opts.asset - the asset on the trustline
 * @param opts.flags - the set of flags to modify
 * @param opts.flags.authorized - authorize account to perform
 *     transactions with its credit
 * @param opts.flags.authorizedToMaintainLiabilities - authorize
 *     account to maintain and reduce liabilities for its credit
 * @param opts.flags.clawbackEnabled - stop claimable balances on
 *     this trustlines from having clawbacks enabled (this flag can only be set
 *     to false!)
 * @param opts.source - The source account for the operation.
 *                                 Defaults to the transaction's source account.
 *
 * @see https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#set-trustline-flags-operation
 * @see https://developers.stellar.org/docs/start/list-of-operations/#set-options
 */
export function setTrustLineFlags(
  opts: SetTrustLineFlagsOpts,
): xdr.Operation<SetTrustLineFlagsResult> {
  if (typeof opts.flags !== "object" || Object.keys(opts.flags).length === 0) {
    throw new Error("opts.flags must be a map of boolean flags to modify");
  }

  const mapping: Record<string, { value: number }> = {
    authorized: xdr.TrustLineFlags.authorizedFlag(),
    authorizedToMaintainLiabilities:
      xdr.TrustLineFlags.authorizedToMaintainLiabilitiesFlag(),
    clawbackEnabled: xdr.TrustLineFlags.trustlineClawbackEnabledFlag(),
  };

  /* eslint no-bitwise: "off" */
  let clearFlag = 0;
  let setFlag = 0;

  Object.keys(opts.flags).forEach((flagName) => {
    if (!Object.prototype.hasOwnProperty.call(mapping, flagName)) {
      throw new Error(`unsupported flag name specified: ${flagName}`);
    }

    const flagValue = opts.flags[flagName as keyof TrustLineFlagMap];
    const bit = mapping[flagName];
    if (!bit) {
      throw new Error(`Invalid flag name: ${flagName}`);
    }

    if (typeof flagValue !== "boolean" && typeof flagValue !== "undefined") {
      throw new TypeError(
        `opts.flags.${flagName} must be a boolean (got ${typeof flagValue})`,
      );
    }

    if (flagValue === true) {
      setFlag |= bit.value;
    } else if (flagValue === false) {
      clearFlag |= bit.value;
    }
  });

  const trustor = Keypair.fromPublicKey(opts.trustor).xdrAccountId();
  const asset = opts.asset.toXDRObject();

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.setTrustLineFlags(
      new xdr.SetTrustLineFlagsOp({
        trustor,
        asset,
        clearFlags: clearFlag,
        setFlags: setFlag,
      }),
    ),
  };
  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
