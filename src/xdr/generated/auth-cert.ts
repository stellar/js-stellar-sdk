import { struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  Curve25519Public,
  type Curve25519PublicWire,
} from "./curve25519-public.js";
import { Signature, type SignatureWire } from "./signature.js";

export interface AuthCertWire {
  pubkey: Curve25519PublicWire;
  expiration: bigint;
  sig: SignatureWire;
}

/**
 * ```xdr
 * struct AuthCert
 * {
 *     Curve25519Public pubkey;
 *     uint64 expiration;
 *     Signature sig;
 * };
 * ```
 */
export class AuthCert extends XdrValue {
  readonly pubkey: Curve25519Public;
  readonly expiration: bigint;
  readonly sig: Signature;

  static readonly schema: XdrType<AuthCertWire> = struct("AuthCert", {
    pubkey: Curve25519Public.schema,
    expiration: uint64(),
    sig: Signature.schema,
  });

  constructor(input: {
    pubkey: Curve25519Public;
    expiration: bigint;
    sig: Signature | Uint8Array | string;
  }) {
    super();
    this.pubkey = input.pubkey;
    this.expiration = input.expiration;
    this.sig =
      input.sig instanceof Signature ? input.sig : new Signature(input.sig);
  }

  toXdrObject(): AuthCertWire {
    return {
      pubkey: this.pubkey.toXdrObject(),
      expiration: this.expiration,
      sig: this.sig.toXdrObject(),
    };
  }

  static fromXdrObject(wire: AuthCertWire): AuthCert {
    return new AuthCert({
      pubkey: Curve25519Public.fromXdrObject(wire.pubkey),
      expiration: wire.expiration,
      sig: Signature.fromXdrObject(wire.sig),
    });
  }
}
