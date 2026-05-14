// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { ClaimableBalanceEntryExt } from "./claimable-balance-entry-ext.js";
import { ClaimableBalanceId } from "./claimable-balance-id.js";
import { Claimant } from "./claimant.js";
export interface ClaimableBalanceEntry {
  readonly balanceId: ClaimableBalanceId;
  readonly claimants: Claimant[];
  readonly asset: Asset;
  readonly amount: bigint;
  readonly ext: ClaimableBalanceEntryExt;
}
export const ClaimableBalanceEntry = xdr.struct("ClaimableBalanceEntry", {
  balanceId: xdr.lazy(() => ClaimableBalanceId),
  claimants: xdr.array(
    xdr.lazy(() => Claimant),
    10,
  ),
  asset: xdr.lazy(() => Asset),
  amount: xdr.int64(),
  ext: xdr.lazy(() => ClaimableBalanceEntryExt),
}) as xdr.XdrType<ClaimableBalanceEntry>;
