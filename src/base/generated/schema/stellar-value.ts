// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { StellarValueExt } from "./stellar-value-ext.js";
import { TimePoint } from "./time-point.js";
import { UpgradeType } from "./upgrade-type.js";
export interface StellarValue {
  readonly txSetHash: Hash;
  readonly closeTime: TimePoint;
  readonly upgrades: UpgradeType[];
  readonly ext: StellarValueExt;
}
export const StellarValue = xdr.struct("StellarValue", {
  txSetHash: xdr.lazy(() => Hash),
  closeTime: xdr.lazy(() => TimePoint),
  upgrades: xdr.array(
    xdr.lazy(() => UpgradeType),
    6,
  ),
  ext: xdr.lazy(() => StellarValueExt),
}) as xdr.XdrType<StellarValue>;
