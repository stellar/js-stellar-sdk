import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { ErrorCode, type ErrorCodeWire } from "./error-code.js";

export interface ErrorWire {
  code: ErrorCodeWire;
  msg: XdrString;
}

/**
 * ```xdr
 * struct Error
 * {
 *     ErrorCode code;
 *     string msg<100>;
 * };
 * ```
 */
export class Error extends XdrValue {
  readonly code: ErrorCode;
  readonly msg: XdrString;

  static readonly schema: XdrType<ErrorWire> = struct("Error", {
    code: ErrorCode.schema,
    msg: xdrString(100),
  });

  constructor(input: {
    code: ErrorCode;
    msg: XdrString | string | Uint8Array;
  }) {
    super();
    this.code = input.code;
    this.msg =
      input.msg instanceof XdrString ? input.msg : new XdrString(input.msg);
  }

  toXdrObject(): ErrorWire {
    return {
      code: this.code.toXdrObject(),
      msg: this.msg,
    };
  }

  static fromXdrObject(wire: ErrorWire): Error {
    return new Error({
      code: ErrorCode.fromXdrObject(wire.code),
      msg: wire.msg,
    });
  }
}
