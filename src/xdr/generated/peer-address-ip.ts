/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { IpAddrType } from "./ip-addr-type.js";

export type PeerAddressIpWire =
  | { type: 0; ipv4: Uint8Array }
  | { type: 1; ipv6: Uint8Array };

export type PeerAddressIpVariantName = "ipv4" | "ipv6";

/**
 * ```xdr
 * union switch (IPAddrType type)
 *     {
 *     case IPv4:
 *         opaque ipv4[4];
 *     case IPv6:
 *         opaque ipv6[16];
 *     }
 * ```
 */
abstract class PeerAddressIpBase extends XdrValue {
  abstract readonly type: PeerAddressIpVariantName;

  static readonly schema: XdrType<PeerAddressIpWire> = union("PeerAddressIp", {
    switchOn: IpAddrType.schema,
    cases: [
      case_("ipv4", 0, field("ipv4", opaque(4))),
      case_("ipv6", 1, field("ipv6", opaque(16))),
    ],
  });

  static ipv4(ipv4: Uint8Array): PeerAddressIpIpv4 {
    return new PeerAddressIpIpv4(ipv4);
  }

  static ipv6(ipv6: Uint8Array): PeerAddressIpIpv6 {
    return new PeerAddressIpIpv6(ipv6);
  }

  static fromXdrObject(wire: PeerAddressIpWire): PeerAddressIp {
    switch (wire.type) {
      case 0:
        return new PeerAddressIpIpv4(wire.ipv4);
      case 1:
        return new PeerAddressIpIpv6(wire.ipv6);
    }
  }

  abstract toXdrObject(): PeerAddressIpWire;
}

export class PeerAddressIpIpv4 extends PeerAddressIpBase {
  readonly type = "ipv4" as const;
  readonly ipv4: Uint8Array;

  constructor(ipv4: Uint8Array) {
    super();
    this.ipv4 = ipv4;
  }

  get value(): Uint8Array {
    return this.ipv4;
  }

  toXdrObject(): Extract<PeerAddressIpWire, { type: 0 }> {
    return { type: 0, ipv4: this.ipv4 };
  }
}

export class PeerAddressIpIpv6 extends PeerAddressIpBase {
  readonly type = "ipv6" as const;
  readonly ipv6: Uint8Array;

  constructor(ipv6: Uint8Array) {
    super();
    this.ipv6 = ipv6;
  }

  get value(): Uint8Array {
    return this.ipv6;
  }

  toXdrObject(): Extract<PeerAddressIpWire, { type: 1 }> {
    return { type: 1, ipv6: this.ipv6 };
  }
}

export type PeerAddressIp = PeerAddressIpIpv4 | PeerAddressIpIpv6;
export const PeerAddressIp = PeerAddressIpBase;
