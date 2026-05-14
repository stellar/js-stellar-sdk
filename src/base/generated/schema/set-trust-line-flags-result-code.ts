// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SetTrustLineFlagsResultCode = xdr.enumType(
  "SetTrustLineFlagsResultCode",
  {
    setTrustLineFlagsSuccess: 0,
    setTrustLineFlagsMalformed: -1,
    setTrustLineFlagsNoTrustLine: -2,
    setTrustLineFlagsCantRevoke: -3,
    setTrustLineFlagsInvalidState: -4,
    setTrustLineFlagsLowReserve: -5,
  } as const,
);
export type SetTrustLineFlagsResultCode = xdr.Infer<
  typeof SetTrustLineFlagsResultCode
>;
