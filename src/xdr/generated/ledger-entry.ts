import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerEntryData,
  type LedgerEntryDataWire,
} from "./ledger-entry-data.js";
import { LedgerEntryExt, type LedgerEntryExtWire } from "./ledger-entry-ext.js";

export interface LedgerEntryWire {
  lastModifiedLedgerSeq: number;
  data: LedgerEntryDataWire;
  ext: LedgerEntryExtWire;
}

/**
 * ```xdr
 * struct LedgerEntry
 * {
 *     uint32 lastModifiedLedgerSeq; // ledger the LedgerEntry was last changed
 *
 *     union switch (LedgerEntryType type)
 *     {
 *     case ACCOUNT:
 *         AccountEntry account;
 *     case TRUSTLINE:
 *         TrustLineEntry trustLine;
 *     case OFFER:
 *         OfferEntry offer;
 *     case DATA:
 *         DataEntry data;
 *     case CLAIMABLE_BALANCE:
 *         ClaimableBalanceEntry claimableBalance;
 *     case LIQUIDITY_POOL:
 *         LiquidityPoolEntry liquidityPool;
 *     case CONTRACT_DATA:
 *         ContractDataEntry contractData;
 *     case CONTRACT_CODE:
 *         ContractCodeEntry contractCode;
 *     case CONFIG_SETTING:
 *         ConfigSettingEntry configSetting;
 *     case TTL:
 *         TTLEntry ttl;
 *     }
 *     data;
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         LedgerEntryExtensionV1 v1;
 *     }
 *     ext;
 * };
 * ```
 */
export class LedgerEntry extends XdrValue {
  readonly lastModifiedLedgerSeq: number;
  readonly data: LedgerEntryData;
  readonly ext: LedgerEntryExt;

  static readonly schema: XdrType<LedgerEntryWire> = struct("LedgerEntry", {
    lastModifiedLedgerSeq: uint32(),
    data: LedgerEntryData.schema,
    ext: LedgerEntryExt.schema,
  });

  constructor(input: {
    lastModifiedLedgerSeq: number;
    data: LedgerEntryData;
    ext: LedgerEntryExt;
  }) {
    super();
    this.lastModifiedLedgerSeq = input.lastModifiedLedgerSeq;
    this.data = input.data;
    this.ext = input.ext;
  }

  toXdrObject(): LedgerEntryWire {
    return {
      lastModifiedLedgerSeq: this.lastModifiedLedgerSeq,
      data: this.data.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: LedgerEntryWire): LedgerEntry {
    return new LedgerEntry({
      lastModifiedLedgerSeq: wire.lastModifiedLedgerSeq,
      data: LedgerEntryData.fromXdrObject(wire.data),
      ext: LedgerEntryExt.fromXdrObject(wire.ext),
    });
  }
}
