import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  LedgerCloseValueSignature,
  type LedgerCloseValueSignatureWire,
} from "./ledger-close-value-signature.js";

export interface StellarValueProposedValueWire {
  txSetHash: HashWire;
  previousLedgerHash: HashWire;
  previousLedgerVersion: number;
  lcValueSignature: LedgerCloseValueSignatureWire;
}

/**
 * ```xdr
 * struct
 *         {
 *             Hash txSetHash;
 *             Hash previousLedgerHash;
 *             uint32 previousLedgerVersion;
 *             LedgerCloseValueSignature lcValueSignature;
 *         }
 * ```
 */
export class StellarValueProposedValue extends XdrValue {
  readonly txSetHash: Hash;
  readonly previousLedgerHash: Hash;
  readonly previousLedgerVersion: number;
  readonly lcValueSignature: LedgerCloseValueSignature;

  static readonly schema: XdrType<StellarValueProposedValueWire> = struct(
    "StellarValueProposedValue",
    {
      txSetHash: Hash.schema,
      previousLedgerHash: Hash.schema,
      previousLedgerVersion: uint32(),
      lcValueSignature: LedgerCloseValueSignature.schema,
    },
  );

  constructor(input: {
    txSetHash: Hash | Uint8Array | string;
    previousLedgerHash: Hash | Uint8Array | string;
    previousLedgerVersion: number;
    lcValueSignature: LedgerCloseValueSignature;
  }) {
    super();
    this.txSetHash =
      input.txSetHash instanceof Hash
        ? input.txSetHash
        : new Hash(input.txSetHash);
    this.previousLedgerHash =
      input.previousLedgerHash instanceof Hash
        ? input.previousLedgerHash
        : new Hash(input.previousLedgerHash);
    this.previousLedgerVersion = input.previousLedgerVersion;
    this.lcValueSignature = input.lcValueSignature;
  }

  toXdrObject(): StellarValueProposedValueWire {
    return {
      txSetHash: this.txSetHash.toXdrObject(),
      previousLedgerHash: this.previousLedgerHash.toXdrObject(),
      previousLedgerVersion: this.previousLedgerVersion,
      lcValueSignature: this.lcValueSignature.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: StellarValueProposedValueWire,
  ): StellarValueProposedValue {
    return new StellarValueProposedValue({
      txSetHash: Hash.fromXdrObject(wire.txSetHash),
      previousLedgerHash: Hash.fromXdrObject(wire.previousLedgerHash),
      previousLedgerVersion: wire.previousLedgerVersion,
      lcValueSignature: LedgerCloseValueSignature.fromXdrObject(
        wire.lcValueSignature,
      ),
    });
  }
}
