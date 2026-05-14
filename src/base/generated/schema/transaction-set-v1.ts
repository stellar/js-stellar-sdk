// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { TransactionPhase } from "./transaction-phase.js";
export interface TransactionSetV1 {
  readonly previousLedgerHash: Hash;
  readonly phases: TransactionPhase[];
}
export const TransactionSetV1 = xdr.struct("TransactionSetV1", {
  previousLedgerHash: xdr.lazy(() => Hash),
  phases: xdr.array(
    xdr.lazy(() => TransactionPhase),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<TransactionSetV1>;
