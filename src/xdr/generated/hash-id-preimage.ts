/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { EnvelopeType } from "./envelope-type.js";
import {
  HashIdPreimageOperationId,
  type HashIdPreimageOperationIdWire,
} from "./hash-id-preimage-operation-id.js";
import {
  HashIdPreimageRevokeId,
  type HashIdPreimageRevokeIdWire,
} from "./hash-id-preimage-revoke-id.js";
import {
  HashIdPreimageContractId,
  type HashIdPreimageContractIdWire,
} from "./hash-id-preimage-contract-id.js";
import {
  HashIdPreimageSorobanAuthorization,
  type HashIdPreimageSorobanAuthorizationWire,
} from "./hash-id-preimage-soroban-authorization.js";

export type HashIdPreimageWire =
  | { type: 6; operationId: HashIdPreimageOperationIdWire }
  | { type: 7; revokeId: HashIdPreimageRevokeIdWire }
  | { type: 8; contractId: HashIdPreimageContractIdWire }
  | { type: 9; sorobanAuthorization: HashIdPreimageSorobanAuthorizationWire };

export type HashIdPreimageVariantName =
  | "envelopeTypeOpId"
  | "envelopeTypePoolRevokeOpId"
  | "envelopeTypeContractId"
  | "envelopeTypeSorobanAuthorization";

/**
 * ```xdr
 * union HashIDPreimage switch (EnvelopeType type)
 * {
 * case ENVELOPE_TYPE_OP_ID:
 *     struct
 *     {
 *         AccountID sourceAccount;
 *         SequenceNumber seqNum;
 *         uint32 opNum;
 *     } operationID;
 * case ENVELOPE_TYPE_POOL_REVOKE_OP_ID:
 *     struct
 *     {
 *         AccountID sourceAccount;
 *         SequenceNumber seqNum;
 *         uint32 opNum;
 *         PoolID liquidityPoolID;
 *         Asset asset;
 *     } revokeID;
 * case ENVELOPE_TYPE_CONTRACT_ID:
 *     struct
 *     {
 *         Hash networkID;
 *         ContractIDPreimage contractIDPreimage;
 *     } contractID;
 * case ENVELOPE_TYPE_SOROBAN_AUTHORIZATION:
 *     struct
 *     {
 *         Hash networkID;
 *         int64 nonce;
 *         uint32 signatureExpirationLedger;
 *         SorobanAuthorizedInvocation invocation;
 *     } sorobanAuthorization;
 * #ifdef CAP_0071
 * case ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS:
 *     struct
 *     {
 *         Hash networkID;
 *         int64 nonce;
 *         uint32 signatureExpirationLedger;
 *         SCAddress address;
 *         SorobanAuthorizedInvocation invocation;
 *     } sorobanAuthorizationWithAddress;
 * #endif
 * };
 * ```
 */
abstract class HashIdPreimageBase extends XdrValue {
  abstract readonly type: HashIdPreimageVariantName;

  static readonly schema: XdrType<HashIdPreimageWire> = union(
    "HashIdPreimage",
    {
      switchOn: EnvelopeType.schema,
      cases: [
        case_(
          "envelopeTypeOpId",
          6,
          field("operationId", HashIdPreimageOperationId.schema),
        ),
        case_(
          "envelopeTypePoolRevokeOpId",
          7,
          field("revokeId", HashIdPreimageRevokeId.schema),
        ),
        case_(
          "envelopeTypeContractId",
          8,
          field("contractId", HashIdPreimageContractId.schema),
        ),
        case_(
          "envelopeTypeSorobanAuthorization",
          9,
          field(
            "sorobanAuthorization",
            HashIdPreimageSorobanAuthorization.schema,
          ),
        ),
      ],
    },
  );

  static envelopeTypeOpId(
    operationId: HashIdPreimageOperationId,
  ): HashIdPreimageOpId {
    return new HashIdPreimageOpId(operationId);
  }

  static envelopeTypePoolRevokeOpId(
    revokeId: HashIdPreimageRevokeId,
  ): HashIdPreimagePoolRevokeOpId {
    return new HashIdPreimagePoolRevokeOpId(revokeId);
  }

  static envelopeTypeContractId(
    contractId: HashIdPreimageContractId,
  ): HashIdPreimageContractIdArm {
    return new HashIdPreimageContractIdArm(contractId);
  }

  static envelopeTypeSorobanAuthorization(
    sorobanAuthorization: HashIdPreimageSorobanAuthorization,
  ): HashIdPreimageSorobanAuthorizationArm {
    return new HashIdPreimageSorobanAuthorizationArm(sorobanAuthorization);
  }

  static fromXdrObject(wire: HashIdPreimageWire): HashIdPreimage {
    switch (wire.type) {
      case 6:
        return new HashIdPreimageOpId(
          HashIdPreimageOperationId.fromXdrObject(wire.operationId),
        );
      case 7:
        return new HashIdPreimagePoolRevokeOpId(
          HashIdPreimageRevokeId.fromXdrObject(wire.revokeId),
        );
      case 8:
        return new HashIdPreimageContractIdArm(
          HashIdPreimageContractId.fromXdrObject(wire.contractId),
        );
      case 9:
        return new HashIdPreimageSorobanAuthorizationArm(
          HashIdPreimageSorobanAuthorization.fromXdrObject(
            wire.sorobanAuthorization,
          ),
        );
    }
  }

  abstract toXdrObject(): HashIdPreimageWire;
}

export class HashIdPreimageOpId extends HashIdPreimageBase {
  readonly type = "envelopeTypeOpId" as const;
  readonly operationId: HashIdPreimageOperationId;

  constructor(operationId: HashIdPreimageOperationId) {
    super();
    this.operationId = operationId;
  }

  get value(): HashIdPreimageOperationId {
    return this.operationId;
  }

  toXdrObject(): Extract<HashIdPreimageWire, { type: 6 }> {
    return { type: 6, operationId: this.operationId.toXdrObject() };
  }
}

export class HashIdPreimagePoolRevokeOpId extends HashIdPreimageBase {
  readonly type = "envelopeTypePoolRevokeOpId" as const;
  readonly revokeId: HashIdPreimageRevokeId;

  constructor(revokeId: HashIdPreimageRevokeId) {
    super();
    this.revokeId = revokeId;
  }

  get value(): HashIdPreimageRevokeId {
    return this.revokeId;
  }

  toXdrObject(): Extract<HashIdPreimageWire, { type: 7 }> {
    return { type: 7, revokeId: this.revokeId.toXdrObject() };
  }
}

export class HashIdPreimageContractIdArm extends HashIdPreimageBase {
  readonly type = "envelopeTypeContractId" as const;
  readonly contractId: HashIdPreimageContractId;

  constructor(contractId: HashIdPreimageContractId) {
    super();
    this.contractId = contractId;
  }

  get value(): HashIdPreimageContractId {
    return this.contractId;
  }

  toXdrObject(): Extract<HashIdPreimageWire, { type: 8 }> {
    return { type: 8, contractId: this.contractId.toXdrObject() };
  }
}

export class HashIdPreimageSorobanAuthorizationArm extends HashIdPreimageBase {
  readonly type = "envelopeTypeSorobanAuthorization" as const;
  readonly sorobanAuthorization: HashIdPreimageSorobanAuthorization;

  constructor(sorobanAuthorization: HashIdPreimageSorobanAuthorization) {
    super();
    this.sorobanAuthorization = sorobanAuthorization;
  }

  get value(): HashIdPreimageSorobanAuthorization {
    return this.sorobanAuthorization;
  }

  toXdrObject(): Extract<HashIdPreimageWire, { type: 9 }> {
    return {
      type: 9,
      sorobanAuthorization: this.sorobanAuthorization.toXdrObject(),
    };
  }
}

export type HashIdPreimage =
  | HashIdPreimageOpId
  | HashIdPreimagePoolRevokeOpId
  | HashIdPreimageContractIdArm
  | HashIdPreimageSorobanAuthorizationArm;
export const HashIdPreimage = HashIdPreimageBase;
