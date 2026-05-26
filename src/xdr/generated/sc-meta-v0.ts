import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ScMetaV0Wire {
  key: string;
  val: string;
}

/**
 * ```xdr
 * struct SCMetaV0
 * {
 *     string key<>;
 *     string val<>;
 * };
 * ```
 */
export class ScMetaV0 extends XdrValue {
  readonly key: string;
  readonly val: string;

  static readonly schema: XdrType<ScMetaV0Wire> = struct("ScMetaV0", {
    key: string_(UNBOUNDED_MAX_LENGTH),
    val: string_(UNBOUNDED_MAX_LENGTH),
  });

  constructor(input: { key: Uint8Array | string; val: Uint8Array | string }) {
    super();
    this.key =
      input.key instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.key)
        : input.key;
    this.val =
      input.val instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.val)
        : input.val;
  }

  toXdrObject(): ScMetaV0Wire {
    return {
      key: this.key,
      val: this.val,
    };
  }

  static fromXdrObject(wire: ScMetaV0Wire): ScMetaV0 {
    return new ScMetaV0({
      key: wire.key,
      val: wire.val,
    });
  }
}
