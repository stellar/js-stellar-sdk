// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ParallelTxsComponent } from "./parallel-txs-component.js";
import { TxSetComponent } from "./tx-set-component.js";
export type TransactionPhase =
  | {
      readonly v: 0;
      readonly v0Components: TxSetComponent[];
    }
  | {
      readonly v: 1;
      readonly parallelTxsComponent: ParallelTxsComponent;
    };
export const TransactionPhase = xdr.union("TransactionPhase", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case(
      "v0Components",
      0,
      xdr.field(
        "v0Components",
        xdr.array(
          xdr.lazy(() => TxSetComponent),
          xdr.UNBOUNDED_MAX_LENGTH,
        ),
      ),
    ),
    xdr.case(
      "parallelTxsComponent",
      1,
      xdr.field(
        "parallelTxsComponent",
        xdr.lazy(() => ParallelTxsComponent),
      ),
    ),
  ] as const,
}) as xdr.XdrType<TransactionPhase>;
