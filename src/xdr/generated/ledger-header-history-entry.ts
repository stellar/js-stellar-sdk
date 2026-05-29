import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import { LedgerHeader, type LedgerHeaderWire } from "./ledger-header.js";
import {
  LedgerHeaderHistoryEntryExt,
  type LedgerHeaderHistoryEntryExtWire,
} from "./ledger-header-history-entry-ext.js";

export interface LedgerHeaderHistoryEntryWire {
  hash: HashWire;
  header: LedgerHeaderWire;
  ext: LedgerHeaderHistoryEntryExtWire;
}

/**
 * ```xdr
 * struct LedgerHeaderHistoryEntry
 * {
 *     Hash hash;
 *     LedgerHeader header;
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class LedgerHeaderHistoryEntry extends XdrValue {
  readonly hash: Hash;
  readonly header: LedgerHeader;
  readonly ext: LedgerHeaderHistoryEntryExt;

  static readonly schema: XdrType<LedgerHeaderHistoryEntryWire> = struct(
    "LedgerHeaderHistoryEntry",
    {
      hash: Hash.schema,
      header: LedgerHeader.schema,
      ext: LedgerHeaderHistoryEntryExt.schema,
    },
  );

  constructor(input: {
    hash: Hash | Uint8Array | string;
    header: LedgerHeader;
    ext: LedgerHeaderHistoryEntryExt;
  }) {
    super();
    this.hash = input.hash instanceof Hash ? input.hash : new Hash(input.hash);
    this.header = input.header;
    this.ext = input.ext;
  }

  toXdrObject(): LedgerHeaderHistoryEntryWire {
    return {
      hash: this.hash.toXdrObject(),
      header: this.header.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: LedgerHeaderHistoryEntryWire,
  ): LedgerHeaderHistoryEntry {
    return new LedgerHeaderHistoryEntry({
      hash: Hash.fromXdrObject(wire.hash),
      header: LedgerHeader.fromXdrObject(wire.header),
      ext: LedgerHeaderHistoryEntryExt.fromXdrObject(wire.ext),
    });
  }
}
