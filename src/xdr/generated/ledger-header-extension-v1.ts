import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerHeaderExtensionV1Ext,
  type LedgerHeaderExtensionV1ExtWire,
} from "./ledger-header-extension-v1-ext.js";

export interface LedgerHeaderExtensionV1Wire {
  flags: number;
  ext: LedgerHeaderExtensionV1ExtWire;
}

/**
 * ```xdr
 * struct LedgerHeaderExtensionV1
 * {
 *     uint32 flags; // LedgerHeaderFlags
 *
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class LedgerHeaderExtensionV1 extends XdrValue {
  readonly flags: number;
  readonly ext: LedgerHeaderExtensionV1Ext;

  static readonly schema: XdrType<LedgerHeaderExtensionV1Wire> = struct(
    "LedgerHeaderExtensionV1",
    {
      flags: uint32(),
      ext: LedgerHeaderExtensionV1Ext.schema,
    },
  );

  constructor(input: { flags: number; ext: LedgerHeaderExtensionV1Ext }) {
    super();
    this.flags = input.flags;
    this.ext = input.ext;
  }

  toXdrObject(): LedgerHeaderExtensionV1Wire {
    return {
      flags: this.flags,
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: LedgerHeaderExtensionV1Wire,
  ): LedgerHeaderExtensionV1 {
    return new LedgerHeaderExtensionV1({
      flags: wire.flags,
      ext: LedgerHeaderExtensionV1Ext.fromXdrObject(wire.ext),
    });
  }
}
