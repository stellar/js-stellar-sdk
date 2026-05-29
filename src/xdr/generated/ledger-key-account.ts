import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface LedgerKeyAccountWire {
  accountId: PublicKeyWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         AccountID accountID;
 *     }
 * ```
 */
export class LedgerKeyAccount extends XdrValue {
  readonly accountId: PublicKey;

  static readonly schema: XdrType<LedgerKeyAccountWire> = struct(
    "LedgerKeyAccount",
    {
      accountId: PublicKey.schema,
    },
  );

  constructor(input: { accountId: PublicKey }) {
    super();
    this.accountId = input.accountId;
  }

  toXdrObject(): LedgerKeyAccountWire {
    return {
      accountId: this.accountId.toXdrObject(),
    };
  }

  static fromXdrObject(wire: LedgerKeyAccountWire): LedgerKeyAccount {
    return new LedgerKeyAccount({
      accountId: PublicKey.fromXdrObject(wire.accountId),
    });
  }
}
