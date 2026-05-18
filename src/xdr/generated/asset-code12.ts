import { opaque } from "../types/opaque.js";
import { BytesValue } from "../values/bytes-value.js";

export type AssetCode12Wire = Uint8Array;

/**
 * ```xdr
 * typedef opaque AssetCode12[12];
 * ```
 */
export class AssetCode12 extends BytesValue<"AssetCode12"> {
  static readonly byteLength = 12;
  static readonly encoding = "hex" as const;
  static readonly schema = opaque(12);

  static fromXdrObject(wire: Uint8Array): AssetCode12 {
    return new AssetCode12(wire);
  }
}
