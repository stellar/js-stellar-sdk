import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type PublicKeyTypeWire = number;

export type PublicKeyTypeName = "publicKeyTypeEd25519";

/**
 * ```xdr
 * enum PublicKeyType
 * {
 *     PUBLIC_KEY_TYPE_ED25519 = KEY_TYPE_ED25519
 * };
 * ```
 */
export class PublicKeyType extends EnumValue<PublicKeyTypeName> {
  static readonly publicKeyTypeEd25519 = new PublicKeyType(
    "publicKeyTypeEd25519",
    0,
  );

  static readonly schema = enumType("PublicKeyType", {
    publicKeyTypeEd25519: 0,
  });

  static fromValue(value: number): PublicKeyType {
    return enumFromValue(
      "PublicKeyType",
      PublicKeyType.schema,
      PublicKeyType,
      value,
    );
  }

  static fromName(name: PublicKeyTypeName): PublicKeyType {
    return enumFromName("PublicKeyType", PublicKeyType, name);
  }

  static fromXdrObject(wire: number): PublicKeyType {
    return PublicKeyType.fromValue(wire);
  }
}
