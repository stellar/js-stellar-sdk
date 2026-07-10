import { opaque, struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface MuxedAccountMed25519Wire {
  id: bigint;
  ed25519: Uint8Array;
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
  readonly ed25519: Uint8Array;

  static readonly schema: XdrType<MuxedAccountMed25519Wire> = struct(
    "MuxedAccountMed25519",
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

  toXdrObject(): MuxedAccountMed25519Wire {
    return {
      id: this.id,
      ed25519: this.ed25519,
    };
  }

  static fromXdrObject(wire: MuxedAccountMed25519Wire): MuxedAccountMed25519 {
    return new MuxedAccountMed25519({
      id: wire.id,
      ed25519: wire.ed25519,
    });
  }
}
