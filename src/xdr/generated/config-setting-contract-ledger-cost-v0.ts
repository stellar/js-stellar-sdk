import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingContractLedgerCostV0Wire {
  ledgerMaxDiskReadEntries: number;
  ledgerMaxDiskReadBytes: number;
  ledgerMaxWriteLedgerEntries: number;
  ledgerMaxWriteBytes: number;
  txMaxDiskReadEntries: number;
  txMaxDiskReadBytes: number;
  txMaxWriteLedgerEntries: number;
  txMaxWriteBytes: number;
  feeDiskReadLedgerEntry: bigint;
  feeWriteLedgerEntry: bigint;
  feeDiskRead1Kb: bigint;
  sorobanStateTargetSizeBytes: bigint;
  rentFee1KbSorobanStateSizeLow: bigint;
  rentFee1KbSorobanStateSizeHigh: bigint;
  sorobanStateRentFeeGrowthFactor: number;
}

/**
 * ```xdr
 * struct ConfigSettingContractLedgerCostV0
 * {
 *     // Maximum number of disk entry read operations per ledger
 *     uint32 ledgerMaxDiskReadEntries;
 *     // Maximum number of bytes of disk reads that can be performed per ledger
 *     uint32 ledgerMaxDiskReadBytes;
 *     // Maximum number of ledger entry write operations per ledger
 *     uint32 ledgerMaxWriteLedgerEntries;
 *     // Maximum number of bytes that can be written per ledger
 *     uint32 ledgerMaxWriteBytes;
 *
 *     // Maximum number of disk entry read operations per transaction
 *     uint32 txMaxDiskReadEntries;
 *     // Maximum number of bytes of disk reads that can be performed per transaction
 *     uint32 txMaxDiskReadBytes;
 *     // Maximum number of ledger entry write operations per transaction
 *     uint32 txMaxWriteLedgerEntries;
 *     // Maximum number of bytes that can be written per transaction
 *     uint32 txMaxWriteBytes;
 *
 *     int64 feeDiskReadLedgerEntry;  // Fee per disk ledger entry read
 *     int64 feeWriteLedgerEntry;     // Fee per ledger entry write
 *
 *     int64 feeDiskRead1KB;          // Fee for reading 1KB disk
 *
 *     // The following parameters determine the write fee per 1KB.
 *     // Rent fee grows linearly until soroban state reaches this size
 *     int64 sorobanStateTargetSizeBytes;
 *     // Fee per 1KB rent when the soroban state is empty
 *     int64 rentFee1KBSorobanStateSizeLow;
 *     // Fee per 1KB rent when the soroban state has reached `sorobanStateTargetSizeBytes`
 *     int64 rentFee1KBSorobanStateSizeHigh;
 *     // Rent fee multiplier for any additional data past the first `sorobanStateTargetSizeBytes`
 *     uint32 sorobanStateRentFeeGrowthFactor;
 * };
 * ```
 */
export class ConfigSettingContractLedgerCostV0 extends XdrValue {
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
  readonly feeDiskRead1Kb: bigint;
  readonly sorobanStateTargetSizeBytes: bigint;
  readonly rentFee1KbSorobanStateSizeLow: bigint;
  readonly rentFee1KbSorobanStateSizeHigh: bigint;
  readonly sorobanStateRentFeeGrowthFactor: number;

  static readonly schema: XdrType<ConfigSettingContractLedgerCostV0Wire> =
    struct("ConfigSettingContractLedgerCostV0", {
      ledgerMaxDiskReadEntries: uint32(),
      ledgerMaxDiskReadBytes: uint32(),
      ledgerMaxWriteLedgerEntries: uint32(),
      ledgerMaxWriteBytes: uint32(),
      txMaxDiskReadEntries: uint32(),
      txMaxDiskReadBytes: uint32(),
      txMaxWriteLedgerEntries: uint32(),
      txMaxWriteBytes: uint32(),
      feeDiskReadLedgerEntry: int64(),
      feeWriteLedgerEntry: int64(),
      feeDiskRead1Kb: int64(),
      sorobanStateTargetSizeBytes: int64(),
      rentFee1KbSorobanStateSizeLow: int64(),
      rentFee1KbSorobanStateSizeHigh: int64(),
      sorobanStateRentFeeGrowthFactor: uint32(),
    });

  constructor(input: {
    ledgerMaxDiskReadEntries: number;
    ledgerMaxDiskReadBytes: number;
    ledgerMaxWriteLedgerEntries: number;
    ledgerMaxWriteBytes: number;
    txMaxDiskReadEntries: number;
    txMaxDiskReadBytes: number;
    txMaxWriteLedgerEntries: number;
    txMaxWriteBytes: number;
    feeDiskReadLedgerEntry: bigint;
    feeWriteLedgerEntry: bigint;
    feeDiskRead1Kb: bigint;
    sorobanStateTargetSizeBytes: bigint;
    rentFee1KbSorobanStateSizeLow: bigint;
    rentFee1KbSorobanStateSizeHigh: bigint;
    sorobanStateRentFeeGrowthFactor: number;
  }) {
    super();
    this.ledgerMaxDiskReadEntries = input.ledgerMaxDiskReadEntries;
    this.ledgerMaxDiskReadBytes = input.ledgerMaxDiskReadBytes;
    this.ledgerMaxWriteLedgerEntries = input.ledgerMaxWriteLedgerEntries;
    this.ledgerMaxWriteBytes = input.ledgerMaxWriteBytes;
    this.txMaxDiskReadEntries = input.txMaxDiskReadEntries;
    this.txMaxDiskReadBytes = input.txMaxDiskReadBytes;
    this.txMaxWriteLedgerEntries = input.txMaxWriteLedgerEntries;
    this.txMaxWriteBytes = input.txMaxWriteBytes;
    this.feeDiskReadLedgerEntry = input.feeDiskReadLedgerEntry;
    this.feeWriteLedgerEntry = input.feeWriteLedgerEntry;
    this.feeDiskRead1Kb = input.feeDiskRead1Kb;
    this.sorobanStateTargetSizeBytes = input.sorobanStateTargetSizeBytes;
    this.rentFee1KbSorobanStateSizeLow = input.rentFee1KbSorobanStateSizeLow;
    this.rentFee1KbSorobanStateSizeHigh = input.rentFee1KbSorobanStateSizeHigh;
    this.sorobanStateRentFeeGrowthFactor =
      input.sorobanStateRentFeeGrowthFactor;
  }

  toXdrObject(): ConfigSettingContractLedgerCostV0Wire {
    return {
      ledgerMaxDiskReadEntries: this.ledgerMaxDiskReadEntries,
      ledgerMaxDiskReadBytes: this.ledgerMaxDiskReadBytes,
      ledgerMaxWriteLedgerEntries: this.ledgerMaxWriteLedgerEntries,
      ledgerMaxWriteBytes: this.ledgerMaxWriteBytes,
      txMaxDiskReadEntries: this.txMaxDiskReadEntries,
      txMaxDiskReadBytes: this.txMaxDiskReadBytes,
      txMaxWriteLedgerEntries: this.txMaxWriteLedgerEntries,
      txMaxWriteBytes: this.txMaxWriteBytes,
      feeDiskReadLedgerEntry: this.feeDiskReadLedgerEntry,
      feeWriteLedgerEntry: this.feeWriteLedgerEntry,
      feeDiskRead1Kb: this.feeDiskRead1Kb,
      sorobanStateTargetSizeBytes: this.sorobanStateTargetSizeBytes,
      rentFee1KbSorobanStateSizeLow: this.rentFee1KbSorobanStateSizeLow,
      rentFee1KbSorobanStateSizeHigh: this.rentFee1KbSorobanStateSizeHigh,
      sorobanStateRentFeeGrowthFactor: this.sorobanStateRentFeeGrowthFactor,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingContractLedgerCostV0Wire,
  ): ConfigSettingContractLedgerCostV0 {
    return new ConfigSettingContractLedgerCostV0({
      ledgerMaxDiskReadEntries: wire.ledgerMaxDiskReadEntries,
      ledgerMaxDiskReadBytes: wire.ledgerMaxDiskReadBytes,
      ledgerMaxWriteLedgerEntries: wire.ledgerMaxWriteLedgerEntries,
      ledgerMaxWriteBytes: wire.ledgerMaxWriteBytes,
      txMaxDiskReadEntries: wire.txMaxDiskReadEntries,
      txMaxDiskReadBytes: wire.txMaxDiskReadBytes,
      txMaxWriteLedgerEntries: wire.txMaxWriteLedgerEntries,
      txMaxWriteBytes: wire.txMaxWriteBytes,
      feeDiskReadLedgerEntry: wire.feeDiskReadLedgerEntry,
      feeWriteLedgerEntry: wire.feeWriteLedgerEntry,
      feeDiskRead1Kb: wire.feeDiskRead1Kb,
      sorobanStateTargetSizeBytes: wire.sorobanStateTargetSizeBytes,
      rentFee1KbSorobanStateSizeLow: wire.rentFee1KbSorobanStateSizeLow,
      rentFee1KbSorobanStateSizeHigh: wire.rentFee1KbSorobanStateSizeHigh,
      sorobanStateRentFeeGrowthFactor: wire.sorobanStateRentFeeGrowthFactor,
    });
  }
}
