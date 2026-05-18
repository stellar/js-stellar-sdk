import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import { int64 } from "../types/int64.js";
import { uint64 } from "../types/uint64.js";
import { fixedArray } from "../types/fixed-array.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import { StellarValue, type StellarValueWire } from "./stellar-value.js";
import {
  LedgerHeaderExt,
  type LedgerHeaderExtWire,
} from "./ledger-header-ext.js";

export interface LedgerHeaderWire {
  ledgerVersion: number;
  previousLedgerHash: HashWire;
  scpValue: StellarValueWire;
  txSetResultHash: HashWire;
  bucketListHash: HashWire;
  ledgerSeq: number;
  totalCoins: bigint;
  feePool: bigint;
  inflationSeq: number;
  idPool: bigint;
  baseFee: number;
  baseReserve: number;
  maxTxSetSize: number;
  skipList: HashWire[];
  ext: LedgerHeaderExtWire;
}

/**
 * ```xdr
 * struct LedgerHeader
 * {
 *     uint32 ledgerVersion;    // the protocol version of the ledger
 *     Hash previousLedgerHash; // hash of the previous ledger header
 *     StellarValue scpValue;   // what consensus agreed to
 *     Hash txSetResultHash;    // the TransactionResultSet that led to this ledger
 *     Hash bucketListHash;     // hash of the ledger state
 *
 *     uint32 ledgerSeq; // sequence number of this ledger
 *
 *     int64 totalCoins; // total number of stroops in existence.
 *                       // 10,000,000 stroops in 1 XLM
 *
 *     int64 feePool;       // fees burned since last inflation run
 *     uint32 inflationSeq; // inflation sequence number
 *
 *     uint64 idPool; // last used global ID, used for generating objects
 *
 *     uint32 baseFee;     // base fee per operation in stroops
 *     uint32 baseReserve; // account base reserve in stroops
 *
 *     uint32 maxTxSetSize; // maximum size a transaction set can be
 *
 *     Hash skipList[4]; // hashes of ledgers in the past. allows you to jump back
 *                       // in time without walking the chain back ledger by ledger
 *                       // each slot contains the oldest ledger that is mod of
 *                       // either 50  5000  50000 or 500000 depending on index
 *                       // skipList[0] mod(50), skipList[1] mod(5000), etc
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         LedgerHeaderExtensionV1 v1;
 *     }
 *     ext;
 * };
 * ```
 */
export class LedgerHeader extends XdrValue {
  readonly ledgerVersion: number;
  readonly previousLedgerHash: Hash;
  readonly scpValue: StellarValue;
  readonly txSetResultHash: Hash;
  readonly bucketListHash: Hash;
  readonly ledgerSeq: number;
  readonly totalCoins: bigint;
  readonly feePool: bigint;
  readonly inflationSeq: number;
  readonly idPool: bigint;
  readonly baseFee: number;
  readonly baseReserve: number;
  readonly maxTxSetSize: number;
  readonly skipList: Hash[];
  readonly ext: LedgerHeaderExt;

  static readonly schema: XdrType<LedgerHeaderWire> = struct("LedgerHeader", {
    ledgerVersion: uint32(),
    previousLedgerHash: Hash.schema,
    scpValue: StellarValue.schema,
    txSetResultHash: Hash.schema,
    bucketListHash: Hash.schema,
    ledgerSeq: uint32(),
    totalCoins: int64(),
    feePool: int64(),
    inflationSeq: uint32(),
    idPool: uint64(),
    baseFee: uint32(),
    baseReserve: uint32(),
    maxTxSetSize: uint32(),
    skipList: fixedArray(Hash.schema, 4),
    ext: LedgerHeaderExt.schema,
  });

  constructor(input: {
    ledgerVersion: number;
    previousLedgerHash: Hash | Uint8Array | string;
    scpValue: StellarValue;
    txSetResultHash: Hash | Uint8Array | string;
    bucketListHash: Hash | Uint8Array | string;
    ledgerSeq: number;
    totalCoins: bigint;
    feePool: bigint;
    inflationSeq: number;
    idPool: bigint;
    baseFee: number;
    baseReserve: number;
    maxTxSetSize: number;
    skipList: Hash[];
    ext: LedgerHeaderExt;
  }) {
    super();
    this.ledgerVersion = input.ledgerVersion;
    this.previousLedgerHash =
      input.previousLedgerHash instanceof Hash
        ? input.previousLedgerHash
        : new Hash(input.previousLedgerHash);
    this.scpValue = input.scpValue;
    this.txSetResultHash =
      input.txSetResultHash instanceof Hash
        ? input.txSetResultHash
        : new Hash(input.txSetResultHash);
    this.bucketListHash =
      input.bucketListHash instanceof Hash
        ? input.bucketListHash
        : new Hash(input.bucketListHash);
    this.ledgerSeq = input.ledgerSeq;
    this.totalCoins = input.totalCoins;
    this.feePool = input.feePool;
    this.inflationSeq = input.inflationSeq;
    this.idPool = input.idPool;
    this.baseFee = input.baseFee;
    this.baseReserve = input.baseReserve;
    this.maxTxSetSize = input.maxTxSetSize;
    this.skipList = input.skipList;
    this.ext = input.ext;
  }

  toXdrObject(): LedgerHeaderWire {
    return {
      ledgerVersion: this.ledgerVersion,
      previousLedgerHash: this.previousLedgerHash.toXdrObject(),
      scpValue: this.scpValue.toXdrObject(),
      txSetResultHash: this.txSetResultHash.toXdrObject(),
      bucketListHash: this.bucketListHash.toXdrObject(),
      ledgerSeq: this.ledgerSeq,
      totalCoins: this.totalCoins,
      feePool: this.feePool,
      inflationSeq: this.inflationSeq,
      idPool: this.idPool,
      baseFee: this.baseFee,
      baseReserve: this.baseReserve,
      maxTxSetSize: this.maxTxSetSize,
      skipList: this.skipList.map((v) => v.toXdrObject()),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: LedgerHeaderWire): LedgerHeader {
    return new LedgerHeader({
      ledgerVersion: wire.ledgerVersion,
      previousLedgerHash: Hash.fromXdrObject(wire.previousLedgerHash),
      scpValue: StellarValue.fromXdrObject(wire.scpValue),
      txSetResultHash: Hash.fromXdrObject(wire.txSetResultHash),
      bucketListHash: Hash.fromXdrObject(wire.bucketListHash),
      ledgerSeq: wire.ledgerSeq,
      totalCoins: wire.totalCoins,
      feePool: wire.feePool,
      inflationSeq: wire.inflationSeq,
      idPool: wire.idPool,
      baseFee: wire.baseFee,
      baseReserve: wire.baseReserve,
      maxTxSetSize: wire.maxTxSetSize,
      skipList: wire.skipList.map((w) => Hash.fromXdrObject(w)),
      ext: LedgerHeaderExt.fromXdrObject(wire.ext),
    });
  }
}
