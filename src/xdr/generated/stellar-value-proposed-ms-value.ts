import { struct, uint32, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  LedgerCloseValueSignature,
  type LedgerCloseValueSignatureWire,
} from "./ledger-close-value-signature.js";

export interface StellarValueProposedMsValueWire {
  closeTimeMs: bigint;
  txSetHash: HashWire;
  previousLedgerHash: HashWire;
  previousLedgerVersion: number;
  lcValueSignature: LedgerCloseValueSignatureWire;
}

/**
 * ```xdr
 * struct
 *         {
 *             TimePointMilliseconds closeTimeMs; // closeTime == closeTimeMs / 1000
 *             Hash txSetHash;
 *             Hash previousLedgerHash;
 *             uint32 previousLedgerVersion;
 *             LedgerCloseValueSignature lcValueSignature;
 *         }
 * ```
 */
export class StellarValueProposedMsValue extends XdrValue {
  readonly closeTimeMs: bigint;
  readonly txSetHash: Hash;
  readonly previousLedgerHash: Hash;
  readonly previousLedgerVersion: number;
  readonly lcValueSignature: LedgerCloseValueSignature;

  static readonly schema: XdrType<StellarValueProposedMsValueWire> = struct(
    "StellarValueProposedMsValue",
    {
      closeTimeMs: uint64(),
      txSetHash: Hash.schema,
      previousLedgerHash: Hash.schema,
      previousLedgerVersion: uint32(),
      lcValueSignature: LedgerCloseValueSignature.schema,
    },
  );

  constructor(input: {
    closeTimeMs: bigint;
    txSetHash: Hash | Uint8Array | string;
    previousLedgerHash: Hash | Uint8Array | string;
    previousLedgerVersion: number;
    lcValueSignature: LedgerCloseValueSignature;
  }) {
    super();
    this.closeTimeMs = input.closeTimeMs;
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

  toXdrObject(): StellarValueProposedMsValueWire {
    return {
      closeTimeMs: this.closeTimeMs,
      txSetHash: this.txSetHash.toXdrObject(),
      previousLedgerHash: this.previousLedgerHash.toXdrObject(),
      previousLedgerVersion: this.previousLedgerVersion,
      lcValueSignature: this.lcValueSignature.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: StellarValueProposedMsValueWire,
  ): StellarValueProposedMsValue {
    return new StellarValueProposedMsValue({
      closeTimeMs: wire.closeTimeMs,
      txSetHash: Hash.fromXdrObject(wire.txSetHash),
      previousLedgerHash: Hash.fromXdrObject(wire.previousLedgerHash),
      previousLedgerVersion: wire.previousLedgerVersion,
      lcValueSignature: LedgerCloseValueSignature.fromXdrObject(
        wire.lcValueSignature,
      ),
    });
  }
}
