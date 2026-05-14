// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { EnvelopeType } from "./envelope-type.js";
import { TransactionV1Envelope } from "./transaction-v1-envelope.js";
export type FeeBumpTransactionInnerTx = {
  readonly type: 2;
  readonly v1: TransactionV1Envelope;
};
export const FeeBumpTransactionInnerTx = xdr.union(
  "FeeBumpTransactionInnerTx",
  {
    switchOn: xdr.lazy(() => EnvelopeType),
    switchKey: "type",
    cases: [
      xdr.case(
        "envelopeTypeTx",
        2,
        xdr.field(
          "v1",
          xdr.lazy(() => TransactionV1Envelope),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<FeeBumpTransactionInnerTx>;
