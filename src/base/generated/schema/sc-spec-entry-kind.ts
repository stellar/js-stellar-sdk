// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SCSpecEntryKind = xdr.enumType("SCSpecEntryKind", {
  scSpecEntryFunctionV0: 0,
  scSpecEntryUdtStructV0: 1,
  scSpecEntryUdtUnionV0: 2,
  scSpecEntryUdtEnumV0: 3,
  scSpecEntryUdtErrorEnumV0: 4,
  scSpecEntryEventV0: 5,
} as const);
export type SCSpecEntryKind = xdr.Infer<typeof SCSpecEntryKind>;
