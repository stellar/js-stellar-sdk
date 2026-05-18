/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { BumpSequenceResultCode } from "./bump-sequence-result-code.js";

export type BumpSequenceResultWire = { code: 0 } | { code: -1 };

export type BumpSequenceResultVariantName =
  | "bumpSequenceSuccess"
  | "bumpSequenceBadSeq";

/**
 * ```xdr
 * union BumpSequenceResult switch (BumpSequenceResultCode code)
 * {
 * case BUMP_SEQUENCE_SUCCESS:
 *     void;
 * case BUMP_SEQUENCE_BAD_SEQ:
 *     void;
 * };
 * ```
 */
abstract class BumpSequenceResultBase extends XdrValue {
  abstract readonly type: BumpSequenceResultVariantName;

  static readonly schema: XdrType<BumpSequenceResultWire> = union(
    "BumpSequenceResult",
    {
      switchOn: BumpSequenceResultCode.schema,
      cases: [
        case_("bumpSequenceSuccess", 0, voidType()),
        case_("bumpSequenceBadSeq", -1, voidType()),
      ],
      switchKey: "code",
    },
  );

  static bumpSequenceSuccess(): BumpSequenceResultSuccess {
    return new BumpSequenceResultSuccess();
  }

  static bumpSequenceBadSeq(): BumpSequenceResultBadSeq {
    return new BumpSequenceResultBadSeq();
  }

  static fromXdrObject(wire: BumpSequenceResultWire): BumpSequenceResult {
    switch (wire.code) {
      case 0:
        return new BumpSequenceResultSuccess();
      case -1:
        return new BumpSequenceResultBadSeq();
    }
  }

  abstract toXdrObject(): BumpSequenceResultWire;
}

export class BumpSequenceResultSuccess extends BumpSequenceResultBase {
  readonly type = "bumpSequenceSuccess" as const;

  toXdrObject(): Extract<BumpSequenceResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class BumpSequenceResultBadSeq extends BumpSequenceResultBase {
  readonly type = "bumpSequenceBadSeq" as const;

  toXdrObject(): Extract<BumpSequenceResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export type BumpSequenceResult =
  | BumpSequenceResultSuccess
  | BumpSequenceResultBadSeq;
export const BumpSequenceResult = BumpSequenceResultBase;
