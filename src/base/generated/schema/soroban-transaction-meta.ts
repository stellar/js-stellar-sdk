// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractEvent } from "./contract-event.js";
import { DiagnosticEvent } from "./diagnostic-event.js";
import { SorobanTransactionMetaExt } from "./soroban-transaction-meta-ext.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface SorobanTransactionMeta {
  readonly ext: SorobanTransactionMetaExt;
  readonly events: ContractEvent[];
  readonly returnValue: SCVal;
  readonly diagnosticEvents: DiagnosticEvent[];
}
export const SorobanTransactionMeta = xdr.struct("SorobanTransactionMeta", {
  ext: xdr.lazy(() => SorobanTransactionMetaExt),
  events: xdr.array(
    xdr.lazy(() => ContractEvent),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  returnValue: xdr.lazy(() => SCVal),
  diagnosticEvents: xdr.array(
    xdr.lazy(() => DiagnosticEvent),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<SorobanTransactionMeta>;
