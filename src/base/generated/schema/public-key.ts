// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PublicKeyType } from "./public-key-type.js";
import { uint256 } from "./uint256.js";
export type PublicKey = {
  readonly type: 0;
  readonly ed25519: uint256;
};
export const PublicKey = xdr.union("PublicKey", {
  switchOn: xdr.lazy(() => PublicKeyType),
  switchKey: "type",
  cases: [
    xdr.case(
      "publicKeyTypeEd25519",
      0,
      xdr.field(
        "ed25519",
        xdr.lazy(() => uint256),
      ),
    ),
  ] as const,
}) as xdr.XdrType<PublicKey>;
