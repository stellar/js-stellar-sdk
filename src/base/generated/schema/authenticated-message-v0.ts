// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { HmacSha256Mac } from "./hmac-sha256-mac.js";
import { StellarMessage } from "./stellar-message.js";
export interface AuthenticatedMessageV0 {
  readonly sequence: bigint;
  readonly message: StellarMessage;
  readonly mac: HmacSha256Mac;
}
export const AuthenticatedMessageV0 = xdr.struct("AuthenticatedMessageV0", {
  sequence: xdr.uint64(),
  message: xdr.lazy(() => StellarMessage),
  mac: xdr.lazy(() => HmacSha256Mac),
}) as xdr.XdrType<AuthenticatedMessageV0>;
