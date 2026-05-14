// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountEntryExt } from "./account-entry-ext.js";
import { AccountId } from "./account-id.js";
import { SequenceNumber } from "./sequence-number.js";
import { Signer } from "./signer.js";
import { string32 } from "./string32.js";
import { Thresholds } from "./thresholds.js";
export interface AccountEntry {
  readonly accountId: AccountId;
  readonly balance: bigint;
  readonly seqNum: SequenceNumber;
  readonly numSubEntries: number;
  readonly inflationDest: AccountId | null;
  readonly flags: number;
  readonly homeDomain: string32;
  readonly thresholds: Thresholds;
  readonly signers: Signer[];
  readonly ext: AccountEntryExt;
}
export const AccountEntry = xdr.struct("AccountEntry", {
  accountId: xdr.lazy(() => AccountId),
  balance: xdr.int64(),
  seqNum: xdr.lazy(() => SequenceNumber),
  numSubEntries: xdr.uint32(),
  inflationDest: xdr.option(xdr.lazy(() => AccountId)),
  flags: xdr.uint32(),
  homeDomain: xdr.lazy(() => string32),
  thresholds: xdr.lazy(() => Thresholds),
  signers: xdr.array(
    xdr.lazy(() => Signer),
    20,
  ),
  ext: xdr.lazy(() => AccountEntryExt),
}) as xdr.XdrType<AccountEntry>;
