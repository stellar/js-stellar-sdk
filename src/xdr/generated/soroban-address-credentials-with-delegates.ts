import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  SorobanAddressCredentials,
  type SorobanAddressCredentialsWire,
} from "./soroban-address-credentials.js";
import {
  SorobanDelegateSignature,
  type SorobanDelegateSignatureWire,
} from "./soroban-delegate-signature.js";

export interface SorobanAddressCredentialsWithDelegatesWire {
  addressCredentials: SorobanAddressCredentialsWire;
  delegates: SorobanDelegateSignatureWire[];
}

/**
 * ```xdr
 * struct SorobanAddressCredentialsWithDelegates
 * {
 *     SorobanAddressCredentials addressCredentials;
 *     SorobanDelegateSignature delegates<>;
 * };
 * ```
 */
export class SorobanAddressCredentialsWithDelegates extends XdrValue {
  readonly addressCredentials: SorobanAddressCredentials;
  readonly delegates: SorobanDelegateSignature[];

  static readonly schema: XdrType<SorobanAddressCredentialsWithDelegatesWire> =
    struct("SorobanAddressCredentialsWithDelegates", {
      addressCredentials: SorobanAddressCredentials.schema,
      delegates: array(SorobanDelegateSignature.schema, UNBOUNDED_MAX_LENGTH),
    });

  constructor(input: {
    addressCredentials: SorobanAddressCredentials;
    delegates: SorobanDelegateSignature[];
  }) {
    super();
    this.addressCredentials = input.addressCredentials;
    this.delegates = input.delegates;
  }

  toXdrObject(): SorobanAddressCredentialsWithDelegatesWire {
    return {
      addressCredentials: this.addressCredentials.toXdrObject(),
      delegates: this.delegates.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: SorobanAddressCredentialsWithDelegatesWire,
  ): SorobanAddressCredentialsWithDelegates {
    return new SorobanAddressCredentialsWithDelegates({
      addressCredentials: SorobanAddressCredentials.fromXdrObject(
        wire.addressCredentials,
      ),
      delegates: wire.delegates.map((w) =>
        SorobanDelegateSignature.fromXdrObject(w),
      ),
    });
  }
}
