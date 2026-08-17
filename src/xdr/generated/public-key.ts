/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKeyType } from "./public-key-type.js";
import { Uint256Bytes, type Uint256BytesWire } from "./uint256-bytes.js";

export type PublicKeyWire = { type: 0; ed25519: Uint256BytesWire };

export type PublicKeyVariantName = "publicKeyTypeEd25519";

/**
 * ```xdr
 * union PublicKey switch (PublicKeyType type)
 * {
 * case PUBLIC_KEY_TYPE_ED25519:
 *     uint256 ed25519;
 * };
 * ```
 */
abstract class PublicKeyBase extends XdrValue {
  abstract readonly type: PublicKeyVariantName;

  static readonly schema: XdrType<PublicKeyWire> = union("PublicKey", {
    switchOn: PublicKeyType.schema,
    cases: [
      case_("publicKeyTypeEd25519", 0, field("ed25519", Uint256Bytes.schema)),
    ],
  });

  static publicKeyTypeEd25519(
    ed25519: Uint256Bytes | Uint8Array | string,
  ): PublicKeyEd25519 {
    return new PublicKeyEd25519(ed25519);
  }

  static fromXdrObject(wire: PublicKeyWire): PublicKey {
    switch (wire.type) {
      case 0:
        return new PublicKeyEd25519(Uint256Bytes.fromXdrObject(wire.ed25519));
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `PublicKey: unknown type ${(wire as { type: unknown }).type}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete PublicKey variant.
   * Use this instead of `instanceof PublicKey`: the exported `PublicKey` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `PublicKey.is(x)` narrows to the union.
   */
  static is(value: unknown): value is PublicKey {
    return value instanceof PublicKeyBase;
  }

  abstract toXdrObject(): PublicKeyWire;
}

export class PublicKeyEd25519 extends PublicKeyBase {
  readonly type = "publicKeyTypeEd25519" as const;
  readonly ed25519: Uint256Bytes;

  constructor(ed25519: Uint256Bytes | Uint8Array | string) {
    super();
    this.ed25519 =
      ed25519 instanceof Uint256Bytes ? ed25519 : new Uint256Bytes(ed25519);
  }

  get value(): Uint256Bytes {
    return this.ed25519;
  }

  toXdrObject(): Extract<PublicKeyWire, { type: 0 }> {
    return { type: 0, ed25519: this.ed25519.toXdrObject() };
  }
}

export type PublicKey = PublicKeyEd25519;
export const PublicKey = PublicKeyBase;
