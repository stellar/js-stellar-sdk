// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ConfigSettingEntry } from "./config-setting-entry.js";
export interface ConfigUpgradeSet {
  readonly updatedEntry: ConfigSettingEntry[];
}
export const ConfigUpgradeSet = xdr.struct("ConfigUpgradeSet", {
  updatedEntry: xdr.array(
    xdr.lazy(() => ConfigSettingEntry),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<ConfigUpgradeSet>;
