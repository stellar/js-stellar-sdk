import { array, struct, uint32 } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerCloseMeta,
  type LedgerCloseMetaWire,
} from "./ledger-close-meta.js";

export interface LedgerCloseMetaBatchWire {
  startSequence: number;
  endSequence: number;
  ledgerCloseMetas: LedgerCloseMetaWire[];
}

/**
 * ```xdr
 * struct LedgerCloseMetaBatch
 * {
 *     // starting ledger sequence number in the batch
 *     uint32 startSequence;
 *
 *     // ending ledger sequence number in the batch
 *     uint32 endSequence;
 *
 *     // Ledger close meta for each ledger within the batch
 *     LedgerCloseMeta ledgerCloseMetas<>;
 * };
 * ```
 */
export class LedgerCloseMetaBatch extends XdrValue {
  readonly startSequence: number;
  readonly endSequence: number;
  readonly ledgerCloseMetas: LedgerCloseMeta[];

  static readonly schema: XdrType<LedgerCloseMetaBatchWire> = struct(
    "LedgerCloseMetaBatch",
    {
      startSequence: uint32(),
      endSequence: uint32(),
      ledgerCloseMetas: array(LedgerCloseMeta.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    startSequence: number;
    endSequence: number;
    ledgerCloseMetas: LedgerCloseMeta[];
  }) {
    super();
    this.startSequence = input.startSequence;
    this.endSequence = input.endSequence;
    this.ledgerCloseMetas = input.ledgerCloseMetas;
  }

  toXdrObject(): LedgerCloseMetaBatchWire {
    return {
      startSequence: this.startSequence,
      endSequence: this.endSequence,
      ledgerCloseMetas: this.ledgerCloseMetas.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: LedgerCloseMetaBatchWire): LedgerCloseMetaBatch {
    return new LedgerCloseMetaBatch({
      startSequence: wire.startSequence,
      endSequence: wire.endSequence,
      ledgerCloseMetas: wire.ledgerCloseMetas.map((w) =>
        LedgerCloseMeta.fromXdrObject(w),
      ),
    });
  }
}
