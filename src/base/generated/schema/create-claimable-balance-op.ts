// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { Claimant } from "./claimant.js";
export interface CreateClaimableBalanceOp {
  readonly asset: Asset;
  readonly amount: bigint;
  readonly claimants: Claimant[];
}
export const CreateClaimableBalanceOp = xdr.struct("CreateClaimableBalanceOp", {
  asset: xdr.lazy(() => Asset),
  amount: xdr.int64(),
  claimants: xdr.array(
    xdr.lazy(() => Claimant),
    10,
  ),
}) as xdr.XdrType<CreateClaimableBalanceOp>;
