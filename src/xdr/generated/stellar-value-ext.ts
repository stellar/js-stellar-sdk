/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union, void as voidType } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
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
import {
  StellarValueSignedMsValue,
  type StellarValueSignedMsValueWire,
} from "./stellar-value-signed-ms-value.js";
import {
  StellarValueProposedMsValue,
  type StellarValueProposedMsValueWire,
} from "./stellar-value-proposed-ms-value.js";

export type StellarValueExtWire =
  | { v: 0 }
  | { v: 1; lcValueSignature: LedgerCloseValueSignatureWire }
  | { v: 2; proposedValue: StellarValueProposedValueWire }
  | { v: 3; signedMsValue: StellarValueSignedMsValueWire }
  | { v: 4; proposedMsValue: StellarValueProposedMsValueWire };

export type StellarValueExtVariantName =
  | "stellarValueBasic"
  | "stellarValueSigned"
  | "stellarValueEmptyTxSet"
  | "stellarValueSignedMs"
  | "stellarValueEmptyTxSetMs";

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
 * #ifdef MS_CLOSE_TIME
 *     case STELLAR_VALUE_SIGNED_MS:
 *         struct
 *         {
 *             TimePointMilliseconds closeTimeMs; // closeTime == closeTimeMs / 1000
 *             LedgerCloseValueSignature lcValueSignature;
 *         } signedMsValue;
 *     case STELLAR_VALUE_EMPTY_TX_SET_MS:
 *         struct
 *         {
 *             TimePointMilliseconds closeTimeMs; // closeTime == closeTimeMs / 1000
 *             Hash txSetHash;
 *             Hash previousLedgerHash;
 *             uint32 previousLedgerVersion;
 *             LedgerCloseValueSignature lcValueSignature;
 *         } proposedMsValue;
 * #endif // MS_CLOSE_TIME
 *     }
 * ```
 */
abstract class StellarValueExtBase extends XdrValue {
  abstract readonly type: StellarValueExtVariantName;

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === StellarValueExtBase) {
      throw new TypeError(
        "new xdr.StellarValueExt(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.StellarValueExt.stellarValueBasic() " +
          "(or another arm factory) instead.",
      );
    }
  }

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
        case_(
          "stellarValueSignedMs",
          3,
          field("signedMsValue", StellarValueSignedMsValue.schema),
        ),
        case_(
          "stellarValueEmptyTxSetMs",
          4,
          field("proposedMsValue", StellarValueProposedMsValue.schema),
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

  static stellarValueSignedMs(
    signedMsValue: StellarValueSignedMsValue,
  ): StellarValueExtSignedMs {
    return new StellarValueExtSignedMs(signedMsValue);
  }

  static stellarValueEmptyTxSetMs(
    proposedMsValue: StellarValueProposedMsValue,
  ): StellarValueExtEmptyTxSetMs {
    return new StellarValueExtEmptyTxSetMs(proposedMsValue);
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
      case 3:
        return new StellarValueExtSignedMs(
          StellarValueSignedMsValue.fromXdrObject(wire.signedMsValue),
        );
      case 4:
        return new StellarValueExtEmptyTxSetMs(
          StellarValueProposedMsValue.fromXdrObject(wire.proposedMsValue),
        );
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `StellarValueExt: unknown v ${(wire as { v: unknown }).v}`,
    );
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

export class StellarValueExtSignedMs extends StellarValueExtBase {
  readonly type = "stellarValueSignedMs" as const;
  readonly signedMsValue: StellarValueSignedMsValue;

  constructor(signedMsValue: StellarValueSignedMsValue) {
    super();
    this.signedMsValue = signedMsValue;
  }

  get value(): StellarValueSignedMsValue {
    return this.signedMsValue;
  }

  toXdrObject(): Extract<StellarValueExtWire, { v: 3 }> {
    return { v: 3, signedMsValue: this.signedMsValue.toXdrObject() };
  }
}

export class StellarValueExtEmptyTxSetMs extends StellarValueExtBase {
  readonly type = "stellarValueEmptyTxSetMs" as const;
  readonly proposedMsValue: StellarValueProposedMsValue;

  constructor(proposedMsValue: StellarValueProposedMsValue) {
    super();
    this.proposedMsValue = proposedMsValue;
  }

  get value(): StellarValueProposedMsValue {
    return this.proposedMsValue;
  }

  toXdrObject(): Extract<StellarValueExtWire, { v: 4 }> {
    return { v: 4, proposedMsValue: this.proposedMsValue.toXdrObject() };
  }
}

export type StellarValueExt =
  | StellarValueExtBasic
  | StellarValueExtSigned
  | StellarValueExtEmptyTxSet
  | StellarValueExtSignedMs
  | StellarValueExtEmptyTxSetMs;
export const StellarValueExt = StellarValueExtBase;
