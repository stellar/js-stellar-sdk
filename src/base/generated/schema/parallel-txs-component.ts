// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ParallelTxExecutionStage } from "./parallel-tx-execution-stage.js";
export interface ParallelTxsComponent {
  readonly baseFee: bigint | null;
  readonly executionStages: ParallelTxExecutionStage[];
}
export const ParallelTxsComponent = xdr.struct("ParallelTxsComponent", {
  baseFee: xdr.option(xdr.int64()),
  executionStages: xdr.array(
    xdr.lazy(() => ParallelTxExecutionStage),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<ParallelTxsComponent>;
