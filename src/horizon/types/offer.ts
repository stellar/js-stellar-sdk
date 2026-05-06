import type { AssetType } from "../../base/index.js";
import { HorizonApi } from "../horizon_api.js";

/** @category Network / Horizon */
export interface OfferAsset {
  asset_type: AssetType;
  asset_code?: string;
  asset_issuer?: string;
}

/** @category Network / Horizon */
export interface OfferRecord extends HorizonApi.BaseResponse {
  id: number | string;
  paging_token: string;
  seller: string;
  selling: OfferAsset;
  buying: OfferAsset;
  amount: string;
  price_r: HorizonApi.PriceRShorthand;
  price: string;
  last_modified_ledger: number;
  last_modified_time: string;
  sponsor?: string;
}
