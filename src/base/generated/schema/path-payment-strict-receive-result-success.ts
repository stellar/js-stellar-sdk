// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimAtom } from "./claim-atom.js";
import { SimplePaymentResult } from "./simple-payment-result.js";
export interface PathPaymentStrictReceiveResultSuccess {
  readonly offers: ClaimAtom[];
  readonly last: SimplePaymentResult;
}
export const PathPaymentStrictReceiveResultSuccess = xdr.struct(
  "PathPaymentStrictReceiveResultSuccess",
  {
    offers: xdr.array(
      xdr.lazy(() => ClaimAtom),
      xdr.UNBOUNDED_MAX_LENGTH,
    ),
    last: xdr.lazy(() => SimplePaymentResult),
  },
) as xdr.XdrType<PathPaymentStrictReceiveResultSuccess>;
