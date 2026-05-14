// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { DataEntryExt } from "./data-entry-ext.js";
import { DataValue } from "./data-value.js";
import { string64 } from "./string64.js";
export interface DataEntry {
  readonly accountId: AccountId;
  readonly dataName: string64;
  readonly dataValue: DataValue;
  readonly ext: DataEntryExt;
}
export const DataEntry = xdr.struct("DataEntry", {
  accountId: xdr.lazy(() => AccountId),
  dataName: xdr.lazy(() => string64),
  dataValue: xdr.lazy(() => DataValue),
  ext: xdr.lazy(() => DataEntryExt),
}) as xdr.XdrType<DataEntry>;
