// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCPStatement } from "./scp-statement.js";
import { Signature } from "./signature.js";
export interface SCPEnvelope {
  readonly statement: SCPStatement;
  readonly signature: Signature;
}
export const SCPEnvelope = xdr.struct("SCPEnvelope", {
  statement: xdr.lazy(() => SCPStatement),
  signature: xdr.lazy(() => Signature),
}) as xdr.XdrType<SCPEnvelope>;
