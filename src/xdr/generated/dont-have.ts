import { struct } from "../types/struct.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { MessageType, type MessageTypeWire } from "./message-type.js";

export interface DontHaveWire {
  type: MessageTypeWire;
  reqHash: Uint8Array;
}

/**
 * ```xdr
 * struct DontHave
 * {
 *     MessageType type;
 *     uint256 reqHash;
 * };
 * ```
 */
export class DontHave extends XdrValue {
  readonly type: MessageType;
  readonly reqHash: Uint8Array;

  static readonly schema: XdrType<DontHaveWire> = struct("DontHave", {
    type: MessageType.schema,
    reqHash: opaque(32),
  });

  constructor(input: { type: MessageType; reqHash: Uint8Array }) {
    super();
    this.type = input.type;
    this.reqHash = input.reqHash;
  }

  toXdrObject(): DontHaveWire {
    return {
      type: this.type.toXdrObject(),
      reqHash: this.reqHash,
    };
  }

  static fromXdrObject(wire: DontHaveWire): DontHave {
    return new DontHave({
      type: MessageType.fromXdrObject(wire.type),
      reqHash: wire.reqHash,
    });
  }
}
