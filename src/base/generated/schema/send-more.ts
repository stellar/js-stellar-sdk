// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SendMore {
  readonly numMessages: number;
}
export const SendMore = xdr.struct("SendMore", {
  numMessages: xdr.uint32(),
}) as xdr.XdrType<SendMore>;
