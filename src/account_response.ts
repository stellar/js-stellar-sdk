/* tslint:disable:variable-name */

import forIn from "lodash/forIn";
import { Account as BaseAccount, MuxedAccount } from "stellar-base";
import { Horizon } from "./horizon_api";
import { ServerApi } from "./server_api";

/**
 * Do not create this object directly, use {@link Server#loadAccount}.
 *
 * Returns information and links relating to a single account.
 * The balances section in the returned JSON will also list all the trust lines this account has set up.
 * It also contains {@link Account} object and exposes it's methods so can be used in {@link TransactionBuilder}.
 *
 * @see [Account Details](https://www.stellar.org/developers/horizon/reference/endpoints/accounts-single.html)
 * @param {string} response Response from horizon account endpoint.
 * @returns {AccountResponse} AccountResponse instance
 */
export class AccountResponse {
  public readonly id!: string;
  public readonly paging_token!: string;
  public readonly account_id!: string;
  public sequence!: string;
  public readonly subentry_count!: number;
  public readonly home_domain?: string;
  public readonly inflation_destination?: string;
  public readonly last_modified_ledger!: number;
  public readonly thresholds!: Horizon.AccountThresholds;
  public readonly flags!: Horizon.Flags;
  public readonly balances!: Horizon.BalanceLine[];
  public readonly signers!: ServerApi.AccountRecordSigners[];
  public readonly data!: (options: {
    value: string;
  }) => Promise<{ value: string }>;
  public readonly data_attr!: Record<string, string>;
  public readonly effects!: ServerApi.CallCollectionFunction<
    ServerApi.EffectRecord
  >;
  public readonly offers!: ServerApi.CallCollectionFunction<
    ServerApi.OfferRecord
  >;
  public readonly operations!: ServerApi.CallCollectionFunction<
    ServerApi.OperationRecord
  >;
  public readonly payments!: ServerApi.CallCollectionFunction<
    ServerApi.PaymentOperationRecord
  >;
  public readonly trades!: ServerApi.CallCollectionFunction<
    ServerApi.TradeRecord
  >;
  private readonly _baseAccount: BaseAccount;

  constructor(response: ServerApi.AccountRecord) {
    this._baseAccount = new BaseAccount(response.account_id, response.sequence);
    // Extract response fields
    // TODO: do it in type-safe manner.
    forIn(response, (value, key) => {
      (this as any)[key] = value;
    });
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

  public createSubaccount(id: string): MuxedAccount {
    return this._baseAccount.createSubaccount(id);
  }
}
