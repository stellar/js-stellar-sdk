// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCPEnvelope } from "./scp-envelope.js";
import { SCPQuorumSet } from "./scp-quorum-set.js";
export interface PersistedSCPStateV1 {
  readonly scpEnvelopes: SCPEnvelope[];
  readonly quorumSets: SCPQuorumSet[];
}
export const PersistedSCPStateV1 = xdr.struct("PersistedSCPStateV1", {
  scpEnvelopes: xdr.array(
    xdr.lazy(() => SCPEnvelope),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  quorumSets: xdr.array(
    xdr.lazy(() => SCPQuorumSet),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<PersistedSCPStateV1>;
