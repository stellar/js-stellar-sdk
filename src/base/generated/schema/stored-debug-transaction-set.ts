// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { StellarValue } from "./stellar-value.js";
import { StoredTransactionSet } from "./stored-transaction-set.js";
export interface StoredDebugTransactionSet {
  readonly txSet: StoredTransactionSet;
  readonly ledgerSeq: number;
  readonly scpValue: StellarValue;
}
export const StoredDebugTransactionSet = xdr.struct(
  "StoredDebugTransactionSet",
  {
    txSet: xdr.lazy(() => StoredTransactionSet),
    ledgerSeq: xdr.uint32(),
    scpValue: xdr.lazy(() => StellarValue),
  },
) as xdr.XdrType<StoredDebugTransactionSet>;
