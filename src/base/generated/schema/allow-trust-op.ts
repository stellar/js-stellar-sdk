// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { AssetCode } from "./asset-code.js";
export interface AllowTrustOp {
  readonly trustor: AccountId;
  readonly asset: AssetCode;
  readonly authorize: number;
}
export const AllowTrustOp = xdr.struct("AllowTrustOp", {
  trustor: xdr.lazy(() => AccountId),
  asset: xdr.lazy(() => AssetCode),
  authorize: xdr.uint32(),
}) as xdr.XdrType<AllowTrustOp>;
