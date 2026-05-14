// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { SorobanAuthorizedInvocation } from "./soroban-authorized-invocation.js";
export interface HashIdPreimageSorobanAuthorization {
  readonly networkId: Hash;
  readonly nonce: bigint;
  readonly signatureExpirationLedger: number;
  readonly invocation: SorobanAuthorizedInvocation;
}
export const HashIdPreimageSorobanAuthorization = xdr.struct(
  "HashIDPreimageSorobanAuthorization",
  {
    networkId: xdr.lazy(() => Hash),
    nonce: xdr.int64(),
    signatureExpirationLedger: xdr.uint32(),
    invocation: xdr.lazy(() => SorobanAuthorizedInvocation),
  },
) as xdr.XdrType<HashIdPreimageSorobanAuthorization>;
