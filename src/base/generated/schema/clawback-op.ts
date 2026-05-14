// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { MuxedAccount } from "./muxed-account.js";
export interface ClawbackOp {
  readonly asset: Asset;
  readonly from: MuxedAccount;
  readonly amount: bigint;
}
export const ClawbackOp = xdr.struct("ClawbackOp", {
  asset: xdr.lazy(() => Asset),
  from: xdr.lazy(() => MuxedAccount),
  amount: xdr.int64(),
}) as xdr.XdrType<ClawbackOp>;
