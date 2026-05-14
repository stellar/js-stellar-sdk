// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { LedgerHeaderExt } from "./ledger-header-ext.js";
import { StellarValue } from "./stellar-value.js";
export interface LedgerHeader {
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
}
export const LedgerHeader = xdr.struct("LedgerHeader", {
  ledgerVersion: xdr.uint32(),
  previousLedgerHash: xdr.lazy(() => Hash),
  scpValue: xdr.lazy(() => StellarValue),
  txSetResultHash: xdr.lazy(() => Hash),
  bucketListHash: xdr.lazy(() => Hash),
  ledgerSeq: xdr.uint32(),
  totalCoins: xdr.int64(),
  feePool: xdr.int64(),
  inflationSeq: xdr.uint32(),
  idPool: xdr.uint64(),
  baseFee: xdr.uint32(),
  baseReserve: xdr.uint32(),
  maxTxSetSize: xdr.uint32(),
  skipList: xdr.fixedArray(
    xdr.lazy(() => Hash),
    4,
  ),
  ext: xdr.lazy(() => LedgerHeaderExt),
}) as xdr.XdrType<LedgerHeader>;
