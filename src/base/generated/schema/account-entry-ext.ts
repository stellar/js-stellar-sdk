// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountEntryExtensionV1 } from "./account-entry-extension-v1.js";
export type AccountEntryExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly v1: AccountEntryExtensionV1;
    };
export const AccountEntryExt = xdr.union("AccountEntryExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => AccountEntryExtensionV1),
      ),
    ),
  ] as const,
}) as xdr.XdrType<AccountEntryExt>;
