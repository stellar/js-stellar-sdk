// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SignerKey } from "./signer-key.js";
export interface Signer {
  readonly key: SignerKey;
  readonly weight: number;
}
export const Signer = xdr.struct("Signer", {
  key: xdr.lazy(() => SignerKey),
  weight: xdr.uint32(),
}) as xdr.XdrType<Signer>;
