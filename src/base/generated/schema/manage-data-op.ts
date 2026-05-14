// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { DataValue } from "./data-value.js";
import { string64 } from "./string64.js";
export interface ManageDataOp {
  readonly dataName: string64;
  readonly dataValue: DataValue | null;
}
export const ManageDataOp = xdr.struct("ManageDataOp", {
  dataName: xdr.lazy(() => string64),
  dataValue: xdr.option(xdr.lazy(() => DataValue)),
}) as xdr.XdrType<ManageDataOp>;
