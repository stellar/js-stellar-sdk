/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { StellarValueType } from "./stellar-value-type.js";
import {
  LedgerCloseValueSignature,
  type LedgerCloseValueSignatureWire,
} from "./ledger-close-value-signature.js";

export type StellarValueExtWire =
  | { v: 0 }
  | { v: 1; lcValueSignature: LedgerCloseValueSignatureWire };

export type StellarValueExtVariantName =
  | "stellarValueBasic"
  | "stellarValueSigned";

/**
 * ```xdr
 * union switch (StellarValueType v)
 *     {
 *     case STELLAR_VALUE_BASIC:
 *         void;
 *     case STELLAR_VALUE_SIGNED:
 *         LedgerCloseValueSignature lcValueSignature;
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

  static fromXdrObject(wire: StellarValueExtWire): StellarValueExt {
    switch (wire.v) {
      case 0:
        return new StellarValueExtBasic();
      case 1:
        return new StellarValueExtSigned(
          LedgerCloseValueSignature.fromXdrObject(wire.lcValueSignature),
        );
    }
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

export type StellarValueExt = StellarValueExtBasic | StellarValueExtSigned;
export const StellarValueExt = StellarValueExtBase;
