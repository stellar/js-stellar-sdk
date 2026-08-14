import { struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Uint256Bytes, type Uint256BytesWire } from "./uint256-bytes.js";

export interface MuxedAccountMed25519Wire {
  id: bigint;
  ed25519: Uint256BytesWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         uint64 id;
 *         uint256 ed25519;
 *     }
 * ```
 */
export class MuxedAccountMed25519 extends XdrValue {
  readonly id: bigint;
  readonly ed25519: Uint256Bytes;

  static readonly schema: XdrType<MuxedAccountMed25519Wire> = struct(
    "MuxedAccountMed25519",
    {
      id: uint64(),
      ed25519: Uint256Bytes.schema,
    },
  );

  constructor(input: {
    id: bigint;
    ed25519: Uint256Bytes | Uint8Array | string;
  }) {
    super();
    this.id = input.id;
    this.ed25519 =
      input.ed25519 instanceof Uint256Bytes
        ? input.ed25519
        : new Uint256Bytes(input.ed25519);
  }

  toXdrObject(): MuxedAccountMed25519Wire {
    return {
      id: this.id,
      ed25519: this.ed25519.toXdrObject(),
    };
  }

  static fromXdrObject(wire: MuxedAccountMed25519Wire): MuxedAccountMed25519 {
    return new MuxedAccountMed25519({
      id: wire.id,
      ed25519: Uint256Bytes.fromXdrObject(wire.ed25519),
    });
  }
}
