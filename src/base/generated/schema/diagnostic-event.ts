// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractEvent } from "./contract-event.js";
export interface DiagnosticEvent {
  readonly inSuccessfulContractCall: boolean;
  readonly event: ContractEvent;
}
export const DiagnosticEvent = xdr.struct("DiagnosticEvent", {
  inSuccessfulContractCall: xdr.bool(),
  event: xdr.lazy(() => ContractEvent),
}) as xdr.XdrType<DiagnosticEvent>;
