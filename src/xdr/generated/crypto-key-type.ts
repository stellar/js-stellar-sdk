import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type CryptoKeyTypeWire = number;

export type CryptoKeyTypeName =
  | "keyTypeEd25519"
  | "keyTypePreAuthTx"
  | "keyTypeHashX"
  | "keyTypeEd25519SignedPayload"
  | "keyTypeMuxedEd25519";

/**
 * ```xdr
 * enum CryptoKeyType
 * {
 *     KEY_TYPE_ED25519 = 0,
 *     KEY_TYPE_PRE_AUTH_TX = 1,
 *     KEY_TYPE_HASH_X = 2,
 *     KEY_TYPE_ED25519_SIGNED_PAYLOAD = 3,
 *     // MUXED enum values for supported type are derived from the enum values
 *     // above by ORing them with 0x100
 *     KEY_TYPE_MUXED_ED25519 = 0x100
 * };
 * ```
 */
export class CryptoKeyType extends EnumValue<CryptoKeyTypeName> {
  static readonly keyTypeEd25519 = new CryptoKeyType("keyTypeEd25519", 0);
  static readonly keyTypePreAuthTx = new CryptoKeyType("keyTypePreAuthTx", 1);
  static readonly keyTypeHashX = new CryptoKeyType("keyTypeHashX", 2);
  static readonly keyTypeEd25519SignedPayload = new CryptoKeyType(
    "keyTypeEd25519SignedPayload",
    3,
  );
  static readonly keyTypeMuxedEd25519 = new CryptoKeyType(
    "keyTypeMuxedEd25519",
    256,
  );

  private static readonly byValue: Readonly<Record<number, CryptoKeyType>> = {
    0: CryptoKeyType.keyTypeEd25519,
    1: CryptoKeyType.keyTypePreAuthTx,
    2: CryptoKeyType.keyTypeHashX,
    3: CryptoKeyType.keyTypeEd25519SignedPayload,
    256: CryptoKeyType.keyTypeMuxedEd25519,
  };

  static readonly schema = enumType("CryptoKeyType", {
    keyTypeEd25519: 0,
    keyTypePreAuthTx: 1,
    keyTypeHashX: 2,
    keyTypeEd25519SignedPayload: 3,
    keyTypeMuxedEd25519: 256,
  });

  static fromValue(value: number): CryptoKeyType {
    return enumLookup(
      "CryptoKeyType",
      CryptoKeyType.byValue,
      value,
    ) as CryptoKeyType;
  }

  static fromName(name: CryptoKeyTypeName): CryptoKeyType {
    switch (name) {
      case "keyTypeEd25519":
        return CryptoKeyType.keyTypeEd25519;
      case "keyTypePreAuthTx":
        return CryptoKeyType.keyTypePreAuthTx;
      case "keyTypeHashX":
        return CryptoKeyType.keyTypeHashX;
      case "keyTypeEd25519SignedPayload":
        return CryptoKeyType.keyTypeEd25519SignedPayload;
      case "keyTypeMuxedEd25519":
        return CryptoKeyType.keyTypeMuxedEd25519;
      default:
        throw new XdrError(`CryptoKeyType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): CryptoKeyType {
    return CryptoKeyType.fromValue(wire);
  }
}
