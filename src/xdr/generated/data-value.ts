import { varOpaque } from "@stellar/js-xdr";
import { BytesValue } from "../values/bytes-value.js";

export type DataValueWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque DataValue<64>;
 * ```
 */
export class DataValue extends BytesValue<"DataValue"> {
  static readonly encoding = "hex" as const;
  static readonly schema = varOpaque(64, "DataValue");

  static fromXdrObject(wire: Uint8Array): DataValue {
    return new DataValue(wire);
  }
}
