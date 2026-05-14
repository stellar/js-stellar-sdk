// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingSCPTiming {
  readonly ledgerTargetCloseTimeMilliseconds: number;
  readonly nominationTimeoutInitialMilliseconds: number;
  readonly nominationTimeoutIncrementMilliseconds: number;
  readonly ballotTimeoutInitialMilliseconds: number;
  readonly ballotTimeoutIncrementMilliseconds: number;
}
export const ConfigSettingSCPTiming = xdr.struct("ConfigSettingSCPTiming", {
  ledgerTargetCloseTimeMilliseconds: xdr.uint32(),
  nominationTimeoutInitialMilliseconds: xdr.uint32(),
  nominationTimeoutIncrementMilliseconds: xdr.uint32(),
  ballotTimeoutInitialMilliseconds: xdr.uint32(),
  ballotTimeoutIncrementMilliseconds: xdr.uint32(),
}) as xdr.XdrType<ConfigSettingSCPTiming>;
