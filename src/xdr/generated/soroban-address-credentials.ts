import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import { ScVal, type ScValWire } from "./sc-val.js";

export interface SorobanAddressCredentialsWire {
  address: ScAddressWire;
  nonce: bigint;
  signatureExpirationLedger: number;
  signature: ScValWire;
}

/**
 * ```xdr
 * struct SorobanAddressCredentials
 * {
 *     SCAddress address;
 *     int64 nonce;
 *     uint32 signatureExpirationLedger;
 *     SCVal signature;
 * };
 * ```
 */
export class SorobanAddressCredentials extends XdrValue {
  readonly address: ScAddress;
  readonly nonce: bigint;
  readonly signatureExpirationLedger: number;
  readonly signature: ScVal;

  static readonly schema: XdrType<SorobanAddressCredentialsWire> = struct(
    "SorobanAddressCredentials",
    {
      address: ScAddress.schema,
      nonce: int64(),
      signatureExpirationLedger: uint32(),
      signature: ScVal.schema,
    },
  );

  constructor(input: {
    address: ScAddress;
    nonce: bigint;
    signatureExpirationLedger: number;
    signature: ScVal;
  }) {
    super();
    this.address = input.address;
    this.nonce = input.nonce;
    this.signatureExpirationLedger = input.signatureExpirationLedger;
    this.signature = input.signature;
  }

  toXdrObject(): SorobanAddressCredentialsWire {
    return {
      address: this.address.toXdrObject(),
      nonce: this.nonce,
      signatureExpirationLedger: this.signatureExpirationLedger,
      signature: this.signature.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: SorobanAddressCredentialsWire,
  ): SorobanAddressCredentials {
    return new SorobanAddressCredentials({
      address: ScAddress.fromXdrObject(wire.address),
      nonce: wire.nonce,
      signatureExpirationLedger: wire.signatureExpirationLedger,
      signature: ScVal.fromXdrObject(wire.signature),
    });
  }
}
