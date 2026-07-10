import { opaque } from "@stellar/js-xdr";
import { BytesValue } from "../values/bytes-value.js";

export type AssetCode4Wire = Uint8Array;

/**
 * ```xdr
 * typedef opaque AssetCode4[4];
 * ```
 */
export class AssetCode4 extends BytesValue<"AssetCode4"> {
  static readonly byteLength = 4;
  static readonly encoding = "hex" as const;
  static readonly schema = opaque(4, "AssetCode4");

  static fromXdrObject(wire: Uint8Array): AssetCode4 {
    return new AssetCode4(wire);
  }
}
