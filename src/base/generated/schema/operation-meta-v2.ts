// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractEvent } from "./contract-event.js";
import { ExtensionPoint } from "./extension-point.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
export interface OperationMetaV2 {
  readonly ext: ExtensionPoint;
  readonly changes: LedgerEntryChanges;
  readonly events: ContractEvent[];
}
export const OperationMetaV2 = xdr.struct("OperationMetaV2", {
  ext: xdr.lazy(() => ExtensionPoint),
  changes: xdr.lazy(() => LedgerEntryChanges),
  events: xdr.array(
    xdr.lazy(() => ContractEvent),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<OperationMetaV2>;
