import { opaque } from "../types/opaque.js";
import { BytesValue } from "../values/bytes-value.js";

export type ThresholdsWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque Thresholds[4];
 * ```
 */
export class Thresholds extends BytesValue<"Thresholds"> {
  static readonly byteLength = 4;
  static readonly encoding = "hex" as const;
  static readonly schema = opaque(4, "Thresholds");

  static fromXdrObject(wire: Uint8Array): Thresholds {
    return new Thresholds(wire);
  }
}
