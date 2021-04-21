import { AssetType } from "stellar-base";
import { Horizon } from "./../horizon_api";

export interface OfferAsset {
  asset_type: AssetType;
  asset_code?: string;
  asset_issuer?: string;
}

export interface AssetRecord extends Horizon.BaseResponse {
  asset_type: AssetType.credit4 | AssetType.credit12;
  asset_code: string;
  asset_issuer: string;
  paging_token: string;
  accounts: Horizon.AssetAccounts;
  num_claimable_balances: number;
  balances: Horizon.AssetBalances;
  claimable_balances_amount: string;
  amount: string;
  num_accounts: number;
  flags: Horizon.Flags;
}
