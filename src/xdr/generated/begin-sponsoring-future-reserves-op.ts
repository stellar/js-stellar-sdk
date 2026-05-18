import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface BeginSponsoringFutureReservesOpWire {
  sponsoredId: PublicKeyWire;
}

/**
 * ```xdr
 * struct BeginSponsoringFutureReservesOp
 * {
 *     AccountID sponsoredID;
 * };
 * ```
 */
export class BeginSponsoringFutureReservesOp extends XdrValue {
  readonly sponsoredId: PublicKey;

  static readonly schema: XdrType<BeginSponsoringFutureReservesOpWire> = struct(
    "BeginSponsoringFutureReservesOp",
    {
      sponsoredId: PublicKey.schema,
    },
  );

  constructor(input: { sponsoredId: PublicKey }) {
    super();
    this.sponsoredId = input.sponsoredId;
  }

  toXdrObject(): BeginSponsoringFutureReservesOpWire {
    return {
      sponsoredId: this.sponsoredId.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: BeginSponsoringFutureReservesOpWire,
  ): BeginSponsoringFutureReservesOp {
    return new BeginSponsoringFutureReservesOp({
      sponsoredId: PublicKey.fromXdrObject(wire.sponsoredId),
    });
  }
}
