// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { uint256 } from "./uint256.js";
export interface MuxedEd25519Account {
  readonly id: bigint;
  readonly ed25519: uint256;
}
export const MuxedEd25519Account = xdr.struct("MuxedEd25519Account", {
  id: xdr.uint64(),
  ed25519: xdr.lazy(() => uint256),
}) as xdr.XdrType<MuxedEd25519Account>;
