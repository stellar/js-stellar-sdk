import { struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Uint256Bytes, type Uint256BytesWire } from "./uint256-bytes.js";

export interface MuxedEd25519AccountWire {
  id: bigint;
  ed25519: Uint256BytesWire;
}

/**
 * ```xdr
 * struct MuxedEd25519Account
 * {
 *     uint64 id;
 *     uint256 ed25519;
 * };
 * ```
 */
export class MuxedEd25519Account extends XdrValue {
  readonly id: bigint;
  readonly ed25519: Uint256Bytes;

  static readonly schema: XdrType<MuxedEd25519AccountWire> = struct(
    "MuxedEd25519Account",
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

  toXdrObject(): MuxedEd25519AccountWire {
    return {
      id: this.id,
      ed25519: this.ed25519.toXdrObject(),
    };
  }

  static fromXdrObject(wire: MuxedEd25519AccountWire): MuxedEd25519Account {
    return new MuxedEd25519Account({
      id: wire.id,
      ed25519: Uint256Bytes.fromXdrObject(wire.ed25519),
    });
  }
}
