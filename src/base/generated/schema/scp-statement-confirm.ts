// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { SCPBallot } from "./scp-ballot.js";
export interface SCPStatementConfirm {
  readonly ballot: SCPBallot;
  readonly nPrepared: number;
  readonly nCommit: number;
  readonly nH: number;
  readonly quorumSetHash: Hash;
}
export const SCPStatementConfirm = xdr.struct("SCPStatementConfirm", {
  ballot: xdr.lazy(() => SCPBallot),
  nPrepared: xdr.uint32(),
  nCommit: xdr.uint32(),
  nH: xdr.uint32(),
  quorumSetHash: xdr.lazy(() => Hash),
}) as xdr.XdrType<SCPStatementConfirm>;
