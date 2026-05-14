// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { Asset } from "./asset.js";
import { PoolId } from "./pool-id.js";
import { SequenceNumber } from "./sequence-number.js";
export interface HashIdPreimageRevokeId {
  readonly sourceAccount: AccountId;
  readonly seqNum: SequenceNumber;
  readonly opNum: number;
  readonly liquidityPoolId: PoolId;
  readonly asset: Asset;
}
export const HashIdPreimageRevokeId = xdr.struct("HashIDPreimageRevokeId", {
  sourceAccount: xdr.lazy(() => AccountId),
  seqNum: xdr.lazy(() => SequenceNumber),
  opNum: xdr.uint32(),
  liquidityPoolId: xdr.lazy(() => PoolId),
  asset: xdr.lazy(() => Asset),
}) as xdr.XdrType<HashIdPreimageRevokeId>;
