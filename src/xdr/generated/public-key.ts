/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, opaque, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKeyType } from "./public-key-type.js";

export type PublicKeyWire = { type: 0; ed25519: Uint8Array };

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
    cases: [case_("publicKeyTypeEd25519", 0, field("ed25519", opaque(32)))],
  });

  static publicKeyTypeEd25519(ed25519: Uint8Array): PublicKeyEd25519 {
    return new PublicKeyEd25519(ed25519);
  }

  static fromXdrObject(wire: PublicKeyWire): PublicKey {
    switch (wire.type) {
      case 0:
        return new PublicKeyEd25519(wire.ed25519);
    }
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
  readonly ed25519: Uint8Array;

  constructor(ed25519: Uint8Array) {
    super();
    this.ed25519 = ed25519;
  }

  get value(): Uint8Array {
    return this.ed25519;
  }

  toXdrObject(): Extract<PublicKeyWire, { type: 0 }> {
    return { type: 0, ed25519: this.ed25519 };
  }
}

export type PublicKey = PublicKeyEd25519;
export const PublicKey = PublicKeyBase;
