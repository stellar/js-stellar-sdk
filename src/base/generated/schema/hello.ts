// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AuthCert } from "./auth-cert.js";
import { Hash } from "./hash.js";
import { NodeId } from "./node-id.js";
import { uint256 } from "./uint256.js";
export interface Hello {
  readonly ledgerVersion: number;
  readonly overlayVersion: number;
  readonly overlayMinVersion: number;
  readonly networkId: Hash;
  readonly versionStr: string;
  readonly listeningPort: number;
  readonly peerId: NodeId;
  readonly cert: AuthCert;
  readonly nonce: uint256;
}
export const Hello = xdr.struct("Hello", {
  ledgerVersion: xdr.uint32(),
  overlayVersion: xdr.uint32(),
  overlayMinVersion: xdr.uint32(),
  networkId: xdr.lazy(() => Hash),
  versionStr: xdr.string(100),
  listeningPort: xdr.int32(),
  peerId: xdr.lazy(() => NodeId),
  cert: xdr.lazy(() => AuthCert),
  nonce: xdr.lazy(() => uint256),
}) as xdr.XdrType<Hello>;
