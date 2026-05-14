// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { MemoType } from "./memo-type.js";
export type Memo =
  | {
      readonly type: 0;
    }
  | {
      readonly type: 1;
      readonly text: string;
    }
  | {
      readonly type: 2;
      readonly id: bigint;
    }
  | {
      readonly type: 3;
      readonly hash: Hash;
    }
  | {
      readonly type: 4;
      readonly retHash: Hash;
    };
export const Memo = xdr.union("Memo", {
  switchOn: xdr.lazy(() => MemoType),
  switchKey: "type",
  cases: [
    xdr.case("memoNone", 0, xdr.void()),
    xdr.case("memoText", 1, xdr.field("text", xdr.string(28))),
    xdr.case("memoId", 2, xdr.field("id", xdr.uint64())),
    xdr.case(
      "memoHash",
      3,
      xdr.field(
        "hash",
        xdr.lazy(() => Hash),
      ),
    ),
    xdr.case(
      "memoReturn",
      4,
      xdr.field(
        "retHash",
        xdr.lazy(() => Hash),
      ),
    ),
  ] as const,
}) as xdr.XdrType<Memo>;
