// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { Value } from "./value.js";
export interface SCPNomination {
  readonly quorumSetHash: Hash;
  readonly votes: Value[];
  readonly accepted: Value[];
}
export const SCPNomination = xdr.struct("SCPNomination", {
  quorumSetHash: xdr.lazy(() => Hash),
  votes: xdr.array(
    xdr.lazy(() => Value),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  accepted: xdr.array(
    xdr.lazy(() => Value),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<SCPNomination>;
