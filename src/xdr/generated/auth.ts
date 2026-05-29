import { struct } from "../types/struct.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface AuthWire {
  flags: number;
}

/**
 * ```xdr
 * struct Auth
 * {
 *     int flags;
 * };
 * ```
 */
export class Auth extends XdrValue {
  readonly flags: number;

  static readonly schema: XdrType<AuthWire> = struct("Auth", {
    flags: int32(),
  });

  constructor(input: { flags: number }) {
    super();
    this.flags = input.flags;
  }

  toXdrObject(): AuthWire {
    return {
      flags: this.flags,
    };
  }

  static fromXdrObject(wire: AuthWire): Auth {
    return new Auth({
      flags: wire.flags,
    });
  }
}
