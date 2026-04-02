/* tslint:disable:variable-name */

import { Account as BaseAccount } from "@stellar/stellar-base";
import type { TransactionBuilder } from "@stellar/stellar-base";
import { HorizonApi } from "./horizon_api";
import { ServerApi } from "./server_api";

/**
 * Do not create this object directly, use {@link module:Horizon.Server#loadAccount | Horizon.Server#loadAccount}.
 *
 * Returns information and links relating to a single account.
 * The balances section in the returned JSON will also list all the trust lines this account has set up.
 * It also contains {@link BaseAccount} object and exposes it's methods so can be used in {@link TransactionBuilder}.
 *
 * @memberof module:Horizon
 * @private
 *
 * @see {@link https://developers.stellar.org/docs/data/horizon/api-reference/resources/accounts/object|Account Details}
 * @param {string} response Response from horizon account endpoint.
 * @returns {AccountResponse} AccountResponse instance
 */
export class AccountResponse {
  public readonly id!: string;
  public readonly paging_token!: string;
  public readonly account_id!: string;
  public sequence!: string;
  public readonly sequence_ledger?: number;
  public readonly sequence_time?: string;
  public readonly subentry_count!: number;
  public readonly home_domain?: string;
  public readonly inflation_destination?: string;
  public readonly last_modified_ledger!: number;
  public readonly last_modified_time!: string;
  public readonly thresholds!: HorizonApi.AccountThresholds;
  public readonly flags!: HorizonApi.Flags;
  public readonly balances!: HorizonApi.BalanceLine[];
  public readonly signers!: ServerApi.AccountRecordSigners[];
  public readonly num_sponsoring!: number;
  public readonly num_sponsored!: number;
  public readonly sponsor?: string;
  public readonly data!: (options: {
    value: string;
  }) => Promise<{ value: string }>;
  public readonly data_attr!: Record<string, string>;
  public readonly effects!: ServerApi.CallCollectionFunction<ServerApi.EffectRecord>;
  public readonly offers!: ServerApi.CallCollectionFunction<ServerApi.OfferRecord>;
  public readonly operations!: ServerApi.CallCollectionFunction<ServerApi.OperationRecord>;
  public readonly payments!: ServerApi.CallCollectionFunction<ServerApi.PaymentOperationRecord>;
  public readonly trades!: ServerApi.CallCollectionFunction<ServerApi.TradeRecord>;
  private readonly _baseAccount: BaseAccount;

  constructor(response: ServerApi.AccountRecord) {
    this._baseAccount = new BaseAccount(response.account_id, response.sequence);
    // Extract response fields
    this.effects = response.effects;
    this.offers = response.offers;
    this.operations = response.operations;
    this.payments = response.payments;
    this.trades = response.trades;
    this.data = response.data;
    this.id = response.id;
    this.paging_token = response.paging_token;
    this.account_id = response.account_id;
    this.sequence = response.sequence;
    this.sequence_ledger = response.sequence_ledger;
    this.sequence_time = response.sequence_time;
    this.subentry_count = response.subentry_count;
    this.home_domain = response.home_domain;
    this.inflation_destination = response.inflation_destination;
    this.last_modified_ledger = response.last_modified_ledger;
    this.last_modified_time = response.last_modified_time;
    this.thresholds = response.thresholds;
    this.flags = response.flags;
    this.balances = response.balances;
    this.signers = response.signers;
    this.data_attr = response.data_attr;
    this.sponsor = response.sponsor;
    this.num_sponsoring = response.num_sponsoring;
    this.num_sponsored = response.num_sponsored;
  }

  /**
   * Get Stellar account public key ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`
   * @returns {string} accountId
   */
  public accountId(): string {
    return this._baseAccount.accountId();
  }

  /**
   * Get the current sequence number
   * @returns {string} sequenceNumber
   */
  public sequenceNumber(): string {
    return this._baseAccount.sequenceNumber();
  }

  /**
   * Increments sequence number in this object by one.
   * @returns {void}
   */
  public incrementSequenceNumber(): void {
    this._baseAccount.incrementSequenceNumber();
    this.sequence = this._baseAccount.sequenceNumber();
  }
}
