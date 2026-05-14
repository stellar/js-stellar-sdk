import { TrustLineAsset } from "./generated/index.js";

/**
 * LiquidityPoolId class represents the asset referenced by a trustline to a
 * liquidity pool.
 */
export class LiquidityPoolId {
  liquidityPoolId: string;

  /**
   * @param liquidityPoolId - The ID of the liquidity pool in string 'hex'.
   */
  constructor(liquidityPoolId: string) {
    if (!liquidityPoolId) {
      throw new Error("liquidityPoolId cannot be empty");
    }
    if (!/^[a-f0-9]{64}$/.test(liquidityPoolId)) {
      throw new Error("Liquidity pool ID is not a valid hash");
    }

    this.liquidityPoolId = liquidityPoolId;
  }

  /**
   * Returns a liquidity pool ID object from its TrustLineAsset representation.
   * @param tlAssetXdr - The asset XDR object.
   */
  static fromOperation(tlAssetXdr: TrustLineAsset): LiquidityPoolId {
    const assetType = tlAssetXdr.type;
    if (assetType === "assetTypePoolShare") {
      const liquidityPoolId = Buffer.from(tlAssetXdr.liquidityPoolId).toString(
        "hex",
      );
      return new LiquidityPoolId(liquidityPoolId);
    }

    throw new Error(`Invalid asset type: ${assetType}`);
  }

  /**
   * Returns the `TrustLineAsset` object for this liquidity pool ID.
   *
   * Note: To convert from {@link Asset `Asset`} to `TrustLineAsset` please
   * refer to the
   * {@link Asset.toTrustLineXDRObject `Asset.toTrustLineXDRObject`} method.
   */
  toXDRObject(): TrustLineAsset {
    const xdrPoolId = Buffer.from(this.liquidityPoolId, "hex");
    return TrustLineAsset.assetTypePoolShare(xdrPoolId);
  }

  /**
   * Returns the liquidity pool ID as a hex string.
   */
  getLiquidityPoolId(): string {
    return String(this.liquidityPoolId);
  }

  /**
   * Returns the asset type, always `"liquidity_pool_shares"`.
   *
   * @see [Assets concept](https://developers.stellar.org/docs/glossary/assets/)
   */
  getAssetType(): "liquidity_pool_shares" {
    return "liquidity_pool_shares";
  }

  /**
   * Returns true if this liquidity pool ID equals the given one.
   *
   * @param asset - LiquidityPoolId to compare.
   */
  equals(asset: LiquidityPoolId): boolean {
    return this.liquidityPoolId === asset.getLiquidityPoolId();
  }

  /**
   * Returns a string representation of this liquidity pool ID.
   */
  toString(): string {
    return `liquidity_pool:${this.liquidityPoolId}`;
  }
}
