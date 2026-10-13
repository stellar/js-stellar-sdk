import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { OWNED, copyArray } from "../values/owned.js";
import { LedgerKey, type LedgerKeyWire } from "./ledger-key.js";

export interface LedgerFootprintWire {
  readOnly: LedgerKeyWire[];
  readWrite: LedgerKeyWire[];
}

/**
 * ```xdr
 * struct LedgerFootprint
 * {
 *     LedgerKey readOnly<>;
 *     LedgerKey readWrite<>;
 * };
 * ```
 */
export class LedgerFootprint extends XdrValue {
  readonly readOnly: LedgerKey[];
  readonly readWrite: LedgerKey[];

  static readonly schema: XdrType<LedgerFootprintWire> = struct(
    "LedgerFootprint",
    {
      readOnly: array(LedgerKey.schema, UNBOUNDED_MAX_LENGTH),
      readWrite: array(LedgerKey.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(
    input: {
      readOnly: LedgerKey[];
      readWrite: LedgerKey[];
    },
    owned?: typeof OWNED,
  ) {
    super();
    this.readOnly =
      owned === OWNED ? input.readOnly : copyArray(input.readOnly);
    this.readWrite =
      owned === OWNED ? input.readWrite : copyArray(input.readWrite);
  }

  toXdrObject(): LedgerFootprintWire {
    return {
      readOnly: this.readOnly.map((v) => v.toXdrObject()),
      readWrite: this.readWrite.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: LedgerFootprintWire): LedgerFootprint {
    return new LedgerFootprint(
      {
        readOnly: wire.readOnly.map((w) => LedgerKey.fromXdrObject(w)),
        readWrite: wire.readWrite.map((w) => LedgerKey.fromXdrObject(w)),
      },
      OWNED,
    );
  }
}
