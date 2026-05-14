// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Value } from "./value.js";
export interface SCPBallot {
  readonly counter: number;
  readonly value: Value;
}
export const SCPBallot = xdr.struct("SCPBallot", {
  counter: xdr.uint32(),
  value: xdr.lazy(() => Value),
}) as xdr.XdrType<SCPBallot>;
