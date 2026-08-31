import { struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerCloseValueSignature,
  type LedgerCloseValueSignatureWire,
} from "./ledger-close-value-signature.js";

export interface StellarValueSignedMsValueWire {
  closeTimeMs: bigint;
  lcValueSignature: LedgerCloseValueSignatureWire;
}

/**
 * ```xdr
 * struct
 *         {
 *             TimePointMilliseconds closeTimeMs; // closeTime == closeTimeMs / 1000
 *             LedgerCloseValueSignature lcValueSignature;
 *         }
 * ```
 */
export class StellarValueSignedMsValue extends XdrValue {
  readonly closeTimeMs: bigint;
  readonly lcValueSignature: LedgerCloseValueSignature;

  static readonly schema: XdrType<StellarValueSignedMsValueWire> = struct(
    "StellarValueSignedMsValue",
    {
      closeTimeMs: uint64(),
      lcValueSignature: LedgerCloseValueSignature.schema,
    },
  );

  constructor(input: {
    closeTimeMs: bigint;
    lcValueSignature: LedgerCloseValueSignature;
  }) {
    super();
    this.closeTimeMs = input.closeTimeMs;
    this.lcValueSignature = input.lcValueSignature;
  }

  toXdrObject(): StellarValueSignedMsValueWire {
    return {
      closeTimeMs: this.closeTimeMs,
      lcValueSignature: this.lcValueSignature.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: StellarValueSignedMsValueWire,
  ): StellarValueSignedMsValue {
    return new StellarValueSignedMsValue({
      closeTimeMs: wire.closeTimeMs,
      lcValueSignature: LedgerCloseValueSignature.fromXdrObject(
        wire.lcValueSignature,
      ),
    });
  }
}
