import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PeerAddressIp, type PeerAddressIpWire } from "./peer-address-ip.js";

export interface PeerAddressWire {
  ip: PeerAddressIpWire;
  port: number;
  numFailures: number;
}

/**
 * ```xdr
 * struct PeerAddress
 * {
 *     union switch (IPAddrType type)
 *     {
 *     case IPv4:
 *         opaque ipv4[4];
 *     case IPv6:
 *         opaque ipv6[16];
 *     }
 *     ip;
 *     uint32 port;
 *     uint32 numFailures;
 * };
 * ```
 */
export class PeerAddress extends XdrValue {
  readonly ip: PeerAddressIp;
  readonly port: number;
  readonly numFailures: number;

  static readonly schema: XdrType<PeerAddressWire> = struct("PeerAddress", {
    ip: PeerAddressIp.schema,
    port: uint32(),
    numFailures: uint32(),
  });

  constructor(input: { ip: PeerAddressIp; port: number; numFailures: number }) {
    super();
    this.ip = input.ip;
    this.port = input.port;
    this.numFailures = input.numFailures;
  }

  toXdrObject(): PeerAddressWire {
    return {
      ip: this.ip.toXdrObject(),
      port: this.port,
      numFailures: this.numFailures,
    };
  }

  static fromXdrObject(wire: PeerAddressWire): PeerAddress {
    return new PeerAddress({
      ip: PeerAddressIp.fromXdrObject(wire.ip),
      port: wire.port,
      numFailures: wire.numFailures,
    });
  }
}
