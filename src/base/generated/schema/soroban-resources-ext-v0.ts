// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SorobanResourcesExtV0 {
  readonly archivedSorobanEntries: number[];
}
export const SorobanResourcesExtV0 = xdr.struct("SorobanResourcesExtV0", {
  archivedSorobanEntries: xdr.array(xdr.uint32(), xdr.UNBOUNDED_MAX_LENGTH),
}) as xdr.XdrType<SorobanResourcesExtV0>;
