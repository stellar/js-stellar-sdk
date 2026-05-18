import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { option } from "../types/option.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { DataValue, type DataValueWire } from "./data-value.js";

export interface ManageDataOpWire {
  dataName: string;
  dataValue: DataValueWire | null;
}

/**
 * ```xdr
 * struct ManageDataOp
 * {
 *     string64 dataName;
 *     DataValue* dataValue; // set to null to clear
 * };
 * ```
 */
export class ManageDataOp extends XdrValue {
  readonly dataName: string;
  readonly dataValue: DataValue | null;

  static readonly schema: XdrType<ManageDataOpWire> = struct("ManageDataOp", {
    dataName: string_(64),
    dataValue: option(DataValue.schema),
  });

  constructor(input: { dataName: string; dataValue: DataValue | null }) {
    super();
    this.dataName = input.dataName;
    this.dataValue = input.dataValue;
  }

  toXdrObject(): ManageDataOpWire {
    return {
      dataName: this.dataName,
      dataValue: this.dataValue === null ? null : this.dataValue.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ManageDataOpWire): ManageDataOp {
    return new ManageDataOp({
      dataName: wire.dataName,
      dataValue:
        wire.dataValue === null
          ? null
          : DataValue.fromXdrObject(wire.dataValue),
    });
  }
}
