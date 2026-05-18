import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ConfigSettingEntry,
  type ConfigSettingEntryWire,
} from "./config-setting-entry.js";

export interface ConfigUpgradeSetWire {
  updatedEntry: ConfigSettingEntryWire[];
}

/**
 * ```xdr
 * struct ConfigUpgradeSet {
 *     ConfigSettingEntry updatedEntry<>;
 * };
 * ```
 */
export class ConfigUpgradeSet extends XdrValue {
  readonly updatedEntry: ConfigSettingEntry[];

  static readonly schema: XdrType<ConfigUpgradeSetWire> = struct(
    "ConfigUpgradeSet",
    {
      updatedEntry: array(ConfigSettingEntry.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { updatedEntry: ConfigSettingEntry[] }) {
    super();
    this.updatedEntry = input.updatedEntry;
  }

  toXdrObject(): ConfigUpgradeSetWire {
    return {
      updatedEntry: this.updatedEntry.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ConfigUpgradeSetWire): ConfigUpgradeSet {
    return new ConfigUpgradeSet({
      updatedEntry: wire.updatedEntry.map((w) =>
        ConfigSettingEntry.fromXdrObject(w),
      ),
    });
  }
}
