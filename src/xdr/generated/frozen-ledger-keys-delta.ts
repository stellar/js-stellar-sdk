import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  EncodedLedgerKey,
  type EncodedLedgerKeyWire,
} from "./encoded-ledger-key.js";

export interface FrozenLedgerKeysDeltaWire {
  keysToFreeze: EncodedLedgerKeyWire[];
  keysToUnfreeze: EncodedLedgerKeyWire[];
}

/**
 * ```xdr
 * struct FrozenLedgerKeysDelta {
 *     EncodedLedgerKey keysToFreeze<>;
 *     EncodedLedgerKey keysToUnfreeze<>;
 * };
 * ```
 */
export class FrozenLedgerKeysDelta extends XdrValue {
  readonly keysToFreeze: EncodedLedgerKey[];
  readonly keysToUnfreeze: EncodedLedgerKey[];

  static readonly schema: XdrType<FrozenLedgerKeysDeltaWire> = struct(
    "FrozenLedgerKeysDelta",
    {
      keysToFreeze: array(EncodedLedgerKey.schema, UNBOUNDED_MAX_LENGTH),
      keysToUnfreeze: array(EncodedLedgerKey.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    keysToFreeze: (EncodedLedgerKey | Uint8Array | string)[];
    keysToUnfreeze: (EncodedLedgerKey | Uint8Array | string)[];
  }) {
    super();
    this.keysToFreeze = input.keysToFreeze.map((v) =>
      v instanceof EncodedLedgerKey ? v : new EncodedLedgerKey(v),
    );
    this.keysToUnfreeze = input.keysToUnfreeze.map((v) =>
      v instanceof EncodedLedgerKey ? v : new EncodedLedgerKey(v),
    );
  }

  toXdrObject(): FrozenLedgerKeysDeltaWire {
    return {
      keysToFreeze: this.keysToFreeze.map((v) => v.toXdrObject()),
      keysToUnfreeze: this.keysToUnfreeze.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: FrozenLedgerKeysDeltaWire): FrozenLedgerKeysDelta {
    return new FrozenLedgerKeysDelta({
      keysToFreeze: wire.keysToFreeze.map((w) =>
        EncodedLedgerKey.fromXdrObject(w),
      ),
      keysToUnfreeze: wire.keysToUnfreeze.map((w) =>
        EncodedLedgerKey.fromXdrObject(w),
      ),
    });
  }
}
