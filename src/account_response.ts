/* tslint:disable:variable-name */

import { Omit } from "lodash";
import forIn from "lodash/forIn";
import { Account as BaseAccount } from "stellar-base";
import { Horizon } from "./horizon_api_types";
import { Server } from "./server_types";

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
export class AccountResponse implements Omit<Server.AccountRecord, "_links"> {
  public readonly id!: string;
  public readonly paging_token!: string;
  public readonly account_id!: string;
  public sequence!: string;
  public readonly subentry_count!: number;
  public readonly inflation_destination!: string;
  public readonly last_modified_ledger!: number;
  public readonly thresholds!: Horizon.AccountThresholds;
  public readonly flags!: Horizon.Flags;
  public readonly balances!: Horizon.BalanceLine[];
  public readonly signers!: Server.AccountRecordSigners[];
  public readonly data!: (options: {
    value: string;
  }) => Promise<{ value: string }>;
  public readonly data_attr!: Record<string, string>;
  public readonly effects!: Server.CallCollectionFunction<Server.EffectRecord>;
  public readonly offers!: Server.CallCollectionFunction<Server.OfferRecord>;
  public readonly operations!: Server.CallCollectionFunction<
    Server.OperationRecord
  >;
  public readonly payments!: Server.CallCollectionFunction<
    Server.PaymentOperationRecord
  >;
  public readonly trades!: Server.CallCollectionFunction<Server.TradeRecord>;
  private readonly _baseAccount: BaseAccount;

  constructor(response: Server.AccountRecord) {
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
}
