// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimableBalanceId } from "./claimable-balance-id.js";
export interface ClaimClaimableBalanceOp {
  readonly balanceId: ClaimableBalanceId;
}
export const ClaimClaimableBalanceOp = xdr.struct("ClaimClaimableBalanceOp", {
  balanceId: xdr.lazy(() => ClaimableBalanceId),
}) as xdr.XdrType<ClaimClaimableBalanceOp>;
