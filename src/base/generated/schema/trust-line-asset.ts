// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AlphaNum12 } from "./alpha-num12.js";
import { AlphaNum4 } from "./alpha-num4.js";
import { AssetType } from "./asset-type.js";
import { PoolId } from "./pool-id.js";
export type TrustLineAsset =
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
    }
  | {
      readonly type: 3;
      readonly liquidityPoolId: PoolId;
    };
export const TrustLineAsset = xdr.union("TrustLineAsset", {
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
    xdr.case(
      "assetTypePoolShare",
      3,
      xdr.field(
        "liquidityPoolId",
        xdr.lazy(() => PoolId),
      ),
    ),
  ] as const,
}) as xdr.XdrType<TrustLineAsset>;
