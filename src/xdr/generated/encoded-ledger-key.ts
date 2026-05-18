import { varOpaque } from "../types/var-opaque.js";
import { UNBOUNDED_MAX_LENGTH } from "../core/xdr-type.js";
import { BytesValue } from "../values/bytes-value.js";

export type EncodedLedgerKeyWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque EncodedLedgerKey<>;
 * ```
 */
export class EncodedLedgerKey extends BytesValue<"EncodedLedgerKey"> {
  static readonly encoding = "hex" as const;
  static readonly schema = varOpaque(UNBOUNDED_MAX_LENGTH);

  static fromXdrObject(wire: Uint8Array): EncodedLedgerKey {
    return new EncodedLedgerKey(wire);
  }
}
