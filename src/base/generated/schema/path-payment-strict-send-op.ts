// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { MuxedAccount } from "./muxed-account.js";
export interface PathPaymentStrictSendOp {
  readonly sendAsset: Asset;
  readonly sendAmount: bigint;
  readonly destination: MuxedAccount;
  readonly destAsset: Asset;
  readonly destMin: bigint;
  readonly path: Asset[];
}
export const PathPaymentStrictSendOp = xdr.struct("PathPaymentStrictSendOp", {
  sendAsset: xdr.lazy(() => Asset),
  sendAmount: xdr.int64(),
  destination: xdr.lazy(() => MuxedAccount),
  destAsset: xdr.lazy(() => Asset),
  destMin: xdr.int64(),
  path: xdr.array(
    xdr.lazy(() => Asset),
    5,
  ),
}) as xdr.XdrType<PathPaymentStrictSendOp>;
