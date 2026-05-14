// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export type OfferEntryExt = {
  readonly v: 0;
};
export const OfferEntryExt = xdr.union("OfferEntryExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [xdr.case("case0", 0, xdr.void())] as const,
}) as xdr.XdrType<OfferEntryExt>;
