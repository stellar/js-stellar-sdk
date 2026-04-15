import { trimEnd } from "./util/util.js";
import xdr from "./xdr.js";
import { Keypair } from "./keypair.js";
import { StrKey } from "./strkey.js";
import { hash } from "./hashing.js";

export const AssetType = {
  native: "native",
  credit4: "credit_alphanum4",
  credit12: "credit_alphanum12",
  liquidityPoolShares: "liquidity_pool_shares",
} as const;
export type AssetType = (typeof AssetType)[keyof typeof AssetType];

interface XdrAssetConstructor<T> {
  assetTypeNative(): T;
  new (type: string, value: xdr.AlphaNum4 | xdr.AlphaNum12): T;
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
  static fromOperation(assetXdr: xdr.Asset): Asset {
    let anum;
    let code: string;
    let issuer: string;
    switch (assetXdr.switch()) {
      case xdr.AssetType.assetTypeNative():
        return this.native();
      case xdr.AssetType.assetTypeCreditAlphanum4():
        anum = assetXdr.alphaNum4();
        issuer = StrKey.encodeEd25519PublicKey(anum.issuer().ed25519());
        code = trimEnd(anum.assetCode().toString(), "\0") as string;
        return new this(code, issuer);
      case xdr.AssetType.assetTypeCreditAlphanum12():
        anum = assetXdr.alphaNum12();
        issuer = StrKey.encodeEd25519PublicKey(anum.issuer().ed25519());
        code = trimEnd(anum.assetCode().toString(), "\0") as string;
        return new this(code, issuer);
      default:
        throw new Error(`Invalid asset type: ${assetXdr.switch().name}`);
    }
  }

  /**
   * Returns the xdr.Asset object for this asset.
   */
  toXDRObject(): xdr.Asset {
    return this._toXDRObject(xdr.Asset);
  }

  /**
   * Returns the xdr.ChangeTrustAsset object for this asset.
   */
  toChangeTrustXDRObject(): xdr.ChangeTrustAsset {
    return this._toXDRObject(xdr.ChangeTrustAsset);
  }

  /**
   * Returns the xdr.TrustLineAsset object for this asset.
   */
  toTrustLineXDRObject(): xdr.TrustLineAsset {
    return this._toXDRObject(xdr.TrustLineAsset);
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
    const preimage = xdr.HashIdPreimage.envelopeTypeContractId(
      new xdr.HashIdPreimageContractId({
        networkId,
        contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAsset(
          this.toXDRObject(),
        ),
      }),
    );

    return StrKey.encodeContract(hash(preimage.toXDR()));
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

    let xdrType;
    let xdrTypeString: string;
    if (this.code.length <= 4) {
      xdrType = xdr.AlphaNum4;
      xdrTypeString = "assetTypeCreditAlphanum4";
    } else {
      xdrType = xdr.AlphaNum12;
      xdrTypeString = "assetTypeCreditAlphanum12";
    }

    // pad code with null bytes if necessary
    const padLength = this.code.length <= 4 ? 4 : 12;
    const paddedCode = this.code.padEnd(padLength, "\0");

    const assetType = new xdrType({
      assetCode: paddedCode,
      issuer: Keypair.fromPublicKey(this.issuer).xdrAccountId(),
    });

    return new xdrAsset(xdrTypeString, assetType);
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
    switch (this.getRawAssetType().value) {
      case xdr.AssetType.assetTypeNative().value:
        return AssetType.native;
      case xdr.AssetType.assetTypeCreditAlphanum4().value:
        return AssetType.credit4;
      case xdr.AssetType.assetTypeCreditAlphanum12().value:
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
  getRawAssetType(): xdr.AssetType {
    if (this.isNative()) {
      return xdr.AssetType.assetTypeNative();
    }

    if (this.code.length <= 4) {
      return xdr.AssetType.assetTypeCreditAlphanum4();
    }

    return xdr.AssetType.assetTypeCreditAlphanum12();
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

    // Compare asset types.
    const xdrAtype = assetA.getRawAssetType().value;
    const xdrBtype = assetB.getRawAssetType().value;
    if (xdrAtype !== xdrBtype) {
      return xdrAtype < xdrBtype ? -1 : 1;
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

/**
 * Compares two ASCII strings in lexographic order with uppercase precedence.
 *
 * @param a - the first string to compare
 * @param b - the second string to compare
 */
function asciiCompare(a: string, b: string): -1 | 0 | 1 {
  return Buffer.compare(Buffer.from(a, "ascii"), Buffer.from(b, "ascii"));
}
