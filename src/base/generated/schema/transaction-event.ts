// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractEvent } from "./contract-event.js";
import { TransactionEventStage } from "./transaction-event-stage.js";
export interface TransactionEvent {
  readonly stage: TransactionEventStage;
  readonly event: ContractEvent;
}
export const TransactionEvent = xdr.struct("TransactionEvent", {
  stage: xdr.lazy(() => TransactionEventStage),
  event: xdr.lazy(() => ContractEvent),
}) as xdr.XdrType<TransactionEvent>;
