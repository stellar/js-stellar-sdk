/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { RevokeSponsorshipType } from "./revoke-sponsorship-type.js";
import { LedgerKey, type LedgerKeyWire } from "./ledger-key.js";
import {
  RevokeSponsorshipOpSigner,
  type RevokeSponsorshipOpSignerWire,
} from "./revoke-sponsorship-op-signer.js";

export type RevokeSponsorshipOpWire =
  | { type: 0; ledgerKey: LedgerKeyWire }
  | { type: 1; signer: RevokeSponsorshipOpSignerWire };

export type RevokeSponsorshipOpVariantName =
  | "revokeSponsorshipLedgerEntry"
  | "revokeSponsorshipSigner";

/**
 * ```xdr
 * union RevokeSponsorshipOp switch (RevokeSponsorshipType type)
 * {
 * case REVOKE_SPONSORSHIP_LEDGER_ENTRY:
 *     LedgerKey ledgerKey;
 * case REVOKE_SPONSORSHIP_SIGNER:
 *     struct
 *     {
 *         AccountID accountID;
 *         SignerKey signerKey;
 *     } signer;
 * };
 * ```
 */
abstract class RevokeSponsorshipOpBase extends XdrValue {
  abstract readonly type: RevokeSponsorshipOpVariantName;

  static readonly schema: XdrType<RevokeSponsorshipOpWire> = union(
    "RevokeSponsorshipOp",
    {
      switchOn: RevokeSponsorshipType.schema,
      cases: [
        case_(
          "revokeSponsorshipLedgerEntry",
          0,
          field("ledgerKey", LedgerKey.schema),
        ),
        case_(
          "revokeSponsorshipSigner",
          1,
          field("signer", RevokeSponsorshipOpSigner.schema),
        ),
      ],
    },
  );

  static revokeSponsorshipLedgerEntry(
    ledgerKey: LedgerKey,
  ): RevokeSponsorshipOpLedgerEntry {
    return new RevokeSponsorshipOpLedgerEntry(ledgerKey);
  }

  static revokeSponsorshipSigner(
    signer: RevokeSponsorshipOpSigner,
  ): RevokeSponsorshipOpSignerArm {
    return new RevokeSponsorshipOpSignerArm(signer);
  }

  static fromXdrObject(wire: RevokeSponsorshipOpWire): RevokeSponsorshipOp {
    switch (wire.type) {
      case 0:
        return new RevokeSponsorshipOpLedgerEntry(
          LedgerKey.fromXdrObject(wire.ledgerKey),
        );
      case 1:
        return new RevokeSponsorshipOpSignerArm(
          RevokeSponsorshipOpSigner.fromXdrObject(wire.signer),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete RevokeSponsorshipOp variant.
   * Use this instead of `instanceof RevokeSponsorshipOp`: the exported `RevokeSponsorshipOp` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `RevokeSponsorshipOp.is(x)` narrows to the union.
   */
  static is(value: unknown): value is RevokeSponsorshipOp {
    return value instanceof RevokeSponsorshipOpBase;
  }

  abstract toXdrObject(): RevokeSponsorshipOpWire;
}

export class RevokeSponsorshipOpLedgerEntry extends RevokeSponsorshipOpBase {
  readonly type = "revokeSponsorshipLedgerEntry" as const;
  readonly ledgerKey: LedgerKey;

  constructor(ledgerKey: LedgerKey) {
    super();
    this.ledgerKey = ledgerKey;
  }

  get value(): LedgerKey {
    return this.ledgerKey;
  }

  toXdrObject(): Extract<RevokeSponsorshipOpWire, { type: 0 }> {
    return { type: 0, ledgerKey: this.ledgerKey.toXdrObject() };
  }
}

export class RevokeSponsorshipOpSignerArm extends RevokeSponsorshipOpBase {
  readonly type = "revokeSponsorshipSigner" as const;
  readonly signer: RevokeSponsorshipOpSigner;

  constructor(signer: RevokeSponsorshipOpSigner) {
    super();
    this.signer = signer;
  }

  get value(): RevokeSponsorshipOpSigner {
    return this.signer;
  }

  toXdrObject(): Extract<RevokeSponsorshipOpWire, { type: 1 }> {
    return { type: 1, signer: this.signer.toXdrObject() };
  }
}

export type RevokeSponsorshipOp =
  | RevokeSponsorshipOpLedgerEntry
  | RevokeSponsorshipOpSignerArm;
export const RevokeSponsorshipOp = RevokeSponsorshipOpBase;
