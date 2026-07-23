import { varOpaque } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH } from "@stellar/js-xdr";
import { BytesValue } from "../values/bytes-value.js";

export type ValueWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque Value<>;
 * ```
 */
export class Value extends BytesValue<"Value"> {
  static readonly encoding = "hex" as const;
  static readonly schema = varOpaque(UNBOUNDED_MAX_LENGTH, "Value");

  static fromXdrObject(wire: Uint8Array): Value {
    return new Value(wire);
  }
}
