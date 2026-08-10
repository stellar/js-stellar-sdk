import { varOpaque } from "@stellar/js-xdr";
import { BytesValue } from "../values/bytes-value.js";

export type EncryptedBodyWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque EncryptedBody<64000>;
 * ```
 */
export class EncryptedBody extends BytesValue<"EncryptedBody"> {
  static readonly encoding = "hex" as const;
  static readonly schema = varOpaque(64000, "EncryptedBody");

  static fromXdrObject(wire: Uint8Array): EncryptedBody {
    return new EncryptedBody(wire);
  }
}
