import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, EnvelopeType>> = {
    0: EnvelopeType.envelopeTypeTxV0,
    1: EnvelopeType.envelopeTypeScp,
    2: EnvelopeType.envelopeTypeTx,
    3: EnvelopeType.envelopeTypeAuth,
    4: EnvelopeType.envelopeTypeScpvalue,
    5: EnvelopeType.envelopeTypeTxFeeBump,
    6: EnvelopeType.envelopeTypeOpId,
    7: EnvelopeType.envelopeTypePoolRevokeOpId,
    8: EnvelopeType.envelopeTypeContractId,
    9: EnvelopeType.envelopeTypeSorobanAuthorization,
  };

  static readonly schema = enumType("EnvelopeType", {
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
  });

  static fromValue(value: number): EnvelopeType {
    return enumLookup(
      "EnvelopeType",
      EnvelopeType.byValue,
      value,
    ) as EnvelopeType;
  }

  static fromName(name: EnvelopeTypeName): EnvelopeType {
    switch (name) {
      case "envelopeTypeTxV0":
        return EnvelopeType.envelopeTypeTxV0;
      case "envelopeTypeScp":
        return EnvelopeType.envelopeTypeScp;
      case "envelopeTypeTx":
        return EnvelopeType.envelopeTypeTx;
      case "envelopeTypeAuth":
        return EnvelopeType.envelopeTypeAuth;
      case "envelopeTypeScpvalue":
        return EnvelopeType.envelopeTypeScpvalue;
      case "envelopeTypeTxFeeBump":
        return EnvelopeType.envelopeTypeTxFeeBump;
      case "envelopeTypeOpId":
        return EnvelopeType.envelopeTypeOpId;
      case "envelopeTypePoolRevokeOpId":
        return EnvelopeType.envelopeTypePoolRevokeOpId;
      case "envelopeTypeContractId":
        return EnvelopeType.envelopeTypeContractId;
      case "envelopeTypeSorobanAuthorization":
        return EnvelopeType.envelopeTypeSorobanAuthorization;
      default:
        throw new XdrError(`EnvelopeType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): EnvelopeType {
    return EnvelopeType.fromValue(wire);
  }
}
