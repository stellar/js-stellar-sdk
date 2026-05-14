// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const IPAddrType = xdr.enumType("IPAddrType", {
  ipv4: 0,
  ipv6: 1,
} as const);
export type IPAddrType = xdr.Infer<typeof IPAddrType>;
