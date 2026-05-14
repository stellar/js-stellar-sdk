// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { EnvelopeType } from "./envelope-type.js";
import { FeeBumpTransactionEnvelope } from "./fee-bump-transaction-envelope.js";
import { TransactionV0Envelope } from "./transaction-v0-envelope.js";
import { TransactionV1Envelope } from "./transaction-v1-envelope.js";
export type TransactionEnvelope =
  | {
      readonly type: 0;
      readonly v0: TransactionV0Envelope;
    }
  | {
      readonly type: 2;
      readonly v1: TransactionV1Envelope;
    }
  | {
      readonly type: 5;
      readonly feeBump: FeeBumpTransactionEnvelope;
    };
export const TransactionEnvelope = xdr.union("TransactionEnvelope", {
  switchOn: xdr.lazy(() => EnvelopeType),
  switchKey: "type",
  cases: [
    xdr.case(
      "envelopeTypeTxV0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => TransactionV0Envelope),
      ),
    ),
    xdr.case(
      "envelopeTypeTx",
      2,
      xdr.field(
        "v1",
        xdr.lazy(() => TransactionV1Envelope),
      ),
    ),
    xdr.case(
      "envelopeTypeTxFeeBump",
      5,
      xdr.field(
        "feeBump",
        xdr.lazy(() => FeeBumpTransactionEnvelope),
      ),
    ),
  ] as const,
}) as xdr.XdrType<TransactionEnvelope>;
