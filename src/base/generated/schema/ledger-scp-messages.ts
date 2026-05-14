// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCPEnvelope } from "./scp-envelope.js";
export interface LedgerSCPMessages {
  readonly ledgerSeq: number;
  readonly messages: SCPEnvelope[];
}
export const LedgerSCPMessages = xdr.struct("LedgerSCPMessages", {
  ledgerSeq: xdr.uint32(),
  messages: xdr.array(
    xdr.lazy(() => SCPEnvelope),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<LedgerSCPMessages>;
