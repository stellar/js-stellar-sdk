// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanAuthorizationEntry } from "./soroban-authorization-entry.js";
export type SorobanAuthorizationEntries = SorobanAuthorizationEntry[];
export const SorobanAuthorizationEntries = xdr.array(
  xdr.lazy(() => SorobanAuthorizationEntry),
  xdr.UNBOUNDED_MAX_LENGTH,
) as xdr.XdrType<SorobanAuthorizationEntries>;
