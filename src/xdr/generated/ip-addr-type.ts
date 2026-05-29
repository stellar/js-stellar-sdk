import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("IpAddrType", {
    ipv4: 0,
    ipv6: 1,
  });

  static fromValue(value: number): IpAddrType {
    return enumFromValue("IpAddrType", IpAddrType.schema, IpAddrType, value);
  }

  static fromName(name: IpAddrTypeName): IpAddrType {
    return enumFromName("IpAddrType", IpAddrType, name);
  }

  static fromXdrObject(wire: number): IpAddrType {
    return IpAddrType.fromValue(wire);
  }
}
