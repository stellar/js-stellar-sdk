import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface LedgerKeyDataWire {
  accountId: PublicKeyWire;
  dataName: string;
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
  readonly dataName: string;

  static readonly schema: XdrType<LedgerKeyDataWire> = struct("LedgerKeyData", {
    accountId: PublicKey.schema,
    dataName: string_(64),
  });

  constructor(input: { accountId: PublicKey; dataName: string }) {
    super();
    this.accountId = input.accountId;
    this.dataName = input.dataName;
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
