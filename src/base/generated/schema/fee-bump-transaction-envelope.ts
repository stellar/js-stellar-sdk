// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { DecoratedSignature } from "./decorated-signature.js";
import { FeeBumpTransaction } from "./fee-bump-transaction.js";
export interface FeeBumpTransactionEnvelope {
  readonly tx: FeeBumpTransaction;
  readonly signatures: DecoratedSignature[];
}
export const FeeBumpTransactionEnvelope = xdr.struct(
  "FeeBumpTransactionEnvelope",
  {
    tx: xdr.lazy(() => FeeBumpTransaction),
    signatures: xdr.array(
      xdr.lazy(() => DecoratedSignature),
      20,
    ),
  },
) as xdr.XdrType<FeeBumpTransactionEnvelope>;
