// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ClawbackResultCode = xdr.enumType("ClawbackResultCode", {
  clawbackSuccess: 0,
  clawbackMalformed: -1,
  clawbackNotClawbackEnabled: -2,
  clawbackNoTrust: -3,
  clawbackUnderfunded: -4,
} as const);
export type ClawbackResultCode = xdr.Infer<typeof ClawbackResultCode>;
