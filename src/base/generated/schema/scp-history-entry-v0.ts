// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerSCPMessages } from "./ledger-scp-messages.js";
import { SCPQuorumSet } from "./scp-quorum-set.js";
export interface SCPHistoryEntryV0 {
  readonly quorumSets: SCPQuorumSet[];
  readonly ledgerMessages: LedgerSCPMessages;
}
export const SCPHistoryEntryV0 = xdr.struct("SCPHistoryEntryV0", {
  quorumSets: xdr.array(
    xdr.lazy(() => SCPQuorumSet),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  ledgerMessages: xdr.lazy(() => LedgerSCPMessages),
}) as xdr.XdrType<SCPHistoryEntryV0>;
