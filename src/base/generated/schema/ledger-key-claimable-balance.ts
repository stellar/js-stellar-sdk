// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimableBalanceId } from "./claimable-balance-id.js";
export interface LedgerKeyClaimableBalance {
  readonly balanceId: ClaimableBalanceId;
}
export const LedgerKeyClaimableBalance = xdr.struct(
  "LedgerKeyClaimableBalance",
  {
    balanceId: xdr.lazy(() => ClaimableBalanceId),
  },
) as xdr.XdrType<LedgerKeyClaimableBalance>;
