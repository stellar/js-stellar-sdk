import { AssetType } from "stellar-base";
import { Horizon } from "../horizon_api";

export interface OfferAsset {
  asset_type: AssetType;
  asset_code?: string;
  asset_issuer?: string;
}

export interface OfferRecord extends Horizon.BaseResponse {
  id: number | string;
  paging_token: string;
  seller: string;
  selling: OfferAsset;
  buying: OfferAsset;
  amount: string;
  price_r: Horizon.PriceRShorthand;
  price: string;
  last_modified_ledger: number;
  last_modified_time: string;
  sponsor?: string;
}
