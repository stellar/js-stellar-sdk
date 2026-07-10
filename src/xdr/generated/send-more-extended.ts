import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface SendMoreExtendedWire {
  numMessages: number;
  numBytes: number;
}

/**
 * ```xdr
 * struct SendMoreExtended
 * {
 *     uint32 numMessages;
 *     uint32 numBytes;
 * };
 * ```
 */
export class SendMoreExtended extends XdrValue {
  readonly numMessages: number;
  readonly numBytes: number;

  static readonly schema: XdrType<SendMoreExtendedWire> = struct(
    "SendMoreExtended",
    {
      numMessages: uint32(),
      numBytes: uint32(),
    },
  );

  constructor(input: { numMessages: number; numBytes: number }) {
    super();
    this.numMessages = input.numMessages;
    this.numBytes = input.numBytes;
  }

  toXdrObject(): SendMoreExtendedWire {
    return {
      numMessages: this.numMessages,
      numBytes: this.numBytes,
    };
  }

  static fromXdrObject(wire: SendMoreExtendedWire): SendMoreExtended {
    return new SendMoreExtended({
      numMessages: wire.numMessages,
      numBytes: wire.numBytes,
    });
  }
}
