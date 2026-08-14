/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { SignerKeyType } from "./signer-key-type.js";
import { Uint256Bytes, type Uint256BytesWire } from "./uint256-bytes.js";
import {
  SignerKeyEd25519SignedPayload,
  type SignerKeyEd25519SignedPayloadWire,
} from "./signer-key-ed25519-signed-payload.js";

export type SignerKeyWire =
  | { type: 0; ed25519: Uint256BytesWire }
  | { type: 1; preAuthTx: Uint256BytesWire }
  | { type: 2; hashX: Uint256BytesWire }
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
      case_("signerKeyTypeEd25519", 0, field("ed25519", Uint256Bytes.schema)),
      case_(
        "signerKeyTypePreAuthTx",
        1,
        field("preAuthTx", Uint256Bytes.schema),
      ),
      case_("signerKeyTypeHashX", 2, field("hashX", Uint256Bytes.schema)),
      case_(
        "signerKeyTypeEd25519SignedPayload",
        3,
        field("ed25519SignedPayload", SignerKeyEd25519SignedPayload.schema),
      ),
    ],
  });

  static signerKeyTypeEd25519(
    ed25519: Uint256Bytes | Uint8Array | string,
  ): SignerKeyEd25519 {
    return new SignerKeyEd25519(ed25519);
  }

  static signerKeyTypePreAuthTx(
    preAuthTx: Uint256Bytes | Uint8Array | string,
  ): SignerKeyPreAuthTx {
    return new SignerKeyPreAuthTx(preAuthTx);
  }

  static signerKeyTypeHashX(
    hashX: Uint256Bytes | Uint8Array | string,
  ): SignerKeyHashX {
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
        return new SignerKeyEd25519(Uint256Bytes.fromXdrObject(wire.ed25519));
      case 1:
        return new SignerKeyPreAuthTx(
          Uint256Bytes.fromXdrObject(wire.preAuthTx),
        );
      case 2:
        return new SignerKeyHashX(Uint256Bytes.fromXdrObject(wire.hashX));
      case 3:
        return new SignerKeyEd25519SignedPayloadArm(
          SignerKeyEd25519SignedPayload.fromXdrObject(
            wire.ed25519SignedPayload,
          ),
        );
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `SignerKey: unknown type ${(wire as { type: unknown }).type}`,
    );
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
  readonly ed25519: Uint256Bytes;

  constructor(ed25519: Uint256Bytes | Uint8Array | string) {
    super();
    this.ed25519 =
      ed25519 instanceof Uint256Bytes ? ed25519 : new Uint256Bytes(ed25519);
  }

  get value(): Uint256Bytes {
    return this.ed25519;
  }

  toXdrObject(): Extract<SignerKeyWire, { type: 0 }> {
    return { type: 0, ed25519: this.ed25519.toXdrObject() };
  }
}

export class SignerKeyPreAuthTx extends SignerKeyBase {
  readonly type = "signerKeyTypePreAuthTx" as const;
  readonly preAuthTx: Uint256Bytes;

  constructor(preAuthTx: Uint256Bytes | Uint8Array | string) {
    super();
    this.preAuthTx =
      preAuthTx instanceof Uint256Bytes
        ? preAuthTx
        : new Uint256Bytes(preAuthTx);
  }

  get value(): Uint256Bytes {
    return this.preAuthTx;
  }

  toXdrObject(): Extract<SignerKeyWire, { type: 1 }> {
    return { type: 1, preAuthTx: this.preAuthTx.toXdrObject() };
  }
}

export class SignerKeyHashX extends SignerKeyBase {
  readonly type = "signerKeyTypeHashX" as const;
  readonly hashX: Uint256Bytes;

  constructor(hashX: Uint256Bytes | Uint8Array | string) {
    super();
    this.hashX =
      hashX instanceof Uint256Bytes ? hashX : new Uint256Bytes(hashX);
  }

  get value(): Uint256Bytes {
    return this.hashX;
  }

  toXdrObject(): Extract<SignerKeyWire, { type: 2 }> {
    return { type: 2, hashX: this.hashX.toXdrObject() };
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
