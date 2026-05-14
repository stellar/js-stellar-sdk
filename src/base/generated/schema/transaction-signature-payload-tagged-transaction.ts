// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { EnvelopeType } from "./envelope-type.js";
import { FeeBumpTransaction } from "./fee-bump-transaction.js";
import { Transaction } from "./transaction.js";
export type TransactionSignaturePayloadTaggedTransaction =
  | {
      readonly type: 2;
      readonly tx: Transaction;
    }
  | {
      readonly type: 5;
      readonly feeBump: FeeBumpTransaction;
    };
export const TransactionSignaturePayloadTaggedTransaction = xdr.union(
  "TransactionSignaturePayloadTaggedTransaction",
  {
    switchOn: xdr.lazy(() => EnvelopeType),
    switchKey: "type",
    cases: [
      xdr.case(
        "envelopeTypeTx",
        2,
        xdr.field(
          "tx",
          xdr.lazy(() => Transaction),
        ),
      ),
      xdr.case(
        "envelopeTypeTxFeeBump",
        5,
        xdr.field(
          "feeBump",
          xdr.lazy(() => FeeBumpTransaction),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<TransactionSignaturePayloadTaggedTransaction>;
