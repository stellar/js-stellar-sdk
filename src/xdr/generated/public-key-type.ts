import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, PublicKeyType>> = {
    0: PublicKeyType.publicKeyTypeEd25519,
  };

  static readonly schema = enumType("PublicKeyType", {
    publicKeyTypeEd25519: 0,
  });

  static fromValue(value: number): PublicKeyType {
    return enumLookup(
      "PublicKeyType",
      PublicKeyType.byValue,
      value,
    ) as PublicKeyType;
  }

  static fromName(name: PublicKeyTypeName): PublicKeyType {
    switch (name) {
      case "publicKeyTypeEd25519":
        return PublicKeyType.publicKeyTypeEd25519;
      default:
        throw new XdrError(`PublicKeyType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): PublicKeyType {
    return PublicKeyType.fromValue(wire);
  }
}
