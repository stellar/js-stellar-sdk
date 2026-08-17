import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { MessageType, type MessageTypeWire } from "./message-type.js";
import { Uint256Bytes, type Uint256BytesWire } from "./uint256-bytes.js";

export interface DontHaveWire {
  type: MessageTypeWire;
  reqHash: Uint256BytesWire;
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
  readonly reqHash: Uint256Bytes;

  static readonly schema: XdrType<DontHaveWire> = struct("DontHave", {
    type: MessageType.schema,
    reqHash: Uint256Bytes.schema,
  });

  constructor(input: {
    type: MessageType;
    reqHash: Uint256Bytes | Uint8Array | string;
  }) {
    super();
    this.type = input.type;
    this.reqHash =
      input.reqHash instanceof Uint256Bytes
        ? input.reqHash
        : new Uint256Bytes(input.reqHash);
  }

  toXdrObject(): DontHaveWire {
    return {
      type: this.type.toXdrObject(),
      reqHash: this.reqHash.toXdrObject(),
    };
  }

  static fromXdrObject(wire: DontHaveWire): DontHave {
    return new DontHave({
      type: MessageType.fromXdrObject(wire.type),
      reqHash: Uint256Bytes.fromXdrObject(wire.reqHash),
    });
  }
}
