// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { CreateContractArgs } from "./create-contract-args.js";
import { CreateContractArgsV2 } from "./create-contract-args-v2.js";
import { InvokeContractArgs } from "./invoke-contract-args.js";
import { SorobanAuthorizedFunctionType } from "./soroban-authorized-function-type.js";
export type SorobanAuthorizedFunction =
  | {
      readonly type: 0;
      readonly contractFn: InvokeContractArgs;
    }
  | {
      readonly type: 1;
      readonly createContractHostFn: CreateContractArgs;
    }
  | {
      readonly type: 2;
      readonly createContractV2HostFn: CreateContractArgsV2;
    };
export const SorobanAuthorizedFunction = xdr.union(
  "SorobanAuthorizedFunction",
  {
    switchOn: xdr.lazy(() => SorobanAuthorizedFunctionType),
    switchKey: "type",
    cases: [
      xdr.case(
        "sorobanAuthorizedFunctionTypeContractFn",
        0,
        xdr.field(
          "contractFn",
          xdr.lazy(() => InvokeContractArgs),
        ),
      ),
      xdr.case(
        "sorobanAuthorizedFunctionTypeCreateContractHostFn",
        1,
        xdr.field(
          "createContractHostFn",
          xdr.lazy(() => CreateContractArgs),
        ),
      ),
      xdr.case(
        "sorobanAuthorizedFunctionTypeCreateContractV2HostFn",
        2,
        xdr.field(
          "createContractV2HostFn",
          xdr.lazy(() => CreateContractArgsV2),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<SorobanAuthorizedFunction>;
