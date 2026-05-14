// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
export interface InflationPayout {
  readonly destination: AccountId;
  readonly amount: bigint;
}
export const InflationPayout = xdr.struct("InflationPayout", {
  destination: xdr.lazy(() => AccountId),
  amount: xdr.int64(),
}) as xdr.XdrType<InflationPayout>;
