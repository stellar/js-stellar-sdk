import { StrKey } from "./strkey.js";
import xdr from "./xdr.js";

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
  static fromScVal(scVal: xdr.ScVal): Address {
    return Address.fromScAddress(scVal.address());
  }

  /**
   * Convert this from an xdr.ScAddress type
   *
   * @param scAddress - The xdr.ScAddress type to parse
   */
  static fromScAddress(scAddress: xdr.ScAddress): Address {
    switch (scAddress.switch().value) {
      case xdr.ScAddressType.scAddressTypeAccount().value:
        return Address.account(scAddress.accountId().ed25519());
      case xdr.ScAddressType.scAddressTypeContract().value:
        return Address.contract(scAddress.contractId() as unknown as Buffer);
      case xdr.ScAddressType.scAddressTypeMuxedAccount().value: {
        const raw = Buffer.concat([
          scAddress.muxedAccount().ed25519(),
          scAddress.muxedAccount().id().toXDR("raw"),
        ]);
        return Address.muxedAccount(raw);
      }
      case xdr.ScAddressType.scAddressTypeClaimableBalance().value: {
        const cbi = scAddress.claimableBalanceId();
        return Address.claimableBalance(
          Buffer.concat([Buffer.from([cbi.switch().value]), cbi.v0()]),
        );
      }
      case xdr.ScAddressType.scAddressTypeLiquidityPool().value:
        return Address.liquidityPool(
          scAddress.liquidityPoolId() as unknown as Buffer,
        );
      default:
        throw new Error(`Unsupported address type: ${scAddress.switch().name}`);
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
  toScVal(): xdr.ScVal {
    return xdr.ScVal.scvAddress(this.toScAddress());
  }

  /**
   * Convert this Address to an xdr.ScAddress type.
   */
  toScAddress(): xdr.ScAddress {
    switch (this._type) {
      case "account":
        return xdr.ScAddress.scAddressTypeAccount(
          xdr.PublicKey.publicKeyTypeEd25519(this._key),
        );
      case "contract":
        return xdr.ScAddress.scAddressTypeContract(
          this._key as unknown as xdr.Hash,
        );
      case "liquidityPool":
        return xdr.ScAddress.scAddressTypeLiquidityPool(
          this._key as unknown as xdr.Hash,
        );

      case "claimableBalance":
        return xdr.ScAddress.scAddressTypeClaimableBalance(
          xdr.ClaimableBalanceId.claimableBalanceIdTypeV0(
            this._key.subarray(1),
          ),
        );

      case "muxedAccount":
        return xdr.ScAddress.scAddressTypeMuxedAccount(
          new xdr.MuxedEd25519Account({
            ed25519: this._key.subarray(0, 32),
            id: xdr.Uint64.fromXDR(this._key.subarray(32, 40), "raw"),
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
