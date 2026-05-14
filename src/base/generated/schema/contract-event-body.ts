// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractEventV0 } from "./contract-event-v0.js";
export type ContractEventBody = {
  readonly v: 0;
  readonly v0: ContractEventV0;
};
export const ContractEventBody = xdr.union("ContractEventBody", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case(
      "v0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => ContractEventV0),
      ),
    ),
  ] as const,
}) as xdr.XdrType<ContractEventBody>;
