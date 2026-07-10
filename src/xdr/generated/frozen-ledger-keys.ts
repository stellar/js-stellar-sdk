import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
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

  constructor(input: { keys: (EncodedLedgerKey | Uint8Array | string)[] }) {
    super();
    this.keys = input.keys.map((v) =>
      v instanceof EncodedLedgerKey ? v : new EncodedLedgerKey(v),
    );
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
