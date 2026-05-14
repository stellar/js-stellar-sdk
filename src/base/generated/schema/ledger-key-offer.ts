// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
export interface LedgerKeyOffer {
  readonly sellerId: AccountId;
  readonly offerId: bigint;
}
export const LedgerKeyOffer = xdr.struct("LedgerKeyOffer", {
  sellerId: xdr.lazy(() => AccountId),
  offerId: xdr.int64(),
}) as xdr.XdrType<LedgerKeyOffer>;
