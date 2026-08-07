import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  ConfigSettingId,
  type ConfigSettingIdWire,
} from "./config-setting-id.js";

export interface LedgerKeyConfigSettingWire {
  configSettingId: ConfigSettingIdWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         ConfigSettingID configSettingID;
 *     }
 * ```
 */
export class LedgerKeyConfigSetting extends XdrValue {
  readonly configSettingId: ConfigSettingId;

  static readonly schema: XdrType<LedgerKeyConfigSettingWire> = struct(
    "LedgerKeyConfigSetting",
    {
      configSettingId: ConfigSettingId.schema,
    },
  );

  constructor(input: { configSettingId: ConfigSettingId }) {
    super();
    this.configSettingId = input.configSettingId;
  }

  toXdrObject(): LedgerKeyConfigSettingWire {
    return {
      configSettingId: this.configSettingId.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: LedgerKeyConfigSettingWire,
  ): LedgerKeyConfigSetting {
    return new LedgerKeyConfigSetting({
      configSettingId: ConfigSettingId.fromXdrObject(wire.configSettingId),
    });
  }
}
