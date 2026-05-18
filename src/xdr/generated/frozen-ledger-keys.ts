import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  EncodedLedgerKey,
  type EncodedLedgerKeyWire,
} from "./encoded-ledger-key.js";

export interface FrozenLedgerKeysWire {
  keys: EncodedLedgerKeyWire[];
}

/**
 * ```xdr
 * struct FrozenLedgerKeys {
 *     EncodedLedgerKey keys<>;
 * };
 * ```
 */
export class FrozenLedgerKeys extends XdrValue {
  readonly keys: EncodedLedgerKey[];

  static readonly schema: XdrType<FrozenLedgerKeysWire> = struct(
    "FrozenLedgerKeys",
    {
      keys: array(EncodedLedgerKey.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { keys: EncodedLedgerKey[] }) {
    super();
    this.keys = input.keys;
  }

  toXdrObject(): FrozenLedgerKeysWire {
    return {
      keys: this.keys.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: FrozenLedgerKeysWire): FrozenLedgerKeys {
    return new FrozenLedgerKeys({
      keys: wire.keys.map((w) => EncodedLedgerKey.fromXdrObject(w)),
    });
  }
}
