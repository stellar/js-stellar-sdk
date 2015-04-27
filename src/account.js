import {Keypair, decodeBase58Check} from "stellar-base";

import {Currency} from "./currency";

export class Account {

    static random() {
        let keypair =  Keypair.random();
        return new this(keypair);
    }

    static fromSeed(seed) {
        let keypair = Keypair.fromSeed(seed);
        return new this(keypair);
    }

    static fromAddress(address) {
        let keypair = Keypair.fromAddress(address);
        return new this(keypair);
    }

    static fromMaster() {
        let keypair = Keypair.master();
        return new this(keypair);
    }

    static isValidAddress(address) {
        try {
            decodeBase58Check("accountId", address);
        } catch(err) {
            return false;
        }
        return true;
    }

    /**
    * Constructs a new Account given the master keypair.
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

    get address() {
        return this._masterKeypair.address();
    }

    get masterKeypair() {
        return this._masterKeypair;
    }

    set masterKeypair(keypair) {
        throw new Error("cannot set the master keypair, construct a new account");
    }
}
