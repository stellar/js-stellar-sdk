import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type IpAddrTypeWire = number;

export type IpAddrTypeName = "ipv4" | "ipv6";

/**
 * ```xdr
 * enum IPAddrType
 * {
 *     IPv4 = 0,
 *     IPv6 = 1
 * };
 * ```
 */
export class IpAddrType extends EnumValue<IpAddrTypeName> {
  static readonly ipv4 = new IpAddrType("ipv4", 0);
  static readonly ipv6 = new IpAddrType("ipv6", 1);

  private static readonly byValue: Readonly<Record<number, IpAddrType>> = {
    0: IpAddrType.ipv4,
    1: IpAddrType.ipv6,
  };

  static readonly schema = enumType("IpAddrType", {
    ipv4: 0,
    ipv6: 1,
  });

  static fromValue(value: number): IpAddrType {
    return enumLookup("IpAddrType", IpAddrType.byValue, value) as IpAddrType;
  }

  static fromName(name: IpAddrTypeName): IpAddrType {
    switch (name) {
      case "ipv4":
        return IpAddrType.ipv4;
      case "ipv6":
        return IpAddrType.ipv6;
      default:
        throw new XdrError(`IpAddrType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): IpAddrType {
    return IpAddrType.fromValue(wire);
  }
}
