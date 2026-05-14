// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimAtomType } from "./claim-atom-type.js";
import { ClaimLiquidityAtom } from "./claim-liquidity-atom.js";
import { ClaimOfferAtom } from "./claim-offer-atom.js";
import { ClaimOfferAtomV0 } from "./claim-offer-atom-v0.js";
export type ClaimAtom =
  | {
      readonly type: 0;
      readonly v0: ClaimOfferAtomV0;
    }
  | {
      readonly type: 1;
      readonly orderBook: ClaimOfferAtom;
    }
  | {
      readonly type: 2;
      readonly liquidityPool: ClaimLiquidityAtom;
    };
export const ClaimAtom = xdr.union("ClaimAtom", {
  switchOn: xdr.lazy(() => ClaimAtomType),
  switchKey: "type",
  cases: [
    xdr.case(
      "claimAtomTypeV0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => ClaimOfferAtomV0),
      ),
    ),
    xdr.case(
      "claimAtomTypeOrderBook",
      1,
      xdr.field(
        "orderBook",
        xdr.lazy(() => ClaimOfferAtom),
      ),
    ),
    xdr.case(
      "claimAtomTypeLiquidityPool",
      2,
      xdr.field(
        "liquidityPool",
        xdr.lazy(() => ClaimLiquidityAtom),
      ),
    ),
  ] as const,
}) as xdr.XdrType<ClaimAtom>;
