// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { uint256 } from "./uint256.js";
export interface SignerKeyEd25519SignedPayload {
  readonly ed25519: uint256;
  readonly payload: Uint8Array;
}
export const SignerKeyEd25519SignedPayload = xdr.struct(
  "SignerKeyEd25519SignedPayload",
  {
    ed25519: xdr.lazy(() => uint256),
    payload: xdr.varOpaque(64),
  },
) as xdr.XdrType<SignerKeyEd25519SignedPayload>;
