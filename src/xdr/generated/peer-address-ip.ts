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

export type PeerAddressIpVariantName = "iPv4" | "iPv6";

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
      case_("iPv4", 0, field("ipv4", opaque(4))),
      case_("iPv6", 1, field("ipv6", opaque(16))),
    ],
  });

  static iPv4(ipv4: Uint8Array): PeerAddressIpIPv4 {
    return new PeerAddressIpIPv4(ipv4);
  }

  static iPv6(ipv6: Uint8Array): PeerAddressIpIPv6 {
    return new PeerAddressIpIPv6(ipv6);
  }

  static fromXdrObject(wire: PeerAddressIpWire): PeerAddressIp {
    switch (wire.type) {
      case 0:
        return new PeerAddressIpIPv4(wire.ipv4);
      case 1:
        return new PeerAddressIpIPv6(wire.ipv6);
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete PeerAddressIp variant.
   * Use this instead of `instanceof PeerAddressIp`: the exported `PeerAddressIp` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `PeerAddressIp.is(x)` narrows to the union.
   */
  static is(value: unknown): value is PeerAddressIp {
    return value instanceof PeerAddressIpBase;
  }

  abstract toXdrObject(): PeerAddressIpWire;
}

export class PeerAddressIpIPv4 extends PeerAddressIpBase {
  readonly type = "iPv4" as const;
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

export class PeerAddressIpIPv6 extends PeerAddressIpBase {
  readonly type = "iPv6" as const;
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

export type PeerAddressIp = PeerAddressIpIPv4 | PeerAddressIpIPv6;
export const PeerAddressIp = PeerAddressIpBase;
