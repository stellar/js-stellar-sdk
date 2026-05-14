// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { SequenceNumber } from "./sequence-number.js";
export interface HashIdPreimageOperationId {
  readonly sourceAccount: AccountId;
  readonly seqNum: SequenceNumber;
  readonly opNum: number;
}
export const HashIdPreimageOperationId = xdr.struct(
  "HashIDPreimageOperationId",
  {
    sourceAccount: xdr.lazy(() => AccountId),
    seqNum: xdr.lazy(() => SequenceNumber),
    opNum: xdr.uint32(),
  },
) as xdr.XdrType<HashIdPreimageOperationId>;
