// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { Asset } from "./asset.js";
export interface SetTrustLineFlagsOp {
  readonly trustor: AccountId;
  readonly asset: Asset;
  readonly clearFlags: number;
  readonly setFlags: number;
}
export const SetTrustLineFlagsOp = xdr.struct("SetTrustLineFlagsOp", {
  trustor: xdr.lazy(() => AccountId),
  asset: xdr.lazy(() => Asset),
  clearFlags: xdr.uint32(),
  setFlags: xdr.uint32(),
}) as xdr.XdrType<SetTrustLineFlagsOp>;
