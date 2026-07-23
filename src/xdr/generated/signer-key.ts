/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, opaque, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { SignerKeyType } from "./signer-key-type.js";
import {
  SignerKeyEd25519SignedPayload,
  type SignerKeyEd25519SignedPayloadWire,
} from "./signer-key-ed25519-signed-payload.js";

export type SignerKeyWire =
  | { type: 0; ed25519: Uint8Array }
  | { type: 1; preAuthTx: Uint8Array }
  | { type: 2; hashX: Uint8Array }
  | { type: 3; ed25519SignedPayload: SignerKeyEd25519SignedPayloadWire };

export type SignerKeyVariantName =
  | "signerKeyTypeEd25519"
  | "signerKeyTypePreAuthTx"
  | "signerKeyTypeHashX"
  | "signerKeyTypeEd25519SignedPayload";

/**
 * ```xdr
 * union SignerKey switch (SignerKeyType type)
 * {
 * case SIGNER_KEY_TYPE_ED25519:
 *     uint256 ed25519;
 * case SIGNER_KEY_TYPE_PRE_AUTH_TX:
 *     /* SHA-256 Hash of TransactionSignaturePayload structure *\/
 *     uint256 preAuthTx;
 * case SIGNER_KEY_TYPE_HASH_X:
 *     /* Hash of random 256 bit preimage X *\/
 *     uint256 hashX;
 * case SIGNER_KEY_TYPE_ED25519_SIGNED_PAYLOAD:
 *     struct
 *     {
 *         /* Public key that must sign the payload. *\/
 *         uint256 ed25519;
 *         /* Payload to be raw signed by ed25519. *\/
 *         opaque payload<64>;
 *     } ed25519SignedPayload;
 * };
 * ```
 */
abstract class SignerKeyBase extends XdrValue {
  abstract readonly type: SignerKeyVariantName;

  static readonly schema: XdrType<SignerKeyWire> = union("SignerKey", {
    switchOn: SignerKeyType.schema,
    cases: [
      case_("signerKeyTypeEd25519", 0, field("ed25519", opaque(32))),
      case_("signerKeyTypePreAuthTx", 1, field("preAuthTx", opaque(32))),
      case_("signerKeyTypeHashX", 2, field("hashX", opaque(32))),
      case_(
        "signerKeyTypeEd25519SignedPayload",
        3,
        field("ed25519SignedPayload", SignerKeyEd25519SignedPayload.schema),
      ),
    ],
  });

  static signerKeyTypeEd25519(ed25519: Uint8Array): SignerKeyEd25519 {
    return new SignerKeyEd25519(ed25519);
  }

  static signerKeyTypePreAuthTx(preAuthTx: Uint8Array): SignerKeyPreAuthTx {
    return new SignerKeyPreAuthTx(preAuthTx);
  }

  static signerKeyTypeHashX(hashX: Uint8Array): SignerKeyHashX {
    return new SignerKeyHashX(hashX);
  }

  static signerKeyTypeEd25519SignedPayload(
    ed25519SignedPayload: SignerKeyEd25519SignedPayload,
  ): SignerKeyEd25519SignedPayloadArm {
    return new SignerKeyEd25519SignedPayloadArm(ed25519SignedPayload);
  }

  static fromXdrObject(wire: SignerKeyWire): SignerKey {
    switch (wire.type) {
      case 0:
        return new SignerKeyEd25519(wire.ed25519);
      case 1:
        return new SignerKeyPreAuthTx(wire.preAuthTx);
      case 2:
        return new SignerKeyHashX(wire.hashX);
      case 3:
        return new SignerKeyEd25519SignedPayloadArm(
          SignerKeyEd25519SignedPayload.fromXdrObject(
            wire.ed25519SignedPayload,
          ),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete SignerKey variant.
   * Use this instead of `instanceof SignerKey`: the exported `SignerKey` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `SignerKey.is(x)` narrows to the union.
   */
  static is(value: unknown): value is SignerKey {
    return value instanceof SignerKeyBase;
  }

  abstract toXdrObject(): SignerKeyWire;
}

export class SignerKeyEd25519 extends SignerKeyBase {
  readonly type = "signerKeyTypeEd25519" as const;
  readonly ed25519: Uint8Array;

  constructor(ed25519: Uint8Array) {
    super();
    this.ed25519 = ed25519;
  }

  get value(): Uint8Array {
    return this.ed25519;
  }

  toXdrObject(): Extract<SignerKeyWire, { type: 0 }> {
    return { type: 0, ed25519: this.ed25519 };
  }
}

export class SignerKeyPreAuthTx extends SignerKeyBase {
  readonly type = "signerKeyTypePreAuthTx" as const;
  readonly preAuthTx: Uint8Array;

  constructor(preAuthTx: Uint8Array) {
    super();
    this.preAuthTx = preAuthTx;
  }

  get value(): Uint8Array {
    return this.preAuthTx;
  }

  toXdrObject(): Extract<SignerKeyWire, { type: 1 }> {
    return { type: 1, preAuthTx: this.preAuthTx };
  }
}

export class SignerKeyHashX extends SignerKeyBase {
  readonly type = "signerKeyTypeHashX" as const;
  readonly hashX: Uint8Array;

  constructor(hashX: Uint8Array) {
    super();
    this.hashX = hashX;
  }

  get value(): Uint8Array {
    return this.hashX;
  }

  toXdrObject(): Extract<SignerKeyWire, { type: 2 }> {
    return { type: 2, hashX: this.hashX };
  }
}

export class SignerKeyEd25519SignedPayloadArm extends SignerKeyBase {
  readonly type = "signerKeyTypeEd25519SignedPayload" as const;
  readonly ed25519SignedPayload: SignerKeyEd25519SignedPayload;

  constructor(ed25519SignedPayload: SignerKeyEd25519SignedPayload) {
    super();
    this.ed25519SignedPayload = ed25519SignedPayload;
  }

  get value(): SignerKeyEd25519SignedPayload {
    return this.ed25519SignedPayload;
  }

  toXdrObject(): Extract<SignerKeyWire, { type: 3 }> {
    return {
      type: 3,
      ed25519SignedPayload: this.ed25519SignedPayload.toXdrObject(),
    };
  }
}

export type SignerKey =
  | SignerKeyEd25519
  | SignerKeyPreAuthTx
  | SignerKeyHashX
  | SignerKeyEd25519SignedPayloadArm;
export const SignerKey = SignerKeyBase;
