import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface SendMoreWire {
  numMessages: number;
}

/**
 * ```xdr
 * struct SendMore
 * {
 *     uint32 numMessages;
 * };
 * ```
 */
export class SendMore extends XdrValue {
  readonly numMessages: number;

  static readonly schema: XdrType<SendMoreWire> = struct("SendMore", {
    numMessages: uint32(),
  });

  constructor(input: { numMessages: number }) {
    super();
    this.numMessages = input.numMessages;
  }

  toXdrObject(): SendMoreWire {
    return {
      numMessages: this.numMessages,
    };
  }

  static fromXdrObject(wire: SendMoreWire): SendMore {
    return new SendMore({
      numMessages: wire.numMessages,
    });
  }
}
