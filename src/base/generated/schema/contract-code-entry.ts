// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractCodeEntryExt } from "./contract-code-entry-ext.js";
import { Hash } from "./hash.js";
export interface ContractCodeEntry {
  readonly ext: ContractCodeEntryExt;
  readonly hash: Hash;
  readonly code: Uint8Array;
}
export const ContractCodeEntry = xdr.struct("ContractCodeEntry", {
  ext: xdr.lazy(() => ContractCodeEntryExt),
  hash: xdr.lazy(() => Hash),
  code: xdr.varOpaque(xdr.UNBOUNDED_MAX_LENGTH),
}) as xdr.XdrType<ContractCodeEntry>;
