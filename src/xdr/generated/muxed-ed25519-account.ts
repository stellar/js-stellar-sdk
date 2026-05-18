import { struct } from "../types/struct.js";
import { uint64 } from "../types/uint64.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface MuxedEd25519AccountWire {
  id: bigint;
  ed25519: Uint8Array;
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
  readonly ed25519: Uint8Array;

  static readonly schema: XdrType<MuxedEd25519AccountWire> = struct(
    "MuxedEd25519Account",
    {
      id: uint64(),
      ed25519: opaque(32),
    },
  );

  constructor(input: { id: bigint; ed25519: Uint8Array }) {
    super();
    this.id = input.id;
    this.ed25519 = input.ed25519;
  }

  toXdrObject(): MuxedEd25519AccountWire {
    return {
      id: this.id,
      ed25519: this.ed25519,
    };
  }

  static fromXdrObject(wire: MuxedEd25519AccountWire): MuxedEd25519Account {
    return new MuxedEd25519Account({
      id: wire.id,
      ed25519: wire.ed25519,
    });
  }
}
