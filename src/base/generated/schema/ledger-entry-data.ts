// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountEntry } from "./account-entry.js";
import { ClaimableBalanceEntry } from "./claimable-balance-entry.js";
import { ConfigSettingEntry } from "./config-setting-entry.js";
import { ContractCodeEntry } from "./contract-code-entry.js";
import { ContractDataEntry } from "./contract-data-entry.js";
import { DataEntry } from "./data-entry.js";
import { LedgerEntryType } from "./ledger-entry-type.js";
import { LiquidityPoolEntry } from "./liquidity-pool-entry.js";
import { OfferEntry } from "./offer-entry.js";
import { TrustLineEntry } from "./trust-line-entry.js";
import { TTLEntry } from "./ttl-entry.js";
export type LedgerEntryData =
  | {
      readonly type: 0;
      readonly account: AccountEntry;
    }
  | {
      readonly type: 1;
      readonly trustLine: TrustLineEntry;
    }
  | {
      readonly type: 2;
      readonly offer: OfferEntry;
    }
  | {
      readonly type: 3;
      readonly data: DataEntry;
    }
  | {
      readonly type: 4;
      readonly claimableBalance: ClaimableBalanceEntry;
    }
  | {
      readonly type: 5;
      readonly liquidityPool: LiquidityPoolEntry;
    }
  | {
      readonly type: 6;
      readonly contractData: ContractDataEntry;
    }
  | {
      readonly type: 7;
      readonly contractCode: ContractCodeEntry;
    }
  | {
      readonly type: 8;
      readonly configSetting: ConfigSettingEntry;
    }
  | {
      readonly type: 9;
      readonly ttl: TTLEntry;
    };
export const LedgerEntryData = xdr.union("LedgerEntryData", {
  switchOn: xdr.lazy(() => LedgerEntryType),
  switchKey: "type",
  cases: [
    xdr.case(
      "account",
      0,
      xdr.field(
        "account",
        xdr.lazy(() => AccountEntry),
      ),
    ),
    xdr.case(
      "trustline",
      1,
      xdr.field(
        "trustLine",
        xdr.lazy(() => TrustLineEntry),
      ),
    ),
    xdr.case(
      "offer",
      2,
      xdr.field(
        "offer",
        xdr.lazy(() => OfferEntry),
      ),
    ),
    xdr.case(
      "data",
      3,
      xdr.field(
        "data",
        xdr.lazy(() => DataEntry),
      ),
    ),
    xdr.case(
      "claimableBalance",
      4,
      xdr.field(
        "claimableBalance",
        xdr.lazy(() => ClaimableBalanceEntry),
      ),
    ),
    xdr.case(
      "liquidityPool",
      5,
      xdr.field(
        "liquidityPool",
        xdr.lazy(() => LiquidityPoolEntry),
      ),
    ),
    xdr.case(
      "contractData",
      6,
      xdr.field(
        "contractData",
        xdr.lazy(() => ContractDataEntry),
      ),
    ),
    xdr.case(
      "contractCode",
      7,
      xdr.field(
        "contractCode",
        xdr.lazy(() => ContractCodeEntry),
      ),
    ),
    xdr.case(
      "configSetting",
      8,
      xdr.field(
        "configSetting",
        xdr.lazy(() => ConfigSettingEntry),
      ),
    ),
    xdr.case(
      "ttl",
      9,
      xdr.field(
        "ttl",
        xdr.lazy(() => TTLEntry),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LedgerEntryData>;
