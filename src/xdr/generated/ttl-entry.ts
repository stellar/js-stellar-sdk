import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";

export interface TtlEntryWire {
  keyHash: HashWire;
  liveUntilLedgerSeq: number;
}

/**
 * ```xdr
 * struct TTLEntry {
 *     // Hash of the LedgerKey that is associated with this TTLEntry
 *     Hash keyHash;
 *     uint32 liveUntilLedgerSeq;
 * };
 * ```
 */
export class TtlEntry extends XdrValue {
  readonly keyHash: Hash;
  readonly liveUntilLedgerSeq: number;

  static readonly schema: XdrType<TtlEntryWire> = struct("TtlEntry", {
    keyHash: Hash.schema,
    liveUntilLedgerSeq: uint32(),
  });

  constructor(input: {
    keyHash: Hash | Uint8Array | string;
    liveUntilLedgerSeq: number;
  }) {
    super();
    this.keyHash =
      input.keyHash instanceof Hash ? input.keyHash : new Hash(input.keyHash);
    this.liveUntilLedgerSeq = input.liveUntilLedgerSeq;
  }

  toXdrObject(): TtlEntryWire {
    return {
      keyHash: this.keyHash.toXdrObject(),
      liveUntilLedgerSeq: this.liveUntilLedgerSeq,
    };
  }

  static fromXdrObject(wire: TtlEntryWire): TtlEntry {
    return new TtlEntry({
      keyHash: Hash.fromXdrObject(wire.keyHash),
      liveUntilLedgerSeq: wire.liveUntilLedgerSeq,
    });
  }
}
