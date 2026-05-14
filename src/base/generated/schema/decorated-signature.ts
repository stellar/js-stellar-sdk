// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Signature } from "./signature.js";
import { SignatureHint } from "./signature-hint.js";
export interface DecoratedSignature {
  readonly hint: SignatureHint;
  readonly signature: Signature;
}
export const DecoratedSignature = xdr.struct("DecoratedSignature", {
  hint: xdr.lazy(() => SignatureHint),
  signature: xdr.lazy(() => Signature),
}) as xdr.XdrType<DecoratedSignature>;
