import { Horizon } from "./../horizon_api";
import { OfferAsset } from "./assets";

// Reference: GO SDK https://github.com/stellar/go/blob/ec5600bd6b2b6900d26988ff670b9ca7992313b8/services/horizon/internal/resourceadapter/effects.go
export enum EffectType {
  "account_created",
  "account_removed",
  "account_credited",
  "account_debited",
  "account_thresholds_updated",
  "account_home_domain_updated",
  "account_flags_updated",
  "account_inflation_destination_updated",
  "signer_created",
  "signer_removed",
  "signer_updated",
  "trustline_created",
  "trustline_removed",
  "trustline_updated",
  "trustline_authorized",
  "trustline_authorized_to_maintain_liabilities",
  "trustline_deauthorized",
  "trustline_flags_updated",
  "offer_created",
  "offer_removed",
  "offer_updated",
  "trade",
  "data_created",
  "data_removed",
  "data_updated",
  "sequence_bumped",
  "claimable_balance_created",
  "claimable_balance_claimant_created",
  "claimable_balance_claimed",
  "account_sponsorship_created",
  "account_sponsorship_updated",
  "account_sponsorship_removed",
  "trustline_sponsorship_created",
  "trustline_sponsorship_updated",
  "trustline_sponsorship_removed",
  "data_sponsorship_created",
  "data_sponsorship_updated",
  "data_sponsorship_removed",
  "claimable_balance_sponsorship_created",
  "claimable_balance_sponsorship_updated",
  "claimable_balance_sponsorship_removed",
  "signer_sponsorship_created",
  "signer_sponsorship_updated",
  "signer_sponsorship_removed",
  "claimable_balance_clawed_back",
}

export interface BaseEffectRecord extends Horizon.BaseResponse {
  id: string;
  account: string;
  paging_token: string;
  type_i: string;
  type: EffectType;
  created_at: string;
}

export interface AccountCreated extends BaseEffectRecord {
  starting_balance: string;
}

export interface AccountCredited extends BaseEffectRecord, OfferAsset {
  amount: string;
}

export type AccountDebited = AccountCredited;

export interface AccountThresholdsUpdated extends BaseEffectRecord {
  low_threshold: number;
  med_threshold: number;
  high_threshold: number;
}

export interface AccountHomeDomainUpdated extends BaseEffectRecord {
  home_domain: string;
}

export interface AccountFlagsUpdated extends BaseEffectRecord {
  auth_required_flag: boolean;
  auth_revokable_flag: boolean;
}

interface DataEvents extends BaseEffectRecord {
  name: boolean;
  value: boolean;
}

export type DataCreated = DataEvents;
export type DataUpdated = DataEvents;
export type DataRemoved = DataEvents;

export interface SequenceBumped extends BaseEffectRecord {
  new_seq: number | string;
}

interface SignerEvents extends BaseEffectRecord {
  weight: number;
  key: string;
  public_key: string;
}

export type SignerCreated = SignerEvents;
export type SignerRemoved = SignerEvents;
export type SignerUpdated = SignerEvents;

interface TrustlineEvents extends BaseEffectRecord, OfferAsset {
  limit: string;
}

export type TrustlineCreated = TrustlineEvents;
export type TrustlineRemoved = TrustlineEvents;
export type TrustlineUpdated = TrustlineEvents;

export interface TrustlineAuthorized extends BaseEffectRecord {
  asset_type: OfferAsset["asset_type"];
  asset_code: OfferAsset["asset_code"];
  trustor: string;
}

export type TrustlineDeautorized = TrustlineAuthorized;
export type TrustlineAutorizedToMaintainLiabilities = TrustlineAuthorized;

export interface ClaimableBalanceCreated extends BaseEffectRecord {
  amount: string;
  balance_id: string;
  asset: string;
}

export type ClaimableBalanceClaimed = ClaimableBalanceCreated;
export interface ClaimableBalanceClaimantCreated
  extends ClaimableBalanceCreated {
  predicate: Horizon.Predicate;
}

interface SponsershipFields {
  sponsor: string;
  new_sponsor: string;
  former_sponsor: string;
}

interface AccountSponsporshipEvents
  extends BaseEffectRecord,
    SponsershipFields {}
export type AccountSponsporshipCreated = Omit<
  AccountSponsporshipEvents,
  "new_sponsor" | "former_sponsor"
>;
export type AccountSponsporshipUpdated = Omit<
  AccountSponsporshipEvents,
  "sponsor"
>;
export type AccountSponsporshipRemoved = Omit<
  AccountSponsporshipEvents,
  "new_sponsor" | "sponsor"
>;

interface TrustlineSponsporshipEvents
  extends BaseEffectRecord,
    SponsershipFields {
  asset: string;
}

export type TrustlineSponsporshipCreated = Omit<
  TrustlineSponsporshipEvents,
  "new_sponsor" | "former_sponsor"
>;
export type TrustlineSponsporshipUpdated = Omit<
  TrustlineSponsporshipEvents,
  "sponsor"
>;
export type TrustlineSponsporshipRemoved = Omit<
  TrustlineSponsporshipEvents,
  "new_sponsor" | "sponsor"
>;

interface DataSponsporshipEvents extends BaseEffectRecord, SponsershipFields {
  data_name: string;
}

export type DateSponsporshipCreated = Omit<
  DataSponsporshipEvents,
  "new_sponsor" | "former_sponsor"
>;
export type DateSponsporshipUpdated = Omit<DataSponsporshipEvents, "sponsor">;
export type DateSponsporshipRemoved = Omit<
  DataSponsporshipEvents,
  "new_sponsor" | "sponsor"
>;

interface ClaimableBalanceSponsorshipEvents
  extends BaseEffectRecord,
    SponsershipFields {
  balance_id: string;
}

export type ClaimableBalanceSponsorshipCreated = Omit<
  ClaimableBalanceSponsorshipEvents,
  "new_sponsor" | "former_sponsor"
>;
export type ClaimableBalanceSponsorshipUpdated = Omit<
  ClaimableBalanceSponsorshipEvents,
  "sponsor"
>;
export type ClaimableBalanceSponsorshipRemoved = Omit<
  ClaimableBalanceSponsorshipEvents,
  "new_sponsor" | "sponsor"
>;

interface SignerSponsorshipEvents extends BaseEffectRecord, SponsershipFields {
  signer: string;
}

export type SignerSponsorshipCreated = Omit<
  SignerSponsorshipEvents,
  "new_sponsor" | "former_sponsor"
>;
export type SignerSponsorshipUpdated = Omit<SignerSponsorshipEvents, "sponsor">;
export type SignerSponsorshipRemoved = Omit<
  SignerSponsorshipEvents,
  "new_sponsor" | "sponsor"
>;
