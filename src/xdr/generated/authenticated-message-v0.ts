import { struct } from "../types/struct.js";
import { uint64 } from "../types/uint64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { StellarMessage, type StellarMessageWire } from "./stellar-message.js";
import { HmacSha256Mac, type HmacSha256MacWire } from "./hmac-sha256-mac.js";

export interface AuthenticatedMessageV0Wire {
  sequence: bigint;
  message: StellarMessageWire;
  mac: HmacSha256MacWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         uint64 sequence;
 *         StellarMessage message;
 *         HmacSha256Mac mac;
 *     }
 * ```
 */
export class AuthenticatedMessageV0 extends XdrValue {
  readonly sequence: bigint;
  readonly message: StellarMessage;
  readonly mac: HmacSha256Mac;

  static readonly schema: XdrType<AuthenticatedMessageV0Wire> = struct(
    "AuthenticatedMessageV0",
    {
      sequence: uint64(),
      message: StellarMessage.schema,
      mac: HmacSha256Mac.schema,
    },
  );

  constructor(input: {
    sequence: bigint;
    message: StellarMessage;
    mac: HmacSha256Mac;
  }) {
    super();
    this.sequence = input.sequence;
    this.message = input.message;
    this.mac = input.mac;
  }

  toXdrObject(): AuthenticatedMessageV0Wire {
    return {
      sequence: this.sequence,
      message: this.message.toXdrObject(),
      mac: this.mac.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: AuthenticatedMessageV0Wire,
  ): AuthenticatedMessageV0 {
    return new AuthenticatedMessageV0({
      sequence: wire.sequence,
      message: StellarMessage.fromXdrObject(wire.message),
      mac: HmacSha256Mac.fromXdrObject(wire.mac),
    });
  }
}
