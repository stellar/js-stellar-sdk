// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountEntryExtensionV3 } from "./account-entry-extension-v3.js";
export type AccountEntryExtensionV2Ext =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 3;
      readonly v3: AccountEntryExtensionV3;
    };
export const AccountEntryExtensionV2Ext = xdr.union(
  "AccountEntryExtensionV2Ext",
  {
    switchOn: xdr.int32(),
    switchKey: "v",
    cases: [
      xdr.case("case0", 0, xdr.void()),
      xdr.case(
        "v3",
        3,
        xdr.field(
          "v3",
          xdr.lazy(() => AccountEntryExtensionV3),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<AccountEntryExtensionV2Ext>;
