// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ConfigUpgradeSetKey } from "./config-upgrade-set-key.js";
import { LedgerUpgradeType } from "./ledger-upgrade-type.js";
export type LedgerUpgrade =
  | {
      readonly type: 1;
      readonly newLedgerVersion: number;
    }
  | {
      readonly type: 2;
      readonly newBaseFee: number;
    }
  | {
      readonly type: 3;
      readonly newMaxTxSetSize: number;
    }
  | {
      readonly type: 4;
      readonly newBaseReserve: number;
    }
  | {
      readonly type: 5;
      readonly newFlags: number;
    }
  | {
      readonly type: 6;
      readonly newConfig: ConfigUpgradeSetKey;
    }
  | {
      readonly type: 7;
      readonly newMaxSorobanTxSetSize: number;
    };
export const LedgerUpgrade = xdr.union("LedgerUpgrade", {
  switchOn: xdr.lazy(() => LedgerUpgradeType),
  switchKey: "type",
  cases: [
    xdr.case(
      "ledgerUpgradeVersion",
      1,
      xdr.field("newLedgerVersion", xdr.uint32()),
    ),
    xdr.case("ledgerUpgradeBaseFee", 2, xdr.field("newBaseFee", xdr.uint32())),
    xdr.case(
      "ledgerUpgradeMaxTxSetSize",
      3,
      xdr.field("newMaxTxSetSize", xdr.uint32()),
    ),
    xdr.case(
      "ledgerUpgradeBaseReserve",
      4,
      xdr.field("newBaseReserve", xdr.uint32()),
    ),
    xdr.case("ledgerUpgradeFlags", 5, xdr.field("newFlags", xdr.uint32())),
    xdr.case(
      "ledgerUpgradeConfig",
      6,
      xdr.field(
        "newConfig",
        xdr.lazy(() => ConfigUpgradeSetKey),
      ),
    ),
    xdr.case(
      "ledgerUpgradeMaxSorobanTxSetSize",
      7,
      xdr.field("newMaxSorobanTxSetSize", xdr.uint32()),
    ),
  ] as const,
}) as xdr.XdrType<LedgerUpgrade>;
