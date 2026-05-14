// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { MessageType } from "./message-type.js";
import { uint256 } from "./uint256.js";
export interface DontHave {
  readonly type: MessageType;
  readonly reqHash: uint256;
}
export const DontHave = xdr.struct("DontHave", {
  type: xdr.lazy(() => MessageType),
  reqHash: xdr.lazy(() => uint256),
}) as xdr.XdrType<DontHave>;
