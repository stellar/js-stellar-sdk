import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type IpAddrTypeWire = number;

export type IpAddrTypeName = "iPv4" | "iPv6";

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
  static readonly iPv4 = new IpAddrType("iPv4", 0);
  static readonly iPv6 = new IpAddrType("iPv6", 1);

  static readonly schema = enumType("IpAddrType", {
    iPv4: 0,
    iPv6: 1,
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
