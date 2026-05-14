// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { ClaimPredicate } from "./claim-predicate.js";
export interface ClaimantV0 {
  readonly destination: AccountId;
  readonly predicate: ClaimPredicate;
}
export const ClaimantV0 = xdr.struct("ClaimantV0", {
  destination: xdr.lazy(() => AccountId),
  predicate: xdr.lazy(() => ClaimPredicate),
}) as xdr.XdrType<ClaimantV0>;
