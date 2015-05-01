import {Keypair, decodeBase58Check} from "stellar-base";

import {Currency} from "./currency";

export class Account {

    /**
    * Return a new account from a random keypair.
    */
    static random() {
        let keypair =  Keypair.random();
        return new this(keypair);
    }

    /**
    * Return a new Account from the given seed.
    */
    static fromSeed(seed) {
        let keypair = Keypair.fromSeed(seed);
        return new this(keypair);
    }

    /**
    * Return a new Account from an address.
    */
    static fromAddress(address) {
        let keypair = Keypair.fromAddress(address);
        return new this(keypair);
    }

    /**
    * Return the a new Account from the root keypair.
    */
    static fromRoot() {
        let keypair = Keypair.master();
        return new this(keypair);
    }

    /**
    * Returns true if the given address is a valid Stellar address.
    */
    static isValidAddress(address) {
        try {
            decodeBase58Check("accountId", address);
        } catch(err) {
            return false;
        }
        return true;
    }

    /**
    * Account class has a "masterkeypair" which is the master keypair for the account,
    * and can hold various other signer keypairs as well. If passed to Server.loadAccount(),
    * it will store the account's sequence number and balances.
    * @param {Keypair} master - The master keypair for the account.
    * @param {object} opts
    * @param {number} opts.seqNum - The account sequence number
    */
    constructor(master, opts={}) {
        this._masterKeypair = master;
        this.sequence = opts.sequence || 1;
        this._balances = [];
    }

    /**
    * Returns an array of the account's balances as {currency, balance} pairs, where
    * currency is a Currency object and balance is an integer amount.
    * @returns {array}
    */
    get balances() {
        return this._balances;
    }

    /**
    * Given the balances array returned from horizon, it will create currency objects
    * for each balance and store each {currency, balance} in the account's local balance array.
    */
    set balances(balances) {
        var balanceToObject = function (balance) {
            let obj = {};
            if (balance.currency.type === "native") {
                obj.currency = Currency.native();
            }
            obj.balance = balance.balance;
            return obj;
        };
        for (var i = 0; i < balances.length; i++) {
            this._balances[i] = balanceToObject(balances[i]);
        }
    }

    /**
    * Returns the account's address as a string.
    * @returns {string}
    */
    get address() {
        return this._masterKeypair.address();
    }

    /**
    * Returns the masterkeypair.
    */
    get masterKeypair() {
        return this._masterKeypair;
    }

    /**
    * Cannot set the master keypair of an account.
    * @throws {Error} Will always throw an error.
    */
    set masterKeypair(keypair) {
        throw new Error("cannot set the master keypair, construct a new account");
    }
}
