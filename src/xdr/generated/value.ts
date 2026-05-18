import { varOpaque } from "../types/var-opaque.js";
import { UNBOUNDED_MAX_LENGTH } from "../core/xdr-type.js";
import { BytesValue } from "../values/bytes-value.js";

export type ValueWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque Value<>;
 * ```
 */
export class Value extends BytesValue<"Value"> {
  static readonly encoding = "hex" as const;
  static readonly schema = varOpaque(UNBOUNDED_MAX_LENGTH);

  static fromXdrObject(wire: Uint8Array): Value {
    return new Value(wire);
  }
}
