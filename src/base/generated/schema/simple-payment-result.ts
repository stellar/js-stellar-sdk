// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { Asset } from "./asset.js";
export interface SimplePaymentResult {
  readonly destination: AccountId;
  readonly asset: Asset;
  readonly amount: bigint;
}
export const SimplePaymentResult = xdr.struct("SimplePaymentResult", {
  destination: xdr.lazy(() => AccountId),
  asset: xdr.lazy(() => Asset),
  amount: xdr.int64(),
}) as xdr.XdrType<SimplePaymentResult>;
