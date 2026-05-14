// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { MuxedAccount } from "./muxed-account.js";
export interface PathPaymentStrictReceiveOp {
  readonly sendAsset: Asset;
  readonly sendMax: bigint;
  readonly destination: MuxedAccount;
  readonly destAsset: Asset;
  readonly destAmount: bigint;
  readonly path: Asset[];
}
export const PathPaymentStrictReceiveOp = xdr.struct(
  "PathPaymentStrictReceiveOp",
  {
    sendAsset: xdr.lazy(() => Asset),
    sendMax: xdr.int64(),
    destination: xdr.lazy(() => MuxedAccount),
    destAsset: xdr.lazy(() => Asset),
    destAmount: xdr.int64(),
    path: xdr.array(
      xdr.lazy(() => Asset),
      5,
    ),
  },
) as xdr.XdrType<PathPaymentStrictReceiveOp>;
