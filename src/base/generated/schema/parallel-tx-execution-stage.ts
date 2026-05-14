// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { DependentTxCluster } from "./dependent-tx-cluster.js";
export type ParallelTxExecutionStage = DependentTxCluster[];
export const ParallelTxExecutionStage = xdr.array(
  xdr.lazy(() => DependentTxCluster),
  xdr.UNBOUNDED_MAX_LENGTH,
) as xdr.XdrType<ParallelTxExecutionStage>;
