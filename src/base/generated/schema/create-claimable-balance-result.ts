// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimableBalanceId } from "./claimable-balance-id.js";
import { CreateClaimableBalanceResultCode } from "./create-claimable-balance-result-code.js";
export type CreateClaimableBalanceResult =
  | {
      readonly code: 0;
      readonly balanceId: ClaimableBalanceId;
    }
  | {
      readonly code: -1;
    }
  | {
      readonly code: -2;
    }
  | {
      readonly code: -3;
    }
  | {
      readonly code: -4;
    }
  | {
      readonly code: -5;
    };
export const CreateClaimableBalanceResult = xdr.union(
  "CreateClaimableBalanceResult",
  {
    switchOn: xdr.lazy(() => CreateClaimableBalanceResultCode),
    switchKey: "code",
    cases: [
      xdr.case(
        "createClaimableBalanceSuccess",
        0,
        xdr.field(
          "balanceId",
          xdr.lazy(() => ClaimableBalanceId),
        ),
      ),
      xdr.case("createClaimableBalanceMalformed", -1, xdr.void()),
      xdr.case("createClaimableBalanceLowReserve", -2, xdr.void()),
      xdr.case("createClaimableBalanceNoTrust", -3, xdr.void()),
      xdr.case("createClaimableBalanceNotAuthorized", -4, xdr.void()),
      xdr.case("createClaimableBalanceUnderfunded", -5, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<CreateClaimableBalanceResult>;
