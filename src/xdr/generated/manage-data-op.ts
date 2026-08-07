import { option, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { DataValue, type DataValueWire } from "./data-value.js";

export interface ManageDataOpWire {
  dataName: XdrString;
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
  readonly dataName: XdrString;
  readonly dataValue: DataValue | null;

  static readonly schema: XdrType<ManageDataOpWire> = struct("ManageDataOp", {
    dataName: xdrString(64),
    dataValue: option(DataValue.schema),
  });

  constructor(input: {
    dataName: XdrString | string | Uint8Array;
    dataValue: DataValue | Uint8Array | string | null;
  }) {
    super();
    this.dataName =
      input.dataName instanceof XdrString
        ? input.dataName
        : new XdrString(input.dataName);
    this.dataValue =
      input.dataValue === null
        ? null
        : input.dataValue instanceof DataValue
          ? input.dataValue
          : new DataValue(input.dataValue);
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
