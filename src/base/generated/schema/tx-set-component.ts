// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TxSetComponentTxsMaybeDiscountedFee } from "./tx-set-component-txs-maybe-discounted-fee.js";
import { TxSetComponentType } from "./tx-set-component-type.js";
export type TxSetComponent = {
  readonly type: 0;
  readonly txsMaybeDiscountedFee: TxSetComponentTxsMaybeDiscountedFee;
};
export const TxSetComponent = xdr.union("TxSetComponent", {
  switchOn: xdr.lazy(() => TxSetComponentType),
  switchKey: "type",
  cases: [
    xdr.case(
      "txsetCompTxsMaybeDiscountedFee",
      0,
      xdr.field(
        "txsMaybeDiscountedFee",
        xdr.lazy(() => TxSetComponentTxsMaybeDiscountedFee),
      ),
    ),
  ] as const,
}) as xdr.XdrType<TxSetComponent>;
