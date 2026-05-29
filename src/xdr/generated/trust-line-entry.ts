import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { TrustLineAsset, type TrustLineAssetWire } from "./trust-line-asset.js";
import {
  TrustLineEntryExt,
  type TrustLineEntryExtWire,
} from "./trust-line-entry-ext.js";

export interface TrustLineEntryWire {
  accountId: PublicKeyWire;
  asset: TrustLineAssetWire;
  balance: bigint;
  limit: bigint;
  flags: number;
  ext: TrustLineEntryExtWire;
}

/**
 * ```xdr
 * struct TrustLineEntry
 * {
 *     AccountID accountID;  // account this trustline belongs to
 *     TrustLineAsset asset; // type of asset (with issuer)
 *     int64 balance;        // how much of this asset the user has.
 *                           // Asset defines the unit for this;
 *
 *     int64 limit;  // balance cannot be above this
 *     uint32 flags; // see TrustLineFlags
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         struct
 *         {
 *             Liabilities liabilities;
 *
 *             union switch (int v)
 *             {
 *             case 0:
 *                 void;
 *             case 2:
 *                 TrustLineEntryExtensionV2 v2;
 *             }
 *             ext;
 *         } v1;
 *     }
 *     ext;
 * };
 * ```
 */
export class TrustLineEntry extends XdrValue {
  readonly accountId: PublicKey;
  readonly asset: TrustLineAsset;
  readonly balance: bigint;
  readonly limit: bigint;
  readonly flags: number;
  readonly ext: TrustLineEntryExt;

  static readonly schema: XdrType<TrustLineEntryWire> = struct(
    "TrustLineEntry",
    {
      accountId: PublicKey.schema,
      asset: TrustLineAsset.schema,
      balance: int64(),
      limit: int64(),
      flags: uint32(),
      ext: TrustLineEntryExt.schema,
    },
  );

  constructor(input: {
    accountId: PublicKey;
    asset: TrustLineAsset;
    balance: bigint;
    limit: bigint;
    flags: number;
    ext: TrustLineEntryExt;
  }) {
    super();
    this.accountId = input.accountId;
    this.asset = input.asset;
    this.balance = input.balance;
    this.limit = input.limit;
    this.flags = input.flags;
    this.ext = input.ext;
  }

  toXdrObject(): TrustLineEntryWire {
    return {
      accountId: this.accountId.toXdrObject(),
      asset: this.asset.toXdrObject(),
      balance: this.balance,
      limit: this.limit,
      flags: this.flags,
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: TrustLineEntryWire): TrustLineEntry {
    return new TrustLineEntry({
      accountId: PublicKey.fromXdrObject(wire.accountId),
      asset: TrustLineAsset.fromXdrObject(wire.asset),
      balance: wire.balance,
      limit: wire.limit,
      flags: wire.flags,
      ext: TrustLineEntryExt.fromXdrObject(wire.ext),
    });
  }
}
