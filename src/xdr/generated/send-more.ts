import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
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
