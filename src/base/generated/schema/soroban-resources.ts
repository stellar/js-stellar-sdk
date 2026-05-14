// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerFootprint } from "./ledger-footprint.js";
export interface SorobanResources {
  readonly footprint: LedgerFootprint;
  readonly instructions: number;
  readonly diskReadBytes: number;
  readonly writeBytes: number;
}
export const SorobanResources = xdr.struct("SorobanResources", {
  footprint: xdr.lazy(() => LedgerFootprint),
  instructions: xdr.uint32(),
  diskReadBytes: xdr.uint32(),
  writeBytes: xdr.uint32(),
}) as xdr.XdrType<SorobanResources>;
