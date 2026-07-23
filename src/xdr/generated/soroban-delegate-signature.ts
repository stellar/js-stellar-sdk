import { array, lazy, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import { ScVal, type ScValWire } from "./sc-val.js";

export interface SorobanDelegateSignatureWire {
  address: ScAddressWire;
  signature: ScValWire;
  nestedDelegates: SorobanDelegateSignatureWire[];
}

/**
 * ```xdr
 * struct SorobanDelegateSignature
 * {
 *     SCAddress address;
 *     SCVal signature;
 *     SorobanDelegateSignature nestedDelegates<>;
 * };
 * ```
 */
export class SorobanDelegateSignature extends XdrValue {
  readonly address: ScAddress;
  readonly signature: ScVal;
  readonly nestedDelegates: SorobanDelegateSignature[];

  static readonly schema: XdrType<SorobanDelegateSignatureWire> = struct(
    "SorobanDelegateSignature",
    {
      address: ScAddress.schema,
      signature: ScVal.schema,
      nestedDelegates: array(
        lazy(() => SorobanDelegateSignature.schema),
        UNBOUNDED_MAX_LENGTH,
      ),
    },
  );

  constructor(input: {
    address: ScAddress;
    signature: ScVal;
    nestedDelegates: SorobanDelegateSignature[];
  }) {
    super();
    this.address = input.address;
    this.signature = input.signature;
    this.nestedDelegates = input.nestedDelegates;
  }

  toXdrObject(): SorobanDelegateSignatureWire {
    return {
      address: this.address.toXdrObject(),
      signature: this.signature.toXdrObject(),
      nestedDelegates: this.nestedDelegates.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: SorobanDelegateSignatureWire,
  ): SorobanDelegateSignature {
    return new SorobanDelegateSignature({
      address: ScAddress.fromXdrObject(wire.address),
      signature: ScVal.fromXdrObject(wire.signature),
      nestedDelegates: wire.nestedDelegates.map((w) =>
        SorobanDelegateSignature.fromXdrObject(w),
      ),
    });
  }
}
