import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ErrorCode, type ErrorCodeWire } from "./error-code.js";

export interface ErrorWire {
  code: ErrorCodeWire;
  msg: string;
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
  readonly msg: string;

  static readonly schema: XdrType<ErrorWire> = struct("Error", {
    code: ErrorCode.schema,
    msg: string_(100),
  });

  constructor(input: { code: ErrorCode; msg: string }) {
    super();
    this.code = input.code;
    this.msg = input.msg;
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
