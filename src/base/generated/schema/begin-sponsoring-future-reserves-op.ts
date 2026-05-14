// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
export interface BeginSponsoringFutureReservesOp {
  readonly sponsoredId: AccountId;
}
export const BeginSponsoringFutureReservesOp = xdr.struct(
  "BeginSponsoringFutureReservesOp",
  {
    sponsoredId: xdr.lazy(() => AccountId),
  },
) as xdr.XdrType<BeginSponsoringFutureReservesOp>;
