// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractEventBody } from "./contract-event-body.js";
import { ContractEventType } from "./contract-event-type.js";
import { ContractId } from "./contract-id.js";
import { ExtensionPoint } from "./extension-point.js";
export interface ContractEvent {
  readonly ext: ExtensionPoint;
  readonly contractId: ContractId | null;
  readonly type: ContractEventType;
  readonly body: ContractEventBody;
}
export const ContractEvent = xdr.struct("ContractEvent", {
  ext: xdr.lazy(() => ExtensionPoint),
  contractId: xdr.option(xdr.lazy(() => ContractId)),
  type: xdr.lazy(() => ContractEventType),
  body: xdr.lazy(() => ContractEventBody),
}) as xdr.XdrType<ContractEvent>;
