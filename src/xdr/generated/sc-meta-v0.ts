import { struct } from "../types/struct.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";

export interface ScMetaV0Wire {
  key: XdrString;
  val: XdrString;
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
  readonly key: XdrString;
  readonly val: XdrString;

  static readonly schema: XdrType<ScMetaV0Wire> = struct("ScMetaV0", {
    key: xdrString(UNBOUNDED_MAX_LENGTH),
    val: xdrString(UNBOUNDED_MAX_LENGTH),
  });

  constructor(input: {
    key: XdrString | string | Uint8Array;
    val: XdrString | string | Uint8Array;
  }) {
    super();
    this.key =
      input.key instanceof XdrString ? input.key : new XdrString(input.key);
    this.val =
      input.val instanceof XdrString ? input.val : new XdrString(input.val);
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
