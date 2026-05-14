// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SendMoreExtended {
  readonly numMessages: number;
  readonly numBytes: number;
}
export const SendMoreExtended = xdr.struct("SendMoreExtended", {
  numMessages: xdr.uint32(),
  numBytes: xdr.uint32(),
}) as xdr.XdrType<SendMoreExtended>;
