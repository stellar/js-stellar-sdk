// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { CreateContractArgs } from "./create-contract-args.js";
import { CreateContractArgsV2 } from "./create-contract-args-v2.js";
import { HostFunctionType } from "./host-function-type.js";
import { InvokeContractArgs } from "./invoke-contract-args.js";
export type HostFunction =
  | {
      readonly type: 0;
      readonly invokeContract: InvokeContractArgs;
    }
  | {
      readonly type: 1;
      readonly createContract: CreateContractArgs;
    }
  | {
      readonly type: 2;
      readonly wasm: Uint8Array;
    }
  | {
      readonly type: 3;
      readonly createContractV2: CreateContractArgsV2;
    };
export const HostFunction = xdr.union("HostFunction", {
  switchOn: xdr.lazy(() => HostFunctionType),
  switchKey: "type",
  cases: [
    xdr.case(
      "hostFunctionTypeInvokeContract",
      0,
      xdr.field(
        "invokeContract",
        xdr.lazy(() => InvokeContractArgs),
      ),
    ),
    xdr.case(
      "hostFunctionTypeCreateContract",
      1,
      xdr.field(
        "createContract",
        xdr.lazy(() => CreateContractArgs),
      ),
    ),
    xdr.case(
      "hostFunctionTypeUploadContractWasm",
      2,
      xdr.field("wasm", xdr.varOpaque(xdr.UNBOUNDED_MAX_LENGTH)),
    ),
    xdr.case(
      "hostFunctionTypeCreateContractV2",
      3,
      xdr.field(
        "createContractV2",
        xdr.lazy(() => CreateContractArgsV2),
      ),
    ),
  ] as const,
}) as xdr.XdrType<HostFunction>;
