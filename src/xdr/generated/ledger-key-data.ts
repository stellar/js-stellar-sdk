import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface LedgerKeyDataWire {
  accountId: PublicKeyWire;
  dataName: XdrString;
}

/**
 * ```xdr
 * struct
 *     {
 *         AccountID accountID;
 *         string64 dataName;
 *     }
 * ```
 */
export class LedgerKeyData extends XdrValue {
  readonly accountId: PublicKey;
  readonly dataName: XdrString;

  static readonly schema: XdrType<LedgerKeyDataWire> = struct("LedgerKeyData", {
    accountId: PublicKey.schema,
    dataName: xdrString(64),
  });

  constructor(input: {
    accountId: PublicKey;
    dataName: XdrString | string | Uint8Array;
  }) {
    super();
    this.accountId = input.accountId;
    this.dataName =
      input.dataName instanceof XdrString
        ? input.dataName
        : new XdrString(input.dataName);
  }

  toXdrObject(): LedgerKeyDataWire {
    return {
      accountId: this.accountId.toXdrObject(),
      dataName: this.dataName,
    };
  }

  static fromXdrObject(wire: LedgerKeyDataWire): LedgerKeyData {
    return new LedgerKeyData({
      accountId: PublicKey.fromXdrObject(wire.accountId),
      dataName: wire.dataName,
    });
  }
}
