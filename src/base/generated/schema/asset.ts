// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AlphaNum12 } from "./alpha-num12.js";
import { AlphaNum4 } from "./alpha-num4.js";
import { AssetType } from "./asset-type.js";
export type Asset =
  | {
      readonly type: 0;
    }
  | {
      readonly type: 1;
      readonly alphaNum4: AlphaNum4;
    }
  | {
      readonly type: 2;
      readonly alphaNum12: AlphaNum12;
    };
export const Asset = xdr.union("Asset", {
  switchOn: xdr.lazy(() => AssetType),
  switchKey: "type",
  cases: [
    xdr.case("assetTypeNative", 0, xdr.void()),
    xdr.case(
      "assetTypeCreditAlphanum4",
      1,
      xdr.field(
        "alphaNum4",
        xdr.lazy(() => AlphaNum4),
      ),
    ),
    xdr.case(
      "assetTypeCreditAlphanum12",
      2,
      xdr.field(
        "alphaNum12",
        xdr.lazy(() => AlphaNum12),
      ),
    ),
  ] as const,
}) as xdr.XdrType<Asset>;
