import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface ScNonceKeyWire {
  nonce: bigint;
}

/**
 * ```xdr
 * struct SCNonceKey {
 *     int64 nonce;
 * };
 * ```
 */
export class ScNonceKey extends XdrValue {
  readonly nonce: bigint;

  static readonly schema: XdrType<ScNonceKeyWire> = struct("ScNonceKey", {
    nonce: int64(),
  });

  constructor(input: { nonce: bigint }) {
    super();
    this.nonce = input.nonce;
  }

  toXdrObject(): ScNonceKeyWire {
    return {
      nonce: this.nonce,
    };
  }

  static fromXdrObject(wire: ScNonceKeyWire): ScNonceKey {
    return new ScNonceKey({
      nonce: wire.nonce,
    });
  }
}
