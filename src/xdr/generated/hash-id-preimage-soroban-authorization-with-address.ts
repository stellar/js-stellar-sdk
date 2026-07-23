import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import {
  SorobanAuthorizedInvocation,
  type SorobanAuthorizedInvocationWire,
} from "./soroban-authorized-invocation.js";

export interface HashIdPreimageSorobanAuthorizationWithAddressWire {
  networkId: HashWire;
  nonce: bigint;
  signatureExpirationLedger: number;
  address: ScAddressWire;
  invocation: SorobanAuthorizedInvocationWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         Hash networkID;
 *         int64 nonce;
 *         uint32 signatureExpirationLedger;
 *         SCAddress address;
 *         SorobanAuthorizedInvocation invocation;
 *     }
 * ```
 */
export class HashIdPreimageSorobanAuthorizationWithAddress extends XdrValue {
  readonly networkId: Hash;
  readonly nonce: bigint;
  readonly signatureExpirationLedger: number;
  readonly address: ScAddress;
  readonly invocation: SorobanAuthorizedInvocation;

  static readonly schema: XdrType<HashIdPreimageSorobanAuthorizationWithAddressWire> =
    struct("HashIdPreimageSorobanAuthorizationWithAddress", {
      networkId: Hash.schema,
      nonce: int64(),
      signatureExpirationLedger: uint32(),
      address: ScAddress.schema,
      invocation: SorobanAuthorizedInvocation.schema,
    });

  constructor(input: {
    networkId: Hash | Uint8Array | string;
    nonce: bigint;
    signatureExpirationLedger: number;
    address: ScAddress;
    invocation: SorobanAuthorizedInvocation;
  }) {
    super();
    this.networkId =
      input.networkId instanceof Hash
        ? input.networkId
        : new Hash(input.networkId);
    this.nonce = input.nonce;
    this.signatureExpirationLedger = input.signatureExpirationLedger;
    this.address = input.address;
    this.invocation = input.invocation;
  }

  toXdrObject(): HashIdPreimageSorobanAuthorizationWithAddressWire {
    return {
      networkId: this.networkId.toXdrObject(),
      nonce: this.nonce,
      signatureExpirationLedger: this.signatureExpirationLedger,
      address: this.address.toXdrObject(),
      invocation: this.invocation.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: HashIdPreimageSorobanAuthorizationWithAddressWire,
  ): HashIdPreimageSorobanAuthorizationWithAddress {
    return new HashIdPreimageSorobanAuthorizationWithAddress({
      networkId: Hash.fromXdrObject(wire.networkId),
      nonce: wire.nonce,
      signatureExpirationLedger: wire.signatureExpirationLedger,
      address: ScAddress.fromXdrObject(wire.address),
      invocation: SorobanAuthorizedInvocation.fromXdrObject(wire.invocation),
    });
  }
}
