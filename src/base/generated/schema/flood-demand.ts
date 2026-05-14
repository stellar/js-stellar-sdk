// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TxDemandVector } from "./tx-demand-vector.js";
export interface FloodDemand {
  readonly txHashes: TxDemandVector;
}
export const FloodDemand = xdr.struct("FloodDemand", {
  txHashes: xdr.lazy(() => TxDemandVector),
}) as xdr.XdrType<FloodDemand>;
