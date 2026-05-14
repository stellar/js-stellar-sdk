// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { EnvelopeType } from "./envelope-type.js";
import { HashIdPreimageContractId } from "./hash-id-preimage-contract-id.js";
import { HashIdPreimageOperationId } from "./hash-id-preimage-operation-id.js";
import { HashIdPreimageRevokeId } from "./hash-id-preimage-revoke-id.js";
import { HashIdPreimageSorobanAuthorization } from "./hash-id-preimage-soroban-authorization.js";
export type HashIdPreimage =
  | {
      readonly type: 6;
      readonly operationId: HashIdPreimageOperationId;
    }
  | {
      readonly type: 7;
      readonly revokeId: HashIdPreimageRevokeId;
    }
  | {
      readonly type: 8;
      readonly contractId: HashIdPreimageContractId;
    }
  | {
      readonly type: 9;
      readonly sorobanAuthorization: HashIdPreimageSorobanAuthorization;
    };
export const HashIdPreimage = xdr.union("HashIdPreimage", {
  switchOn: xdr.lazy(() => EnvelopeType),
  switchKey: "type",
  cases: [
    xdr.case(
      "envelopeTypeOpId",
      6,
      xdr.field(
        "operationId",
        xdr.lazy(() => HashIdPreimageOperationId),
      ),
    ),
    xdr.case(
      "envelopeTypePoolRevokeOpId",
      7,
      xdr.field(
        "revokeId",
        xdr.lazy(() => HashIdPreimageRevokeId),
      ),
    ),
    xdr.case(
      "envelopeTypeContractId",
      8,
      xdr.field(
        "contractId",
        xdr.lazy(() => HashIdPreimageContractId),
      ),
    ),
    xdr.case(
      "envelopeTypeSorobanAuthorization",
      9,
      xdr.field(
        "sorobanAuthorization",
        xdr.lazy(() => HashIdPreimageSorobanAuthorization),
      ),
    ),
  ] as const,
}) as xdr.XdrType<HashIdPreimage>;
