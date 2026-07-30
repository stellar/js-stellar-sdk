/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { StellarValueType } from "./stellar-value-type.js";
import {
  LedgerCloseValueSignature,
  type LedgerCloseValueSignatureWire,
} from "./ledger-close-value-signature.js";
import {
  StellarValueProposedValue,
  type StellarValueProposedValueWire,
} from "./stellar-value-proposed-value.js";

export type StellarValueExtWire =
  | { v: 0 }
  | { v: 1; lcValueSignature: LedgerCloseValueSignatureWire }
  | { v: 2; proposedValue: StellarValueProposedValueWire };

export type StellarValueExtVariantName =
  | "stellarValueBasic"
  | "stellarValueSigned"
  | "stellarValueEmptyTxSet";

/**
 * ```xdr
 * union switch (StellarValueType v)
 *     {
 *     case STELLAR_VALUE_BASIC:
 *         void;
 *     case STELLAR_VALUE_SIGNED:
 *         LedgerCloseValueSignature lcValueSignature;
 *     case STELLAR_VALUE_EMPTY_TX_SET:
 *         struct
 *         {
 *             Hash txSetHash;
 *             Hash previousLedgerHash;
 *             uint32 previousLedgerVersion;
 *             LedgerCloseValueSignature lcValueSignature;
 *         } proposedValue;
 *     }
 * ```
 */
abstract class StellarValueExtBase extends XdrValue {
  abstract readonly type: StellarValueExtVariantName;

  static readonly schema: XdrType<StellarValueExtWire> = union(
    "StellarValueExt",
    {
      switchOn: StellarValueType.schema,
      cases: [
        case_("stellarValueBasic", 0, voidType()),
        case_(
          "stellarValueSigned",
          1,
          field("lcValueSignature", LedgerCloseValueSignature.schema),
        ),
        case_(
          "stellarValueEmptyTxSet",
          2,
          field("proposedValue", StellarValueProposedValue.schema),
        ),
      ],
      switchKey: "v",
    },
  );

  static stellarValueBasic(): StellarValueExtBasic {
    return new StellarValueExtBasic();
  }

  static stellarValueSigned(
    lcValueSignature: LedgerCloseValueSignature,
  ): StellarValueExtSigned {
    return new StellarValueExtSigned(lcValueSignature);
  }

  static stellarValueEmptyTxSet(
    proposedValue: StellarValueProposedValue,
  ): StellarValueExtEmptyTxSet {
    return new StellarValueExtEmptyTxSet(proposedValue);
  }

  static fromXdrObject(wire: StellarValueExtWire): StellarValueExt {
    switch (wire.v) {
      case 0:
        return new StellarValueExtBasic();
      case 1:
        return new StellarValueExtSigned(
          LedgerCloseValueSignature.fromXdrObject(wire.lcValueSignature),
        );
      case 2:
        return new StellarValueExtEmptyTxSet(
          StellarValueProposedValue.fromXdrObject(wire.proposedValue),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete StellarValueExt variant.
   * Use this instead of `instanceof StellarValueExt`: the exported `StellarValueExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `StellarValueExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is StellarValueExt {
    return value instanceof StellarValueExtBase;
  }

  abstract toXdrObject(): StellarValueExtWire;
}

export class StellarValueExtBasic extends StellarValueExtBase {
  readonly type = "stellarValueBasic" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<StellarValueExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class StellarValueExtSigned extends StellarValueExtBase {
  readonly type = "stellarValueSigned" as const;
  readonly lcValueSignature: LedgerCloseValueSignature;

  constructor(lcValueSignature: LedgerCloseValueSignature) {
    super();
    this.lcValueSignature = lcValueSignature;
  }

  get value(): LedgerCloseValueSignature {
    return this.lcValueSignature;
  }

  toXdrObject(): Extract<StellarValueExtWire, { v: 1 }> {
    return { v: 1, lcValueSignature: this.lcValueSignature.toXdrObject() };
  }
}

export class StellarValueExtEmptyTxSet extends StellarValueExtBase {
  readonly type = "stellarValueEmptyTxSet" as const;
  readonly proposedValue: StellarValueProposedValue;

  constructor(proposedValue: StellarValueProposedValue) {
    super();
    this.proposedValue = proposedValue;
  }

  get value(): StellarValueProposedValue {
    return this.proposedValue;
  }

  toXdrObject(): Extract<StellarValueExtWire, { v: 2 }> {
    return { v: 2, proposedValue: this.proposedValue.toXdrObject() };
  }
}

export type StellarValueExt =
  | StellarValueExtBasic
  | StellarValueExtSigned
  | StellarValueExtEmptyTxSet;
export const StellarValueExt = StellarValueExtBase;
