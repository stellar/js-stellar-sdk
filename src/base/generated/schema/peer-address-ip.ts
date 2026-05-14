// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { IPAddrType } from "./ip-addr-type.js";
export type PeerAddressIp =
  | {
      readonly type: 0;
      readonly ipv4: Uint8Array;
    }
  | {
      readonly type: 1;
      readonly ipv6: Uint8Array;
    };
export const PeerAddressIp = xdr.union("PeerAddressIp", {
  switchOn: xdr.lazy(() => IPAddrType),
  switchKey: "type",
  cases: [
    xdr.case("ipv4", 0, xdr.field("ipv4", xdr.opaque(4))),
    xdr.case("ipv6", 1, xdr.field("ipv6", xdr.opaque(16))),
  ] as const,
}) as xdr.XdrType<PeerAddressIp>;
