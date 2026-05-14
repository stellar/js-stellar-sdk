// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { CryptoKeyType } from "./crypto-key-type.js";
import { MuxedAccountMed25519 } from "./muxed-account-med25519.js";
import { uint256 } from "./uint256.js";
export type MuxedAccount =
  | {
      readonly type: 0;
      readonly ed25519: uint256;
    }
  | {
      readonly type: 256;
      readonly med25519: MuxedAccountMed25519;
    };
export const MuxedAccount = xdr.union("MuxedAccount", {
  switchOn: xdr.lazy(() => CryptoKeyType),
  switchKey: "type",
  cases: [
    xdr.case(
      "keyTypeEd25519",
      0,
      xdr.field(
        "ed25519",
        xdr.lazy(() => uint256),
      ),
    ),
    xdr.case(
      "keyTypeMuxedEd25519",
      256,
      xdr.field(
        "med25519",
        xdr.lazy(() => MuxedAccountMed25519),
      ),
    ),
  ] as const,
}) as xdr.XdrType<MuxedAccount>;
