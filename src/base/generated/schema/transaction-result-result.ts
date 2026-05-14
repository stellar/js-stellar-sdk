// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { InnerTransactionResultPair } from "./inner-transaction-result-pair.js";
import { OperationResult } from "./operation-result.js";
import { TransactionResultCode } from "./transaction-result-code.js";
export type TransactionResultResult =
  | {
      readonly code: 1;
      readonly innerResultPair: InnerTransactionResultPair;
    }
  | {
      readonly code: -13;
      readonly innerResultPair: InnerTransactionResultPair;
    }
  | {
      readonly code: 0;
      readonly results: OperationResult[];
    }
  | {
      readonly code: -1;
      readonly results: OperationResult[];
    }
  | {
      readonly code: -2;
    }
  | {
      readonly code: -3;
    }
  | {
      readonly code: -4;
    }
  | {
      readonly code: -5;
    }
  | {
      readonly code: -6;
    }
  | {
      readonly code: -7;
    }
  | {
      readonly code: -8;
    }
  | {
      readonly code: -9;
    }
  | {
      readonly code: -10;
    }
  | {
      readonly code: -11;
    }
  | {
      readonly code: -12;
    }
  | {
      readonly code: -14;
    }
  | {
      readonly code: -15;
    }
  | {
      readonly code: -16;
    }
  | {
      readonly code: -17;
    }
  | {
      readonly code: -18;
    };
export const TransactionResultResult = xdr.union("TransactionResultResult", {
  switchOn: xdr.lazy(() => TransactionResultCode),
  switchKey: "code",
  cases: [
    xdr.case(
      "txFeeBumpInnerSuccess",
      1,
      xdr.field(
        "innerResultPair",
        xdr.lazy(() => InnerTransactionResultPair),
      ),
    ),
    xdr.case(
      "txFeeBumpInnerFailed",
      -13,
      xdr.field(
        "innerResultPair",
        xdr.lazy(() => InnerTransactionResultPair),
      ),
    ),
    xdr.case(
      "txSuccess",
      0,
      xdr.field(
        "results",
        xdr.array(
          xdr.lazy(() => OperationResult),
          xdr.UNBOUNDED_MAX_LENGTH,
        ),
      ),
    ),
    xdr.case(
      "txFailed",
      -1,
      xdr.field(
        "results",
        xdr.array(
          xdr.lazy(() => OperationResult),
          xdr.UNBOUNDED_MAX_LENGTH,
        ),
      ),
    ),
    xdr.case("txTooEarly", -2, xdr.void()),
    xdr.case("txTooLate", -3, xdr.void()),
    xdr.case("txMissingOperation", -4, xdr.void()),
    xdr.case("txBadSeq", -5, xdr.void()),
    xdr.case("txBadAuth", -6, xdr.void()),
    xdr.case("txInsufficientBalance", -7, xdr.void()),
    xdr.case("txNoAccount", -8, xdr.void()),
    xdr.case("txInsufficientFee", -9, xdr.void()),
    xdr.case("txBadAuthExtra", -10, xdr.void()),
    xdr.case("txInternalError", -11, xdr.void()),
    xdr.case("txNotSupported", -12, xdr.void()),
    xdr.case("txBadSponsorship", -14, xdr.void()),
    xdr.case("txBadMinSeqAgeOrGap", -15, xdr.void()),
    xdr.case("txMalformed", -16, xdr.void()),
    xdr.case("txSorobanInvalid", -17, xdr.void()),
    xdr.case("txFrozenKeyAccessed", -18, xdr.void()),
  ] as const,
}) as xdr.XdrType<TransactionResultResult>;
