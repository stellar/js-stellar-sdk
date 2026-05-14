// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TxAdvertVector } from "./tx-advert-vector.js";
export interface FloodAdvert {
  readonly txHashes: TxAdvertVector;
}
export const FloodAdvert = xdr.struct("FloodAdvert", {
  txHashes: xdr.lazy(() => TxAdvertVector),
}) as xdr.XdrType<FloodAdvert>;
