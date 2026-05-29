import { varOpaque } from "../types/var-opaque.js";
import { BytesValue } from "../values/bytes-value.js";

export type UpgradeTypeWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque UpgradeType<128>;
 * ```
 */
export class UpgradeType extends BytesValue<"UpgradeType"> {
  static readonly encoding = "hex" as const;
  static readonly schema = varOpaque(128, "UpgradeType");

  static fromXdrObject(wire: Uint8Array): UpgradeType {
    return new UpgradeType(wire);
  }
}
