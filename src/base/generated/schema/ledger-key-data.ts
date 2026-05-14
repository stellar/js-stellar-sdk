// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { string64 } from "./string64.js";
export interface LedgerKeyData {
  readonly accountId: AccountId;
  readonly dataName: string64;
}
export const LedgerKeyData = xdr.struct("LedgerKeyData", {
  accountId: xdr.lazy(() => AccountId),
  dataName: xdr.lazy(() => string64),
}) as xdr.XdrType<LedgerKeyData>;
