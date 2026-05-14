// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
export interface LedgerKeyContractCode {
  readonly hash: Hash;
}
export const LedgerKeyContractCode = xdr.struct("LedgerKeyContractCode", {
  hash: xdr.lazy(() => Hash),
}) as xdr.XdrType<LedgerKeyContractCode>;
