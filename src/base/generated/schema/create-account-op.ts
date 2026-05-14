// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
export interface CreateAccountOp {
  readonly destination: AccountId;
  readonly startingBalance: bigint;
}
export const CreateAccountOp = xdr.struct("CreateAccountOp", {
  destination: xdr.lazy(() => AccountId),
  startingBalance: xdr.int64(),
}) as xdr.XdrType<CreateAccountOp>;
