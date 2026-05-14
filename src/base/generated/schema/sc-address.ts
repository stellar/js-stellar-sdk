// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { ClaimableBalanceId } from "./claimable-balance-id.js";
import { ContractId } from "./contract-id.js";
import { MuxedEd25519Account } from "./muxed-ed25519-account.js";
import { PoolId } from "./pool-id.js";
import { SCAddressType } from "./sc-address-type.js";
export type SCAddress =
  | {
      readonly type: 0;
      readonly accountId: AccountId;
    }
  | {
      readonly type: 1;
      readonly contractId: ContractId;
    }
  | {
      readonly type: 2;
      readonly muxedAccount: MuxedEd25519Account;
    }
  | {
      readonly type: 3;
      readonly claimableBalanceId: ClaimableBalanceId;
    }
  | {
      readonly type: 4;
      readonly liquidityPoolId: PoolId;
    };
export const SCAddress = xdr.union("SCAddress", {
  switchOn: xdr.lazy(() => SCAddressType),
  switchKey: "type",
  cases: [
    xdr.case(
      "scAddressTypeAccount",
      0,
      xdr.field(
        "accountId",
        xdr.lazy(() => AccountId),
      ),
    ),
    xdr.case(
      "scAddressTypeContract",
      1,
      xdr.field(
        "contractId",
        xdr.lazy(() => ContractId),
      ),
    ),
    xdr.case(
      "scAddressTypeMuxedAccount",
      2,
      xdr.field(
        "muxedAccount",
        xdr.lazy(() => MuxedEd25519Account),
      ),
    ),
    xdr.case(
      "scAddressTypeClaimableBalance",
      3,
      xdr.field(
        "claimableBalanceId",
        xdr.lazy(() => ClaimableBalanceId),
      ),
    ),
    xdr.case(
      "scAddressTypeLiquidityPool",
      4,
      xdr.field(
        "liquidityPoolId",
        xdr.lazy(() => PoolId),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCAddress>;
