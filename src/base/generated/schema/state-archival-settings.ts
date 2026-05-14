// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface StateArchivalSettings {
  readonly maxEntryTTL: number;
  readonly minTemporaryTTL: number;
  readonly minPersistentTTL: number;
  readonly persistentRentRateDenominator: bigint;
  readonly tempRentRateDenominator: bigint;
  readonly maxEntriesToArchive: number;
  readonly liveSorobanStateSizeWindowSampleSize: number;
  readonly liveSorobanStateSizeWindowSamplePeriod: number;
  readonly evictionScanSize: number;
  readonly startingEvictionScanLevel: number;
}
export const StateArchivalSettings = xdr.struct("StateArchivalSettings", {
  maxEntryTTL: xdr.uint32(),
  minTemporaryTTL: xdr.uint32(),
  minPersistentTTL: xdr.uint32(),
  persistentRentRateDenominator: xdr.int64(),
  tempRentRateDenominator: xdr.int64(),
  maxEntriesToArchive: xdr.uint32(),
  liveSorobanStateSizeWindowSampleSize: xdr.uint32(),
  liveSorobanStateSizeWindowSamplePeriod: xdr.uint32(),
  evictionScanSize: xdr.uint32(),
  startingEvictionScanLevel: xdr.uint32(),
}) as xdr.XdrType<StateArchivalSettings>;
