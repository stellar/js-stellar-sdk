// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
export type TxDemandVector = Hash[];
export const TxDemandVector = xdr.array(
  xdr.lazy(() => Hash),
  1000,
) as xdr.XdrType<TxDemandVector>;
