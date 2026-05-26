import { StrKey } from "./strkey.js";
import {
  ClaimableBalanceId,
  ClaimableBalanceIdType,
  ContractId,
  Hash,
  MuxedEd25519Account,
  PoolId,
  PublicKey,
  ScAddress,
  ScVal,
  Uint64,
} from "../xdr/index.js";

/**
 * Create a new Address object.
 *
 * `Address` represents a single address in the Stellar network that can be
 * inputted to or outputted by a smart contract. An address can represent an
 * account, muxed account, contract, claimable balance, or a liquidity pool
 * (the latter two can only be present as the *output* of Core in the form
 * of an event, never an input to a smart contract).
 */
export type AddressType =
  | "account"
  | "claimableBalance"
  | "contract"
  | "liquidityPool"
  | "muxedAccount";

export class Address {
  private _type: AddressType;
  private _key: Buffer;

  /**
   * @param address - a {@link StrKey} of the address value
   */
  constructor(address: string) {
    if (StrKey.isValidEd25519PublicKey(address)) {
      this._type = "account";
      this._key = StrKey.decodeEd25519PublicKey(address);
    } else if (StrKey.isValidContract(address)) {
      this._type = "contract";
      this._key = StrKey.decodeContract(address);
    } else if (StrKey.isValidMed25519PublicKey(address)) {
      this._type = "muxedAccount";
      this._key = StrKey.decodeMed25519PublicKey(address);
    } else if (StrKey.isValidClaimableBalance(address)) {
      this._type = "claimableBalance";
      this._key = StrKey.decodeClaimableBalance(address);
    } else if (StrKey.isValidLiquidityPool(address)) {
      this._type = "liquidityPool";
      this._key = StrKey.decodeLiquidityPool(address);
    } else {
      throw new Error(`Unsupported address type: ${address}`);
    }
  }

  /**
   * Parses a string and returns an Address object.
   *
   * @param address - The address to parse. ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`
   */
  static fromString(address: string): Address {
    return new Address(address);
  }

  /**
   * Creates a new account Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of an address to parse.
   */
  static account(buffer: Buffer): Address {
    return new Address(StrKey.encodeEd25519PublicKey(buffer));
  }

  /**
   * Creates a new contract Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of an address to parse.
   */
  static contract(buffer: Buffer): Address {
    return new Address(StrKey.encodeContract(buffer));
  }

  /**
   * Creates a new claimable balance Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of a claimable balance ID to parse.
   */
  static claimableBalance(buffer: Buffer): Address {
    return new Address(StrKey.encodeClaimableBalance(buffer));
  }

  /**
   * Creates a new liquidity pool Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of an LP ID to parse.
   */
  static liquidityPool(buffer: Buffer): Address {
    return new Address(StrKey.encodeLiquidityPool(buffer));
  }

  /**
   * Creates a new muxed account Address object from a buffer of raw bytes.
   *
   * @param buffer - The bytes of an address to parse.
   */
  static muxedAccount(buffer: Buffer): Address {
    return new Address(StrKey.encodeMed25519PublicKey(buffer));
  }

  /**
   * Convert this from an xdr.ScVal type.
   *
   * @param scVal - The xdr.ScVal type to parse
   */
  static fromScVal(scVal: ScVal): Address {
    if (scVal.type !== "scvAddress") {
      throw new Error(`Unsupported ScVal type: ${scVal.type}`);
    }
    return Address.fromScAddress(scVal.address);
  }

  /**
   * Convert this from an xdr.ScAddress type
   *
   * @param scAddress - The xdr.ScAddress type to parse
   */
  static fromScAddress(scAddress: ScAddress): Address {
    switch (scAddress.type) {
      case "scAddressTypeAccount":
        return Address.account(Buffer.from(scAddress.accountId.ed25519));
      case "scAddressTypeContract":
        return Address.contract(Buffer.from(scAddress.contractId.value));
      case "scAddressTypeMuxedAccount": {
        const muxed = scAddress.value;
        const raw = Buffer.concat([
          Buffer.from(muxed.ed25519),
          Buffer.from(
            MuxedEd25519Account.schema.encode(muxed.toXdrObject()),
          ).subarray(0, 8),
        ]);
        return Address.muxedAccount(raw);
      }
      case "scAddressTypeClaimableBalance": {
        const cbi = scAddress.value;
        return Address.claimableBalance(
          Buffer.concat([
            Buffer.from([
              ClaimableBalanceIdType.claimableBalanceIdTypeV0.value,
            ]),
            Buffer.from(cbi.v0.value),
          ]),
        );
      }
      case "scAddressTypeLiquidityPool":
        return Address.liquidityPool(Buffer.from(scAddress.value.toBytes()));
      default:
        throw new Error("Unsupported address type");
    }
  }

  /**
   * Serialize an address to string.
   */
  toString(): string {
    switch (this._type) {
      case "account":
        return StrKey.encodeEd25519PublicKey(this._key);
      case "contract":
        return StrKey.encodeContract(this._key);
      case "claimableBalance":
        return StrKey.encodeClaimableBalance(this._key);
      case "liquidityPool":
        return StrKey.encodeLiquidityPool(this._key);
      case "muxedAccount":
        return StrKey.encodeMed25519PublicKey(this._key);
      default:
        throw new Error("Unsupported address type");
    }
  }

  /**
   * Convert this Address to an xdr.ScVal type.
   */
  toScVal(): ScVal {
    return ScVal.scvAddress(this.toScAddress());
  }

  /**
   * Convert this Address to an xdr.ScAddress type.
   */
  toScAddress(): ScAddress {
    switch (this._type) {
      case "account":
        return ScAddress.scAddressTypeAccount(
          PublicKey.publicKeyTypeEd25519(this._key),
        );
      case "contract":
        return ScAddress.scAddressTypeContract(new ContractId(this._key));
      case "liquidityPool":
        return ScAddress.scAddressTypeLiquidityPool(new PoolId(this._key));

      case "claimableBalance":
        return ScAddress.scAddressTypeClaimableBalance(
          ClaimableBalanceId.claimableBalanceIdTypeV0(
            new Hash(this._key.subarray(1)),
          ),
        );

      case "muxedAccount":
        return ScAddress.scAddressTypeMuxedAccount(
          new MuxedEd25519Account({
            ed25519: this._key.subarray(0, 32),
            id: Uint64.fromXdr(this._key.subarray(32, 40), "raw"),
          }),
        );

      default:
        throw new Error("Unsupported address type");
    }
  }

  /**
   * Return the raw public key bytes for this address.
   */
  toBuffer(): Buffer {
    return this._key;
  }

  /**
   * Return the type of this address.
   */
  get type(): AddressType {
    return this._type;
  }
}
