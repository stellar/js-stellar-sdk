import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import { string as string_ } from "../types/string.js";
import { int32 } from "../types/int32.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { AuthCert, type AuthCertWire } from "./auth-cert.js";

export interface HelloWire {
  ledgerVersion: number;
  overlayVersion: number;
  overlayMinVersion: number;
  networkId: HashWire;
  versionStr: string;
  listeningPort: number;
  peerId: PublicKeyWire;
  cert: AuthCertWire;
  nonce: Uint8Array;
}

/**
 * ```xdr
 * struct Hello
 * {
 *     uint32 ledgerVersion;
 *     uint32 overlayVersion;
 *     uint32 overlayMinVersion;
 *     Hash networkID;
 *     string versionStr<100>;
 *     int listeningPort;
 *     NodeID peerID;
 *     AuthCert cert;
 *     uint256 nonce;
 * };
 * ```
 */
export class Hello extends XdrValue {
  readonly ledgerVersion: number;
  readonly overlayVersion: number;
  readonly overlayMinVersion: number;
  readonly networkId: Hash;
  readonly versionStr: string;
  readonly listeningPort: number;
  readonly peerId: PublicKey;
  readonly cert: AuthCert;
  readonly nonce: Uint8Array;

  static readonly schema: XdrType<HelloWire> = struct("Hello", {
    ledgerVersion: uint32(),
    overlayVersion: uint32(),
    overlayMinVersion: uint32(),
    networkId: Hash.schema,
    versionStr: string_(100),
    listeningPort: int32(),
    peerId: PublicKey.schema,
    cert: AuthCert.schema,
    nonce: opaque(32),
  });

  constructor(input: {
    ledgerVersion: number;
    overlayVersion: number;
    overlayMinVersion: number;
    networkId: Hash | Uint8Array | string;
    versionStr: string;
    listeningPort: number;
    peerId: PublicKey;
    cert: AuthCert;
    nonce: Uint8Array;
  }) {
    super();
    this.ledgerVersion = input.ledgerVersion;
    this.overlayVersion = input.overlayVersion;
    this.overlayMinVersion = input.overlayMinVersion;
    this.networkId =
      input.networkId instanceof Hash
        ? input.networkId
        : new Hash(input.networkId);
    this.versionStr = input.versionStr;
    this.listeningPort = input.listeningPort;
    this.peerId = input.peerId;
    this.cert = input.cert;
    this.nonce = input.nonce;
  }

  toXdrObject(): HelloWire {
    return {
      ledgerVersion: this.ledgerVersion,
      overlayVersion: this.overlayVersion,
      overlayMinVersion: this.overlayMinVersion,
      networkId: this.networkId.toXdrObject(),
      versionStr: this.versionStr,
      listeningPort: this.listeningPort,
      peerId: this.peerId.toXdrObject(),
      cert: this.cert.toXdrObject(),
      nonce: this.nonce,
    };
  }

  static fromXdrObject(wire: HelloWire): Hello {
    return new Hello({
      ledgerVersion: wire.ledgerVersion,
      overlayVersion: wire.overlayVersion,
      overlayMinVersion: wire.overlayMinVersion,
      networkId: Hash.fromXdrObject(wire.networkId),
      versionStr: wire.versionStr,
      listeningPort: wire.listeningPort,
      peerId: PublicKey.fromXdrObject(wire.peerId),
      cert: AuthCert.fromXdrObject(wire.cert),
      nonce: wire.nonce,
    });
  }
}
