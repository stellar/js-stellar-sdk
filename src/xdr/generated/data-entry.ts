import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { DataValue, type DataValueWire } from "./data-value.js";
import { DataEntryExt, type DataEntryExtWire } from "./data-entry-ext.js";

export interface DataEntryWire {
  accountId: PublicKeyWire;
  dataName: XdrString;
  dataValue: DataValueWire;
  ext: DataEntryExtWire;
}

/**
 * ```xdr
 * struct DataEntry
 * {
 *     AccountID accountID; // account this data belongs to
 *     string64 dataName;
 *     DataValue dataValue;
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class DataEntry extends XdrValue {
  readonly accountId: PublicKey;
  readonly dataName: XdrString;
  readonly dataValue: DataValue;
  readonly ext: DataEntryExt;

  static readonly schema: XdrType<DataEntryWire> = struct("DataEntry", {
    accountId: PublicKey.schema,
    dataName: xdrString(64),
    dataValue: DataValue.schema,
    ext: DataEntryExt.schema,
  });

  constructor(input: {
    accountId: PublicKey;
    dataName: XdrString | string | Uint8Array;
    dataValue: DataValue | Uint8Array | string;
    ext: DataEntryExt;
  }) {
    super();
    this.accountId = input.accountId;
    this.dataName =
      input.dataName instanceof XdrString
        ? input.dataName
        : new XdrString(input.dataName);
    this.dataValue =
      input.dataValue instanceof DataValue
        ? input.dataValue
        : new DataValue(input.dataValue);
    this.ext = input.ext;
  }

  toXdrObject(): DataEntryWire {
    return {
      accountId: this.accountId.toXdrObject(),
      dataName: this.dataName,
      dataValue: this.dataValue.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: DataEntryWire): DataEntry {
    return new DataEntry({
      accountId: PublicKey.fromXdrObject(wire.accountId),
      dataName: wire.dataName,
      dataValue: DataValue.fromXdrObject(wire.dataValue),
      ext: DataEntryExt.fromXdrObject(wire.ext),
    });
  }
}
