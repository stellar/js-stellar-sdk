import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  SorobanAuthorizedInvocation,
  type SorobanAuthorizedInvocationWire,
} from "./soroban-authorized-invocation.js";

export interface HashIdPreimageSorobanAuthorizationWire {
  networkId: HashWire;
  nonce: bigint;
  signatureExpirationLedger: number;
  invocation: SorobanAuthorizedInvocationWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         Hash networkID;
 *         int64 nonce;
 *         uint32 signatureExpirationLedger;
 *         SorobanAuthorizedInvocation invocation;
 *     }
 * ```
 */
export class HashIdPreimageSorobanAuthorization extends XdrValue {
  readonly networkId: Hash;
  readonly nonce: bigint;
  readonly signatureExpirationLedger: number;
  readonly invocation: SorobanAuthorizedInvocation;

  static readonly schema: XdrType<HashIdPreimageSorobanAuthorizationWire> =
    struct("HashIdPreimageSorobanAuthorization", {
      networkId: Hash.schema,
      nonce: int64(),
      signatureExpirationLedger: uint32(),
      invocation: SorobanAuthorizedInvocation.schema,
    });

  constructor(input: {
    networkId: Hash | Uint8Array | string;
    nonce: bigint;
    signatureExpirationLedger: number;
    invocation: SorobanAuthorizedInvocation;
  }) {
    super();
    this.networkId =
      input.networkId instanceof Hash
        ? input.networkId
        : new Hash(input.networkId);
    this.nonce = input.nonce;
    this.signatureExpirationLedger = input.signatureExpirationLedger;
    this.invocation = input.invocation;
  }

  toXdrObject(): HashIdPreimageSorobanAuthorizationWire {
    return {
      networkId: this.networkId.toXdrObject(),
      nonce: this.nonce,
      signatureExpirationLedger: this.signatureExpirationLedger,
      invocation: this.invocation.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: HashIdPreimageSorobanAuthorizationWire,
  ): HashIdPreimageSorobanAuthorization {
    return new HashIdPreimageSorobanAuthorization({
      networkId: Hash.fromXdrObject(wire.networkId),
      nonce: wire.nonce,
      signatureExpirationLedger: wire.signatureExpirationLedger,
      invocation: SorobanAuthorizedInvocation.fromXdrObject(wire.invocation),
    });
  }
}
