// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SequenceNumber } from "./sequence-number.js";
export interface BumpSequenceOp {
  readonly bumpTo: SequenceNumber;
}
export const BumpSequenceOp = xdr.struct("BumpSequenceOp", {
  bumpTo: xdr.lazy(() => SequenceNumber),
}) as xdr.XdrType<BumpSequenceOp>;
