// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
export interface LedgerKeyAccount {
  readonly accountId: AccountId;
}
export const LedgerKeyAccount = xdr.struct("LedgerKeyAccount", {
  accountId: xdr.lazy(() => AccountId),
}) as xdr.XdrType<LedgerKeyAccount>;
