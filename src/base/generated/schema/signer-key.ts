// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SignerKeyEd25519SignedPayload } from "./signer-key-ed25519-signed-payload.js";
import { SignerKeyType } from "./signer-key-type.js";
import { uint256 } from "./uint256.js";
export type SignerKey =
  | {
      readonly type: 0;
      readonly ed25519: uint256;
    }
  | {
      readonly type: 1;
      readonly preAuthTx: uint256;
    }
  | {
      readonly type: 2;
      readonly hashX: uint256;
    }
  | {
      readonly type: 3;
      readonly ed25519SignedPayload: SignerKeyEd25519SignedPayload;
    };
export const SignerKey = xdr.union("SignerKey", {
  switchOn: xdr.lazy(() => SignerKeyType),
  switchKey: "type",
  cases: [
    xdr.case(
      "signerKeyTypeEd25519",
      0,
      xdr.field(
        "ed25519",
        xdr.lazy(() => uint256),
      ),
    ),
    xdr.case(
      "signerKeyTypePreAuthTx",
      1,
      xdr.field(
        "preAuthTx",
        xdr.lazy(() => uint256),
      ),
    ),
    xdr.case(
      "signerKeyTypeHashX",
      2,
      xdr.field(
        "hashX",
        xdr.lazy(() => uint256),
      ),
    ),
    xdr.case(
      "signerKeyTypeEd25519SignedPayload",
      3,
      xdr.field(
        "ed25519SignedPayload",
        xdr.lazy(() => SignerKeyEd25519SignedPayload),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SignerKey>;
