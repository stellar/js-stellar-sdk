// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { CreateAccountResultCode } from "./create-account-result-code.js";
export type CreateAccountResult =
  | {
      readonly code: 0;
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
    };
export const CreateAccountResult = xdr.union("CreateAccountResult", {
  switchOn: xdr.lazy(() => CreateAccountResultCode),
  switchKey: "code",
  cases: [
    xdr.case("createAccountSuccess", 0, xdr.void()),
    xdr.case("createAccountMalformed", -1, xdr.void()),
    xdr.case("createAccountUnderfunded", -2, xdr.void()),
    xdr.case("createAccountLowReserve", -3, xdr.void()),
    xdr.case("createAccountAlreadyExist", -4, xdr.void()),
  ] as const,
}) as xdr.XdrType<CreateAccountResult>;
