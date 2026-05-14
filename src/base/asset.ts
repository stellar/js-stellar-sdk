import { trimEnd } from "./util/util.js";
import { StrKey } from "./strkey.js";
import { hash } from "./hashing.js";
import { HashIdPreimage as SchemaHashIdPreimage } from "./generated/schema/hash-id-preimage.js";
import {
  Asset as XdrAsset,
  type Asset as XdrAssetValue,
} from "./generated/dx/asset.js";
import {
  AssetType as XdrAssetType,
  AssetType as XdrAssetTypeValue,
} from "./generated/dx/asset-type.js";
import type { AlphaNum4 } from "./generated/dx/alpha-num4.js";
import type { AlphaNum12 } from "./generated/dx/alpha-num12.js";
import {
  ChangeTrustAsset,
  type ChangeTrustAsset as ChangeTrustAssetValue,
} from "./generated/dx/change-trust-asset.js";
import { ContractIdPreimage } from "./generated/dx/contract-id-preimage.js";
import { HashIdPreimage } from "./generated/dx/hash-id-preimage.js";
import { PublicKey } from "./generated/dx/public-key.js";
import {
  TrustLineAsset,
  type TrustLineAsset as TrustLineAssetValue,
} from "./generated/dx/trust-line-asset.js";

export const AssetType = {
  native: "native",
  credit4: "credit_alphanum4",
  credit12: "credit_alphanum12",
  liquidityPoolShares: "liquidity_pool_shares",
} as const;
export type AssetType = (typeof AssetType)[keyof typeof AssetType];
// Namespace merge so `AssetType.native` etc. can be used in type positions,
// matching the public API shape consumers depended on.

export namespace AssetType {
  export type native = "native";
  export type credit4 = "credit_alphanum4";
  export type credit12 = "credit_alphanum12";
  export type liquidityPoolShares = "liquidity_pool_shares";
}

interface XdrAssetConstructor<T> {
  assetTypeNative(): T;
  assetTypeCreditAlphanum4(attr: AlphaNum4): T;
  assetTypeCreditAlphanum12(attr: AlphaNum12): T;
}

/**
 * Compares two ASCII strings in lexographic order with uppercase precedence.
 *
 * @param a - the first string to compare
 * @param b - the second string to compare
 */
function asciiCompare(a: string, b: string): -1 | 0 | 1 {
  return Buffer.compare(Buffer.from(a, "ascii"), Buffer.from(b, "ascii"));
}

/**
 * Asset class represents an asset, either the native asset (`XLM`)
 * or an asset code / issuer account ID pair.
 *
 * An asset describes an asset code and issuer pair. In the case of the native
 * asset XLM, the issuer will be undefined.
 */
export class Asset {
  /** The asset code. */
  readonly code: string;
  /** The account ID of the issuer. Undefined for the native asset. */
  readonly issuer: string | undefined;

  /**
   * @param code - The asset code.
   * @param issuer - The account ID of the issuer.
   */
  constructor(code: string, issuer?: string) {
    if (!/^[a-zA-Z0-9]{1,12}$/.test(code)) {
      throw new Error(
        "Asset code is invalid (maximum alphanumeric, 12 characters at max)",
      );
    }
    if (String(code).toLowerCase() !== "xlm" && !issuer) {
      throw new Error("Issuer cannot be null");
    }
    if (issuer && !StrKey.isValidEd25519PublicKey(issuer)) {
      throw new Error("Issuer is invalid");
    }

    if (String(code).toLowerCase() === "xlm") {
      // transform all xLM, Xlm, etc. variants -> XLM
      this.code = "XLM";
    } else {
      this.code = code;
    }

    this.issuer = issuer;
  }

  /**
   * Returns an asset object for the native asset.
   */
  static native(): Asset {
    return new Asset("XLM");
  }

  /**
   * Returns an asset object from its XDR object representation.
   * @param assetXdr - The asset xdr object.
   */
  static fromOperation(assetXdr: XdrAssetValue): Asset {
    let anum;
    let code: string;
    let issuer: string;

    switch (assetXdr.type) {
      case XdrAssetTypeValue.assetTypeNative:
        return this.native();
      case XdrAssetTypeValue.assetTypeCreditAlphanum4:
        anum = assetXdr.alphaNum4;
        issuer = StrKey.encodeEd25519PublicKey(
          Buffer.from(anum.issuer.ed25519),
        );
        code = trimEnd(anum.assetCode, "\0") as string;
        return new this(code, issuer);
      case XdrAssetTypeValue.assetTypeCreditAlphanum12:
        anum = assetXdr.alphaNum12;
        issuer = StrKey.encodeEd25519PublicKey(
          Buffer.from(anum.issuer.ed25519),
        );
        code = trimEnd(anum.assetCode, "\0") as string;
        return new this(code, issuer);
      default:
        throw new Error(`Invalid asset type: ${assetXdr}`);
    }
  }

  /**
   * Returns the xdr.Asset object for this asset.
   */
  toXDRObject(): XdrAssetValue {
    return this._toXDRObject(XdrAsset);
  }

  /**
   * Returns the generated wire XDR asset object used internally for encoding.
   */
  toWireXDRObject(): XdrAssetValue {
    return this.toXDRObject();
  }

  /**
   * Returns the xdr.ChangeTrustAsset object for this asset.
   */
  toChangeTrustXDRObject(): ChangeTrustAssetValue {
    return this._toXDRObject(ChangeTrustAsset);
  }

  toWireChangeTrustXDRObject(): ChangeTrustAssetValue {
    return this.toChangeTrustXDRObject();
  }

  /**
   * Returns the xdr.TrustLineAsset object for this asset.
   */
  toTrustLineXDRObject(): TrustLineAssetValue {
    return this._toXDRObject(TrustLineAsset);
  }

  toWireTrustLineXDRObject(): TrustLineAssetValue {
    return this.toTrustLineXDRObject();
  }

  /**
   * Returns the would-be contract ID (`C...` format) for this asset on a given
   * network.
   *
   * @param networkPassphrase - indicates which network the contract
   *    ID should refer to, since every network will have a unique ID for the
   *    same contract (see {@link Networks} for options)
   *
   * @warning This makes no guarantee that this contract actually *exists*.
   */
  contractId(networkPassphrase: string): string {
    const networkId = hash(Buffer.from(networkPassphrase));
    const preimage = HashIdPreimage.envelopeTypeContractId({
      networkId: networkId,
      contractIdPreimage: ContractIdPreimage.contractIdPreimageFromAsset(
        this.toXDRObject(),
      ),
    });

    return StrKey.encodeContract(
      hash(
        Buffer.from(
          SchemaHashIdPreimage.encode(HashIdPreimage.toXDRObject(preimage)),
        ),
      ),
    );
  }

  /**
   * Returns the xdr object for this asset.
   * @param xdrAsset - The xdr asset constructor.
   */
  private _toXDRObject<T>(xdrAsset: XdrAssetConstructor<T>): T {
    if (this.isNative()) {
      return xdrAsset.assetTypeNative();
    }

    // This should never happen because the constructor should throw an error if the issuer is null for a non-native asset, but we check here just to be safe.
    if (!this.issuer) {
      throw new Error("Issuer cannot be null for non-native asset");
    }

    // pad code with null bytes if necessary
    const padLength = this.code.length <= 4 ? 4 : 12;
    const paddedCode = this.code.padEnd(padLength, "\0");
    if (this.code.length <= 4) {
      return xdrAsset.assetTypeCreditAlphanum4({
        assetCode: paddedCode,
        issuer: PublicKey.publicKeyTypeEd25519(
          StrKey.decodeEd25519PublicKey(this.issuer),
        ),
      });
    } else {
      return xdrAsset.assetTypeCreditAlphanum12({
        assetCode: paddedCode,
        issuer: PublicKey.publicKeyTypeEd25519(
          StrKey.decodeEd25519PublicKey(this.issuer),
        ),
      });
    }
  }

  /**
   * Returns the asset code
   */
  getCode(): string {
    return String(this.code);
  }

  /**
   * Returns the asset issuer
   */
  getIssuer(): string | undefined {
    if (this.issuer === undefined) {
      return undefined;
    }
    return String(this.issuer);
  }

  /**
   * @see [Assets concept](https://developers.stellar.org/docs/glossary/assets/)
   * Returns the asset type. Can be one of following types:
   *
   *  - `native`,
   *  - `credit_alphanum4`,
   *  - `credit_alphanum12`
   * @throws {Error} Throws `Error` if asset type is unsupported.
   */
  getAssetType(): AssetType {
    switch (this.getRawAssetType()) {
      case XdrAssetType.assetTypeNative:
        return AssetType.native;
      case XdrAssetType.assetTypeCreditAlphanum4:
        return AssetType.credit4;
      case XdrAssetType.assetTypeCreditAlphanum12:
        return AssetType.credit12;
      default:
        throw new Error(
          "Supported asset types are: native, credit_alphanum4, credit_alphanum12",
        );
    }
  }

  /**
   * Returns the raw XDR representation of the asset type
   */
  getRawAssetType(): XdrAssetTypeValue {
    if (this.isNative()) {
      return XdrAssetType.assetTypeNative;
    }

    if (this.code.length <= 4) {
      return XdrAssetType.assetTypeCreditAlphanum4;
    }

    return XdrAssetType.assetTypeCreditAlphanum12;
  }

  /**
   * Returns true if this asset object is the native asset.
   */
  isNative(): boolean {
    return !this.issuer;
  }

  /**
   * Returns true if this asset equals the given asset.
   *
   * @param asset - Asset to compare
   */
  equals(asset: Asset): boolean {
    return this.code === asset.getCode() && this.issuer === asset.getIssuer();
  }

  /**
   * Returns a string representation of this asset.
   *
   * Native assets return `"native"`. Non-native assets return `"code:issuer"`.
   */
  toString(): string {
    if (this.isNative()) {
      return "native";
    }

    return `${this.getCode()}:${this.getIssuer()}`;
  }

  /**
   * Compares two assets according to the criteria:
   *
   *  1. First compare the type (native < alphanum4 < alphanum12).
   *  2. If the types are equal, compare the assets codes.
   *  3. If the asset codes are equal, compare the issuers.
   *
   * @param assetA - the first asset
   * @param assetB - the second asset
   */
  static compare(assetA: Asset, assetB: Asset): -1 | 0 | 1 {
    if (!assetA || !(assetA instanceof Asset)) {
      throw new Error("assetA is invalid");
    }
    if (!assetB || !(assetB instanceof Asset)) {
      throw new Error("assetB is invalid");
    }

    if (assetA.equals(assetB)) {
      return 0;
    }

    // Compare asset types. Rank natively (native < anum4 < anum12) rather than
    // lex-compare the string discriminators, which would put "C..." before "N...".
    const typeRank: Record<XdrAssetTypeValue, number> = {
      assetTypeNative: 0,
      assetTypeCreditAlphanum4: 1,
      assetTypeCreditAlphanum12: 2,
      assetTypePoolShare: 3,
    };
    const aRank = typeRank[assetA.getRawAssetType()];
    const bRank = typeRank[assetB.getRawAssetType()];
    if (aRank !== bRank) {
      return aRank < bRank ? -1 : 1;
    }

    // Compare asset codes.
    const result = asciiCompare(assetA.getCode(), assetB.getCode());
    if (result !== 0) {
      return result;
    }

    // Compare asset issuers.
    const issuerA = assetA.getIssuer();
    const issuerB = assetB.getIssuer();

    if (issuerA === undefined || issuerB === undefined) {
      throw new Error("Issuer is undefined for non-native asset");
    }
    return asciiCompare(issuerA, issuerB);
  }
}
