// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Curve25519Public } from "./curve25519-public.js";
import { Signature } from "./signature.js";
export interface AuthCert {
  readonly pubkey: Curve25519Public;
  readonly expiration: bigint;
  readonly sig: Signature;
}
export const AuthCert = xdr.struct("AuthCert", {
  pubkey: xdr.lazy(() => Curve25519Public),
  expiration: xdr.uint64(),
  sig: xdr.lazy(() => Signature),
}) as xdr.XdrType<AuthCert>;
