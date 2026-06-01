import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type EnvelopeTypeWire = number;

export type EnvelopeTypeName =
  | "envelopeTypeTxV0"
  | "envelopeTypeScp"
  | "envelopeTypeTx"
  | "envelopeTypeAuth"
  | "envelopeTypeScpvalue"
  | "envelopeTypeTxFeeBump"
  | "envelopeTypeOpId"
  | "envelopeTypePoolRevokeOpId"
  | "envelopeTypeContractId"
  | "envelopeTypeSorobanAuthorization";

/**
 * ```xdr
 * enum EnvelopeType
 * {
 *     ENVELOPE_TYPE_TX_V0 = 0,
 *     ENVELOPE_TYPE_SCP = 1,
 *     ENVELOPE_TYPE_TX = 2,
 *     ENVELOPE_TYPE_AUTH = 3,
 *     ENVELOPE_TYPE_SCPVALUE = 4,
 *     ENVELOPE_TYPE_TX_FEE_BUMP = 5,
 *     ENVELOPE_TYPE_OP_ID = 6,
 *     ENVELOPE_TYPE_POOL_REVOKE_OP_ID = 7,
 *     ENVELOPE_TYPE_CONTRACT_ID = 8,
 *     ENVELOPE_TYPE_SOROBAN_AUTHORIZATION = 9
 * #ifdef CAP_0071
 *     ,
 *     ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS = 10
 * #endif
 * };
 * ```
 */
export class EnvelopeType extends EnumValue<EnvelopeTypeName> {
  static readonly envelopeTypeTxV0 = new EnvelopeType("envelopeTypeTxV0", 0);
  static readonly envelopeTypeScp = new EnvelopeType("envelopeTypeScp", 1);
  static readonly envelopeTypeTx = new EnvelopeType("envelopeTypeTx", 2);
  static readonly envelopeTypeAuth = new EnvelopeType("envelopeTypeAuth", 3);
  static readonly envelopeTypeScpvalue = new EnvelopeType(
    "envelopeTypeScpvalue",
    4,
  );
  static readonly envelopeTypeTxFeeBump = new EnvelopeType(
    "envelopeTypeTxFeeBump",
    5,
  );
  static readonly envelopeTypeOpId = new EnvelopeType("envelopeTypeOpId", 6);
  static readonly envelopeTypePoolRevokeOpId = new EnvelopeType(
    "envelopeTypePoolRevokeOpId",
    7,
  );
  static readonly envelopeTypeContractId = new EnvelopeType(
    "envelopeTypeContractId",
    8,
  );
  static readonly envelopeTypeSorobanAuthorization = new EnvelopeType(
    "envelopeTypeSorobanAuthorization",
    9,
  );

  static readonly schema = withMemberPrefix(
    enumType("EnvelopeType", {
      envelopeTypeTxV0: 0,
      envelopeTypeScp: 1,
      envelopeTypeTx: 2,
      envelopeTypeAuth: 3,
      envelopeTypeScpvalue: 4,
      envelopeTypeTxFeeBump: 5,
      envelopeTypeOpId: 6,
      envelopeTypePoolRevokeOpId: 7,
      envelopeTypeContractId: 8,
      envelopeTypeSorobanAuthorization: 9,
    }),
    "envelopeType",
  );

  static fromValue(value: number): EnvelopeType {
    return enumFromValue(
      "EnvelopeType",
      EnvelopeType.schema,
      EnvelopeType,
      value,
    );
  }

  static fromName(name: EnvelopeTypeName): EnvelopeType {
    return enumFromName("EnvelopeType", EnvelopeType, name);
  }

  static fromXdrObject(wire: number): EnvelopeType {
    return EnvelopeType.fromValue(wire);
  }
}
