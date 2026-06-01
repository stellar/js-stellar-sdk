import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type SignerKeyTypeWire = number;

export type SignerKeyTypeName =
  | "signerKeyTypeEd25519"
  | "signerKeyTypePreAuthTx"
  | "signerKeyTypeHashX"
  | "signerKeyTypeEd25519SignedPayload";

/**
 * ```xdr
 * enum SignerKeyType
 * {
 *     SIGNER_KEY_TYPE_ED25519 = KEY_TYPE_ED25519,
 *     SIGNER_KEY_TYPE_PRE_AUTH_TX = KEY_TYPE_PRE_AUTH_TX,
 *     SIGNER_KEY_TYPE_HASH_X = KEY_TYPE_HASH_X,
 *     SIGNER_KEY_TYPE_ED25519_SIGNED_PAYLOAD = KEY_TYPE_ED25519_SIGNED_PAYLOAD
 * };
 * ```
 */
export class SignerKeyType extends EnumValue<SignerKeyTypeName> {
  static readonly signerKeyTypeEd25519 = new SignerKeyType(
    "signerKeyTypeEd25519",
    0,
  );
  static readonly signerKeyTypePreAuthTx = new SignerKeyType(
    "signerKeyTypePreAuthTx",
    1,
  );
  static readonly signerKeyTypeHashX = new SignerKeyType(
    "signerKeyTypeHashX",
    2,
  );
  static readonly signerKeyTypeEd25519SignedPayload = new SignerKeyType(
    "signerKeyTypeEd25519SignedPayload",
    3,
  );

  static readonly schema = withMemberPrefix(
    enumType("SignerKeyType", {
      signerKeyTypeEd25519: 0,
      signerKeyTypePreAuthTx: 1,
      signerKeyTypeHashX: 2,
      signerKeyTypeEd25519SignedPayload: 3,
    }),
    "signerKeyType",
  );

  static fromValue(value: number): SignerKeyType {
    return enumFromValue(
      "SignerKeyType",
      SignerKeyType.schema,
      SignerKeyType,
      value,
    );
  }

  static fromName(name: SignerKeyTypeName): SignerKeyType {
    return enumFromName("SignerKeyType", SignerKeyType, name);
  }

  static fromXdrObject(wire: number): SignerKeyType {
    return SignerKeyType.fromValue(wire);
  }
}
