import { varOpaque } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH } from "@stellar/js-xdr";
import { BytesValue } from "../values/bytes-value.js";

export type ScBytesWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque SCBytes<>;
 * ```
 */
export class ScBytes extends BytesValue<"ScBytes"> {
  static readonly encoding = "hex" as const;
  static readonly schema = varOpaque(UNBOUNDED_MAX_LENGTH, "ScBytes");

  static fromXdrObject(wire: Uint8Array): ScBytes {
    return new ScBytes(wire);
  }
}
