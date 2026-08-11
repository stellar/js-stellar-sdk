import { opaque } from "@stellar/js-xdr";
import { BytesValue } from "../values/bytes-value.js";

export type AssetCode12Wire = Uint8Array;

/**
 * ```xdr
 * typedef opaque AssetCode12[12];
 * ```
 */
export class AssetCode12 extends BytesValue<"AssetCode12"> {
  static readonly byteLength = 12;
  static readonly padTo = 12;
  static readonly encoding = "ascii" as const;
  static readonly schema = opaque(12, "AssetCode12");

  static fromXdrObject(wire: Uint8Array): AssetCode12 {
    return new AssetCode12(wire);
  }
}
