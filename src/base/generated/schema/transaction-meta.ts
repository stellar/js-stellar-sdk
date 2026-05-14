// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { OperationMeta } from "./operation-meta.js";
import { TransactionMetaV1 } from "./transaction-meta-v1.js";
import { TransactionMetaV2 } from "./transaction-meta-v2.js";
import { TransactionMetaV3 } from "./transaction-meta-v3.js";
import { TransactionMetaV4 } from "./transaction-meta-v4.js";
export type TransactionMeta =
  | {
      readonly v: 0;
      readonly operations: OperationMeta[];
    }
  | {
      readonly v: 1;
      readonly v1: TransactionMetaV1;
    }
  | {
      readonly v: 2;
      readonly v2: TransactionMetaV2;
    }
  | {
      readonly v: 3;
      readonly v3: TransactionMetaV3;
    }
  | {
      readonly v: 4;
      readonly v4: TransactionMetaV4;
    };
export const TransactionMeta = xdr.union("TransactionMeta", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case(
      "operations",
      0,
      xdr.field(
        "operations",
        xdr.array(
          xdr.lazy(() => OperationMeta),
          xdr.UNBOUNDED_MAX_LENGTH,
        ),
      ),
    ),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => TransactionMetaV1),
      ),
    ),
    xdr.case(
      "v2",
      2,
      xdr.field(
        "v2",
        xdr.lazy(() => TransactionMetaV2),
      ),
    ),
    xdr.case(
      "v3",
      3,
      xdr.field(
        "v3",
        xdr.lazy(() => TransactionMetaV3),
      ),
    ),
    xdr.case(
      "v4",
      4,
      xdr.field(
        "v4",
        xdr.lazy(() => TransactionMetaV4),
      ),
    ),
  ] as const,
}) as xdr.XdrType<TransactionMeta>;
