// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AssetCode12 } from "./asset-code12.js";
import { AssetCode4 } from "./asset-code4.js";
import { AssetType } from "./asset-type.js";
export type AssetCode =
  | {
      readonly type: 1;
      readonly assetCode4: AssetCode4;
    }
  | {
      readonly type: 2;
      readonly assetCode12: AssetCode12;
    };
export const AssetCode = xdr.union("AssetCode", {
  switchOn: xdr.lazy(() => AssetType),
  switchKey: "type",
  cases: [
    xdr.case(
      "assetTypeCreditAlphanum4",
      1,
      xdr.field(
        "assetCode4",
        xdr.lazy(() => AssetCode4),
      ),
    ),
    xdr.case(
      "assetTypeCreditAlphanum12",
      2,
      xdr.field(
        "assetCode12",
        xdr.lazy(() => AssetCode12),
      ),
    ),
  ] as const,
}) as xdr.XdrType<AssetCode>;
