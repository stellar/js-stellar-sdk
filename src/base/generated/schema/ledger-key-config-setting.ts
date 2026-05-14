// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ConfigSettingId } from "./config-setting-id.js";
export interface LedgerKeyConfigSetting {
  readonly configSettingId: ConfigSettingId;
}
export const LedgerKeyConfigSetting = xdr.struct("LedgerKeyConfigSetting", {
  configSettingId: xdr.lazy(() => ConfigSettingId),
}) as xdr.XdrType<LedgerKeyConfigSetting>;
