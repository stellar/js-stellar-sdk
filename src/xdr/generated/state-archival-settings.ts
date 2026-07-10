import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface StateArchivalSettingsWire {
  maxEntryTtl: number;
  minTemporaryTtl: number;
  minPersistentTtl: number;
  persistentRentRateDenominator: bigint;
  tempRentRateDenominator: bigint;
  maxEntriesToArchive: number;
  liveSorobanStateSizeWindowSampleSize: number;
  liveSorobanStateSizeWindowSamplePeriod: number;
  evictionScanSize: number;
  startingEvictionScanLevel: number;
}

/**
 * ```xdr
 * struct StateArchivalSettings {
 *     uint32 maxEntryTTL;
 *     uint32 minTemporaryTTL;
 *     uint32 minPersistentTTL;
 *
 *     // rent_fee = wfee_rate_average / rent_rate_denominator_for_type
 *     int64 persistentRentRateDenominator;
 *     int64 tempRentRateDenominator;
 *
 *     // max number of entries that emit archival meta in a single ledger
 *     uint32 maxEntriesToArchive;
 *
 *     // Number of snapshots to use when calculating average live Soroban State size
 *     uint32 liveSorobanStateSizeWindowSampleSize;
 *
 *     // How often to sample the live Soroban State size for the average, in ledgers
 *     uint32 liveSorobanStateSizeWindowSamplePeriod;
 *
 *     // Maximum number of bytes that we scan for eviction per ledger
 *     uint32 evictionScanSize;
 *
 *     // Lowest BucketList level to be scanned to evict entries
 *     uint32 startingEvictionScanLevel;
 * };
 * ```
 */
export class StateArchivalSettings extends XdrValue {
  readonly maxEntryTtl: number;
  readonly minTemporaryTtl: number;
  readonly minPersistentTtl: number;
  readonly persistentRentRateDenominator: bigint;
  readonly tempRentRateDenominator: bigint;
  readonly maxEntriesToArchive: number;
  readonly liveSorobanStateSizeWindowSampleSize: number;
  readonly liveSorobanStateSizeWindowSamplePeriod: number;
  readonly evictionScanSize: number;
  readonly startingEvictionScanLevel: number;

  static readonly schema: XdrType<StateArchivalSettingsWire> = struct(
    "StateArchivalSettings",
    {
      maxEntryTtl: uint32(),
      minTemporaryTtl: uint32(),
      minPersistentTtl: uint32(),
      persistentRentRateDenominator: int64(),
      tempRentRateDenominator: int64(),
      maxEntriesToArchive: uint32(),
      liveSorobanStateSizeWindowSampleSize: uint32(),
      liveSorobanStateSizeWindowSamplePeriod: uint32(),
      evictionScanSize: uint32(),
      startingEvictionScanLevel: uint32(),
    },
  );

  constructor(input: {
    maxEntryTtl: number;
    minTemporaryTtl: number;
    minPersistentTtl: number;
    persistentRentRateDenominator: bigint;
    tempRentRateDenominator: bigint;
    maxEntriesToArchive: number;
    liveSorobanStateSizeWindowSampleSize: number;
    liveSorobanStateSizeWindowSamplePeriod: number;
    evictionScanSize: number;
    startingEvictionScanLevel: number;
  }) {
    super();
    this.maxEntryTtl = input.maxEntryTtl;
    this.minTemporaryTtl = input.minTemporaryTtl;
    this.minPersistentTtl = input.minPersistentTtl;
    this.persistentRentRateDenominator = input.persistentRentRateDenominator;
    this.tempRentRateDenominator = input.tempRentRateDenominator;
    this.maxEntriesToArchive = input.maxEntriesToArchive;
    this.liveSorobanStateSizeWindowSampleSize =
      input.liveSorobanStateSizeWindowSampleSize;
    this.liveSorobanStateSizeWindowSamplePeriod =
      input.liveSorobanStateSizeWindowSamplePeriod;
    this.evictionScanSize = input.evictionScanSize;
    this.startingEvictionScanLevel = input.startingEvictionScanLevel;
  }

  toXdrObject(): StateArchivalSettingsWire {
    return {
      maxEntryTtl: this.maxEntryTtl,
      minTemporaryTtl: this.minTemporaryTtl,
      minPersistentTtl: this.minPersistentTtl,
      persistentRentRateDenominator: this.persistentRentRateDenominator,
      tempRentRateDenominator: this.tempRentRateDenominator,
      maxEntriesToArchive: this.maxEntriesToArchive,
      liveSorobanStateSizeWindowSampleSize:
        this.liveSorobanStateSizeWindowSampleSize,
      liveSorobanStateSizeWindowSamplePeriod:
        this.liveSorobanStateSizeWindowSamplePeriod,
      evictionScanSize: this.evictionScanSize,
      startingEvictionScanLevel: this.startingEvictionScanLevel,
    };
  }

  static fromXdrObject(wire: StateArchivalSettingsWire): StateArchivalSettings {
    return new StateArchivalSettings({
      maxEntryTtl: wire.maxEntryTtl,
      minTemporaryTtl: wire.minTemporaryTtl,
      minPersistentTtl: wire.minPersistentTtl,
      persistentRentRateDenominator: wire.persistentRentRateDenominator,
      tempRentRateDenominator: wire.tempRentRateDenominator,
      maxEntriesToArchive: wire.maxEntriesToArchive,
      liveSorobanStateSizeWindowSampleSize:
        wire.liveSorobanStateSizeWindowSampleSize,
      liveSorobanStateSizeWindowSamplePeriod:
        wire.liveSorobanStateSizeWindowSamplePeriod,
      evictionScanSize: wire.evictionScanSize,
      startingEvictionScanLevel: wire.startingEvictionScanLevel,
    });
  }
}
