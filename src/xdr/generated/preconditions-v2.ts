import { struct } from "../types/struct.js";
import { option } from "../types/option.js";
import { int64 } from "../types/int64.js";
import { uint64 } from "../types/uint64.js";
import { uint32 } from "../types/uint32.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { TimeBounds, type TimeBoundsWire } from "./time-bounds.js";
import { LedgerBounds, type LedgerBoundsWire } from "./ledger-bounds.js";
import { SignerKey, type SignerKeyWire } from "./signer-key.js";

export interface PreconditionsV2Wire {
  timeBounds: TimeBoundsWire | null;
  ledgerBounds: LedgerBoundsWire | null;
  minSeqNum: bigint | null;
  minSeqAge: bigint;
  minSeqLedgerGap: number;
  extraSigners: SignerKeyWire[];
}

/**
 * ```xdr
 * struct PreconditionsV2
 * {
 *     TimeBounds* timeBounds;
 *
 *     // Transaction only valid for ledger numbers n such that
 *     // minLedger <= n < maxLedger (if maxLedger == 0, then
 *     // only minLedger is checked)
 *     LedgerBounds* ledgerBounds;
 *
 *     // If NULL, only valid when sourceAccount's sequence number
 *     // is seqNum - 1.  Otherwise, valid when sourceAccount's
 *     // sequence number n satisfies minSeqNum <= n < tx.seqNum.
 *     // Note that after execution the account's sequence number
 *     // is always raised to tx.seqNum, and a transaction is not
 *     // valid if tx.seqNum is too high to ensure replay protection.
 *     SequenceNumber* minSeqNum;
 *
 *     // For the transaction to be valid, the current ledger time must
 *     // be at least minSeqAge greater than sourceAccount's seqTime.
 *     Duration minSeqAge;
 *
 *     // For the transaction to be valid, the current ledger number
 *     // must be at least minSeqLedgerGap greater than sourceAccount's
 *     // seqLedger.
 *     uint32 minSeqLedgerGap;
 *
 *     // For the transaction to be valid, there must be a signature
 *     // corresponding to every Signer in this array, even if the
 *     // signature is not otherwise required by the sourceAccount or
 *     // operations.
 *     SignerKey extraSigners<2>;
 * };
 * ```
 */
export class PreconditionsV2 extends XdrValue {
  readonly timeBounds: TimeBounds | null;
  readonly ledgerBounds: LedgerBounds | null;
  readonly minSeqNum: bigint | null;
  readonly minSeqAge: bigint;
  readonly minSeqLedgerGap: number;
  readonly extraSigners: SignerKey[];

  static readonly schema: XdrType<PreconditionsV2Wire> = struct(
    "PreconditionsV2",
    {
      timeBounds: option(TimeBounds.schema),
      ledgerBounds: option(LedgerBounds.schema),
      minSeqNum: option(int64()),
      minSeqAge: uint64(),
      minSeqLedgerGap: uint32(),
      extraSigners: array(SignerKey.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    timeBounds: TimeBounds | null;
    ledgerBounds: LedgerBounds | null;
    minSeqNum: bigint | null;
    minSeqAge: bigint;
    minSeqLedgerGap: number;
    extraSigners: SignerKey[];
  }) {
    super();
    this.timeBounds = input.timeBounds;
    this.ledgerBounds = input.ledgerBounds;
    this.minSeqNum = input.minSeqNum;
    this.minSeqAge = input.minSeqAge;
    this.minSeqLedgerGap = input.minSeqLedgerGap;
    this.extraSigners = input.extraSigners;
  }

  toXdrObject(): PreconditionsV2Wire {
    return {
      timeBounds:
        this.timeBounds === null ? null : this.timeBounds.toXdrObject(),
      ledgerBounds:
        this.ledgerBounds === null ? null : this.ledgerBounds.toXdrObject(),
      minSeqNum: this.minSeqNum,
      minSeqAge: this.minSeqAge,
      minSeqLedgerGap: this.minSeqLedgerGap,
      extraSigners: this.extraSigners.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: PreconditionsV2Wire): PreconditionsV2 {
    return new PreconditionsV2({
      timeBounds:
        wire.timeBounds === null
          ? null
          : TimeBounds.fromXdrObject(wire.timeBounds),
      ledgerBounds:
        wire.ledgerBounds === null
          ? null
          : LedgerBounds.fromXdrObject(wire.ledgerBounds),
      minSeqNum: wire.minSeqNum,
      minSeqAge: wire.minSeqAge,
      minSeqLedgerGap: wire.minSeqLedgerGap,
      extraSigners: wire.extraSigners.map((w) => SignerKey.fromXdrObject(w)),
    });
  }
}
