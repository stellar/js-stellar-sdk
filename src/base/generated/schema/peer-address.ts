// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PeerAddressIp } from "./peer-address-ip.js";
export interface PeerAddress {
  readonly ip: PeerAddressIp;
  readonly port: number;
  readonly numFailures: number;
}
export const PeerAddress = xdr.struct("PeerAddress", {
  ip: xdr.lazy(() => PeerAddressIp),
  port: xdr.uint32(),
  numFailures: xdr.uint32(),
}) as xdr.XdrType<PeerAddress>;
