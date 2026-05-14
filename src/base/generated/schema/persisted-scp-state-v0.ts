// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCPEnvelope } from "./scp-envelope.js";
import { SCPQuorumSet } from "./scp-quorum-set.js";
import { StoredTransactionSet } from "./stored-transaction-set.js";
export interface PersistedSCPStateV0 {
  readonly scpEnvelopes: SCPEnvelope[];
  readonly quorumSets: SCPQuorumSet[];
  readonly txSets: StoredTransactionSet[];
}
export const PersistedSCPStateV0 = xdr.struct("PersistedSCPStateV0", {
  scpEnvelopes: xdr.array(
    xdr.lazy(() => SCPEnvelope),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  quorumSets: xdr.array(
    xdr.lazy(() => SCPQuorumSet),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  txSets: xdr.array(
    xdr.lazy(() => StoredTransactionSet),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<PersistedSCPStateV0>;
