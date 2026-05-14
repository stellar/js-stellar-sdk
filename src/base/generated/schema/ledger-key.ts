// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryType } from "./ledger-entry-type.js";
import { LedgerKeyAccount } from "./ledger-key-account.js";
import { LedgerKeyClaimableBalance } from "./ledger-key-claimable-balance.js";
import { LedgerKeyConfigSetting } from "./ledger-key-config-setting.js";
import { LedgerKeyContractCode } from "./ledger-key-contract-code.js";
import { LedgerKeyContractData } from "./ledger-key-contract-data.js";
import { LedgerKeyData } from "./ledger-key-data.js";
import { LedgerKeyLiquidityPool } from "./ledger-key-liquidity-pool.js";
import { LedgerKeyOffer } from "./ledger-key-offer.js";
import { LedgerKeyTrustLine } from "./ledger-key-trust-line.js";
import { LedgerKeyTtl } from "./ledger-key-ttl.js";
export type LedgerKey =
  | {
      readonly type: 0;
      readonly account: LedgerKeyAccount;
    }
  | {
      readonly type: 1;
      readonly trustLine: LedgerKeyTrustLine;
    }
  | {
      readonly type: 2;
      readonly offer: LedgerKeyOffer;
    }
  | {
      readonly type: 3;
      readonly data: LedgerKeyData;
    }
  | {
      readonly type: 4;
      readonly claimableBalance: LedgerKeyClaimableBalance;
    }
  | {
      readonly type: 5;
      readonly liquidityPool: LedgerKeyLiquidityPool;
    }
  | {
      readonly type: 6;
      readonly contractData: LedgerKeyContractData;
    }
  | {
      readonly type: 7;
      readonly contractCode: LedgerKeyContractCode;
    }
  | {
      readonly type: 8;
      readonly configSetting: LedgerKeyConfigSetting;
    }
  | {
      readonly type: 9;
      readonly ttl: LedgerKeyTtl;
    };
export const LedgerKey = xdr.union("LedgerKey", {
  switchOn: xdr.lazy(() => LedgerEntryType),
  switchKey: "type",
  cases: [
    xdr.case(
      "account",
      0,
      xdr.field(
        "account",
        xdr.lazy(() => LedgerKeyAccount),
      ),
    ),
    xdr.case(
      "trustline",
      1,
      xdr.field(
        "trustLine",
        xdr.lazy(() => LedgerKeyTrustLine),
      ),
    ),
    xdr.case(
      "offer",
      2,
      xdr.field(
        "offer",
        xdr.lazy(() => LedgerKeyOffer),
      ),
    ),
    xdr.case(
      "data",
      3,
      xdr.field(
        "data",
        xdr.lazy(() => LedgerKeyData),
      ),
    ),
    xdr.case(
      "claimableBalance",
      4,
      xdr.field(
        "claimableBalance",
        xdr.lazy(() => LedgerKeyClaimableBalance),
      ),
    ),
    xdr.case(
      "liquidityPool",
      5,
      xdr.field(
        "liquidityPool",
        xdr.lazy(() => LedgerKeyLiquidityPool),
      ),
    ),
    xdr.case(
      "contractData",
      6,
      xdr.field(
        "contractData",
        xdr.lazy(() => LedgerKeyContractData),
      ),
    ),
    xdr.case(
      "contractCode",
      7,
      xdr.field(
        "contractCode",
        xdr.lazy(() => LedgerKeyContractCode),
      ),
    ),
    xdr.case(
      "configSetting",
      8,
      xdr.field(
        "configSetting",
        xdr.lazy(() => LedgerKeyConfigSetting),
      ),
    ),
    xdr.case(
      "ttl",
      9,
      xdr.field(
        "ttl",
        xdr.lazy(() => LedgerKeyTtl),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LedgerKey>;
