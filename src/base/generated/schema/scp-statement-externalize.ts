// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { SCPBallot } from "./scp-ballot.js";
export interface SCPStatementExternalize {
  readonly commit: SCPBallot;
  readonly nH: number;
  readonly commitQuorumSetHash: Hash;
}
export const SCPStatementExternalize = xdr.struct("SCPStatementExternalize", {
  commit: xdr.lazy(() => SCPBallot),
  nH: xdr.uint32(),
  commitQuorumSetHash: xdr.lazy(() => Hash),
}) as xdr.XdrType<SCPStatementExternalize>;
