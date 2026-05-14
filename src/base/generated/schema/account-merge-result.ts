// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountMergeResultCode } from "./account-merge-result-code.js";
export type AccountMergeResult =
  | {
      readonly code: 0;
      readonly sourceAccountBalance: bigint;
    }
  | {
      readonly code: -1;
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
    };
export const AccountMergeResult = xdr.union("AccountMergeResult", {
  switchOn: xdr.lazy(() => AccountMergeResultCode),
  switchKey: "code",
  cases: [
    xdr.case(
      "accountMergeSuccess",
      0,
      xdr.field("sourceAccountBalance", xdr.int64()),
    ),
    xdr.case("accountMergeMalformed", -1, xdr.void()),
    xdr.case("accountMergeNoAccount", -2, xdr.void()),
    xdr.case("accountMergeImmutableSet", -3, xdr.void()),
    xdr.case("accountMergeHasSubEntries", -4, xdr.void()),
    xdr.case("accountMergeSeqnumTooFar", -5, xdr.void()),
    xdr.case("accountMergeDestFull", -6, xdr.void()),
    xdr.case("accountMergeIsSponsor", -7, xdr.void()),
  ] as const,
}) as xdr.XdrType<AccountMergeResult>;
