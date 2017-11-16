import {Account as BaseAccount} from "stellar-base";
import forIn from "lodash/forIn";

/**
 * Do not create this object directly, use {@link Server#loadAccount}.
 *
 * Returns information and links relating to a single account.
 * The balances section in the returned JSON will also list all the trust lines this account has set up.
 * It also contains {@link Account} object and exposes it's methods so can be used in {@link TransactionBuilder}.
 *
 * @see [Account Details](https://www.stellar.org/developers/horizon/reference/accounts-single.html)
 * @param {string} response Response from horizon account endpoint.
 * @returns {AccountResponse}
 */
export class AccountResponse {
    constructor(response) {
        this._baseAccount = new BaseAccount(response.account_id, response.sequence);
        // Extract response fields
        forIn(response, (value, key) => {
            this[key] = value;
        });
    }

    /**
     * Returns Stellar account ID, ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`
     * @returns {string}
     */
    accountId() {
        return this._baseAccount.accountId();
    }

    /**
     * @returns {string}
     */
    sequenceNumber() {
        return this._baseAccount.sequenceNumber();
    }

    /**
     * Increments sequence number in this object by one.
     */
    incrementSequenceNumber() {
        this._baseAccount.incrementSequenceNumber();
        this.sequence = this._baseAccount.sequenceNumber();
    }
}
