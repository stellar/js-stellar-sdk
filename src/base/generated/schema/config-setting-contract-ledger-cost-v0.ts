// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ConfigSettingContractLedgerCostV0 {
  readonly ledgerMaxDiskReadEntries: number;
  readonly ledgerMaxDiskReadBytes: number;
  readonly ledgerMaxWriteLedgerEntries: number;
  readonly ledgerMaxWriteBytes: number;
  readonly txMaxDiskReadEntries: number;
  readonly txMaxDiskReadBytes: number;
  readonly txMaxWriteLedgerEntries: number;
  readonly txMaxWriteBytes: number;
  readonly feeDiskReadLedgerEntry: bigint;
  readonly feeWriteLedgerEntry: bigint;
  readonly feeDiskRead1KB: bigint;
  readonly sorobanStateTargetSizeBytes: bigint;
  readonly rentFee1KBSorobanStateSizeLow: bigint;
  readonly rentFee1KBSorobanStateSizeHigh: bigint;
  readonly sorobanStateRentFeeGrowthFactor: number;
}
export const ConfigSettingContractLedgerCostV0 = xdr.struct(
  "ConfigSettingContractLedgerCostV0",
  {
    ledgerMaxDiskReadEntries: xdr.uint32(),
    ledgerMaxDiskReadBytes: xdr.uint32(),
    ledgerMaxWriteLedgerEntries: xdr.uint32(),
    ledgerMaxWriteBytes: xdr.uint32(),
    txMaxDiskReadEntries: xdr.uint32(),
    txMaxDiskReadBytes: xdr.uint32(),
    txMaxWriteLedgerEntries: xdr.uint32(),
    txMaxWriteBytes: xdr.uint32(),
    feeDiskReadLedgerEntry: xdr.int64(),
    feeWriteLedgerEntry: xdr.int64(),
    feeDiskRead1KB: xdr.int64(),
    sorobanStateTargetSizeBytes: xdr.int64(),
    rentFee1KBSorobanStateSizeLow: xdr.int64(),
    rentFee1KBSorobanStateSizeHigh: xdr.int64(),
    sorobanStateRentFeeGrowthFactor: xdr.uint32(),
  },
) as xdr.XdrType<ConfigSettingContractLedgerCostV0>;
