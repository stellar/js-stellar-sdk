// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
export type TxAdvertVector = Hash[];
export const TxAdvertVector = xdr.array(
  xdr.lazy(() => Hash),
  1000,
) as xdr.XdrType<TxAdvertVector>;
