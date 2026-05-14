// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SCEnvMetaEntryInterfaceVersion {
  readonly protocol: number;
  readonly preRelease: number;
}
export const SCEnvMetaEntryInterfaceVersion = xdr.struct(
  "SCEnvMetaEntryInterfaceVersion",
  {
    protocol: xdr.uint32(),
    preRelease: xdr.uint32(),
  },
) as xdr.XdrType<SCEnvMetaEntryInterfaceVersion>;
