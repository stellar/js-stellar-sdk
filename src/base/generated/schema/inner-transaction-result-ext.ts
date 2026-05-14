// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export type InnerTransactionResultExt = {
  readonly v: 0;
};
export const InnerTransactionResultExt = xdr.union(
  "InnerTransactionResultExt",
  {
    switchOn: xdr.int32(),
    switchKey: "v",
    cases: [xdr.case("case0", 0, xdr.void())] as const,
  },
) as xdr.XdrType<InnerTransactionResultExt>;
