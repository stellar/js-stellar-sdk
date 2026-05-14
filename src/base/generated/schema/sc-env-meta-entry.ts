// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCEnvMetaEntryInterfaceVersion } from "./sc-env-meta-entry-interface-version.js";
import { SCEnvMetaKind } from "./sc-env-meta-kind.js";
export type SCEnvMetaEntry = {
  readonly kind: 0;
  readonly interfaceVersion: SCEnvMetaEntryInterfaceVersion;
};
export const SCEnvMetaEntry = xdr.union("SCEnvMetaEntry", {
  switchOn: xdr.lazy(() => SCEnvMetaKind),
  switchKey: "kind",
  cases: [
    xdr.case(
      "scEnvMetaKindInterfaceVersion",
      0,
      xdr.field(
        "interfaceVersion",
        xdr.lazy(() => SCEnvMetaEntryInterfaceVersion),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCEnvMetaEntry>;
