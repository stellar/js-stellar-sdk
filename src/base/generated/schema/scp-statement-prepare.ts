// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { SCPBallot } from "./scp-ballot.js";
export interface SCPStatementPrepare {
  readonly quorumSetHash: Hash;
  readonly ballot: SCPBallot;
  readonly prepared: SCPBallot | null;
  readonly preparedPrime: SCPBallot | null;
  readonly nC: number;
  readonly nH: number;
}
export const SCPStatementPrepare = xdr.struct("SCPStatementPrepare", {
  quorumSetHash: xdr.lazy(() => Hash),
  ballot: xdr.lazy(() => SCPBallot),
  prepared: xdr.option(xdr.lazy(() => SCPBallot)),
  preparedPrime: xdr.option(xdr.lazy(() => SCPBallot)),
  nC: xdr.uint32(),
  nH: xdr.uint32(),
}) as xdr.XdrType<SCPStatementPrepare>;
