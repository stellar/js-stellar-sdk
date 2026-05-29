import { struct } from "../types/struct.js";
import { uint64 } from "../types/uint64.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import { UpgradeType, type UpgradeTypeWire } from "./upgrade-type.js";
import {
  StellarValueExt,
  type StellarValueExtWire,
} from "./stellar-value-ext.js";

export interface StellarValueWire {
  txSetHash: HashWire;
  closeTime: bigint;
  upgrades: UpgradeTypeWire[];
  ext: StellarValueExtWire;
}

/**
 * ```xdr
 * struct StellarValue
 * {
 *     Hash txSetHash;      // transaction set to apply to previous ledger
 *     TimePoint closeTime; // network close time
 *
 *     // upgrades to apply to the previous ledger (usually empty)
 *     // this is a vector of encoded 'LedgerUpgrade' so that nodes can drop
 *     // unknown steps during consensus if needed.
 *     // see notes below on 'LedgerUpgrade' for more detail
 *     // max size is dictated by number of upgrade types (+ room for future)
 *     UpgradeType upgrades<6>;
 *
 *     // reserved for future use
 *     union switch (StellarValueType v)
 *     {
 *     case STELLAR_VALUE_BASIC:
 *         void;
 *     case STELLAR_VALUE_SIGNED:
 *         LedgerCloseValueSignature lcValueSignature;
 *     }
 *     ext;
 * };
 * ```
 */
export class StellarValue extends XdrValue {
  readonly txSetHash: Hash;
  readonly closeTime: bigint;
  readonly upgrades: UpgradeType[];
  readonly ext: StellarValueExt;

  static readonly schema: XdrType<StellarValueWire> = struct("StellarValue", {
    txSetHash: Hash.schema,
    closeTime: uint64(),
    upgrades: array(UpgradeType.schema, UNBOUNDED_MAX_LENGTH),
    ext: StellarValueExt.schema,
  });

  constructor(input: {
    txSetHash: Hash | Uint8Array | string;
    closeTime: bigint;
    upgrades: (UpgradeType | Uint8Array | string)[];
    ext: StellarValueExt;
  }) {
    super();
    this.txSetHash =
      input.txSetHash instanceof Hash
        ? input.txSetHash
        : new Hash(input.txSetHash);
    this.closeTime = input.closeTime;
    this.upgrades = input.upgrades.map((v) =>
      v instanceof UpgradeType ? v : new UpgradeType(v),
    );
    this.ext = input.ext;
  }

  toXdrObject(): StellarValueWire {
    return {
      txSetHash: this.txSetHash.toXdrObject(),
      closeTime: this.closeTime,
      upgrades: this.upgrades.map((v) => v.toXdrObject()),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: StellarValueWire): StellarValue {
    return new StellarValue({
      txSetHash: Hash.fromXdrObject(wire.txSetHash),
      closeTime: wire.closeTime,
      upgrades: wire.upgrades.map((w) => UpgradeType.fromXdrObject(w)),
      ext: StellarValueExt.fromXdrObject(wire.ext),
    });
  }
}
