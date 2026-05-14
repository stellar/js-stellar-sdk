// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountEntryExtensionV2 } from "./account-entry-extension-v2.js";
export type AccountEntryExtensionV1Ext =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 2;
      readonly v2: AccountEntryExtensionV2;
    };
export const AccountEntryExtensionV1Ext = xdr.union(
  "AccountEntryExtensionV1Ext",
  {
    switchOn: xdr.int32(),
    switchKey: "v",
    cases: [
      xdr.case("case0", 0, xdr.void()),
      xdr.case(
        "v2",
        2,
        xdr.field(
          "v2",
          xdr.lazy(() => AccountEntryExtensionV2),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<AccountEntryExtensionV1Ext>;
