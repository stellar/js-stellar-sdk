// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { MuxedAccount } from "./muxed-account.js";
import { OperationBody } from "./operation-body.js";
export interface Operation {
  readonly sourceAccount: MuxedAccount | null;
  readonly body: OperationBody;
}
export const Operation = xdr.struct("Operation", {
  sourceAccount: xdr.option(xdr.lazy(() => MuxedAccount)),
  body: xdr.lazy(() => OperationBody),
}) as xdr.XdrType<Operation>;
