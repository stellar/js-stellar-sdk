// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { MuxedAccount } from "./muxed-account.js";
export interface PaymentOp {
  readonly destination: MuxedAccount;
  readonly asset: Asset;
  readonly amount: bigint;
}
export const PaymentOp = xdr.struct("PaymentOp", {
  destination: xdr.lazy(() => MuxedAccount),
  asset: xdr.lazy(() => Asset),
  amount: xdr.int64(),
}) as xdr.XdrType<PaymentOp>;
