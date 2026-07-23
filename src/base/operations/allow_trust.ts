import {
  AllowTrustOp,
  AssetCode,
  AssetCode12,
  AssetCode4,
  Operation,
  OperationBody,
  TrustLineFlags,
} from "../../xdr/index.js";
import { Keypair } from "../keypair.js";
import { StrKey } from "../strkey.js";
import { AllowTrustOpts, OperationAttributes } from "./types.js";
import { setSourceAccount } from "../util/operations.js";

/**
 * @deprecated since v5.0
 *
 * An "allow trust" operation authorizes another account to hold your
 * account's credit for a given asset.
 *
 * @param opts - Options object
 * @param opts.trustor - The trusting account (the one being authorized)
 * @param opts.assetCode - The asset code being authorized.
 * @param opts.authorize - `1` to authorize, `2` to authorize to maintain liabilities, and `0` to deauthorize.
 * @param opts.source - The source account (defaults to transaction source).
 */
export function allowTrust(opts: AllowTrustOpts): Operation {
  if (!StrKey.isValidEd25519PublicKey(opts.trustor)) {
    throw new Error("trustor is invalid");
  }

  const trustor = Keypair.fromPublicKey(opts.trustor).xdrAccountId();

  let asset: AssetCode;
  if (opts.assetCode.length <= 4) {
    const code = Buffer.from(opts.assetCode.padEnd(4, "\0"));
    asset = AssetCode.assetTypeCreditAlphanum4(new AssetCode4(code));
  } else if (opts.assetCode.length <= 12) {
    const code = Buffer.from(opts.assetCode.padEnd(12, "\0"));
    asset = AssetCode.assetTypeCreditAlphanum12(new AssetCode12(code));
  } else {
    throw new Error("Asset code must be 12 characters at max.");
  }

  let authorize: number;
  if (typeof opts.authorize === "boolean") {
    if (opts.authorize) {
      authorize = TrustLineFlags.authorizedFlag.value;
    } else {
      authorize = 0;
    }
  } else if (opts.authorize == null) {
    throw new Error("authorize is required");
  } else {
    authorize = opts.authorize;
  }

  const allowTrustOp = new AllowTrustOp({
    trustor,
    asset,
    authorize,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.allowTrust(allowTrustOp),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}
