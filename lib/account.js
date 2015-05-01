"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stellarBase = require("stellar-base");

var Keypair = _stellarBase.Keypair;
var decodeBase58Check = _stellarBase.decodeBase58Check;

var Currency = require("./currency").Currency;

var Account = exports.Account = (function () {

    /**
    * Account class has a "masterkeypair" which is the master keypair for the account,
    * and can hold various other signer keypairs as well. If passed to Server.loadAccount(),
    * it will store the account's sequence number and balances.
    * @param {Keypair} master - The master keypair for the account.
    * @param {object} opts
    * @param {number} opts.seqNum - The account sequence number
    */

    function Account(master) {
        var opts = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Account);

        this._masterKeypair = master;
        this.sequence = opts.sequence || 1;
        this._balances = [];
    }

    _createClass(Account, {
        balances: {

            /**
            * Returns an array of the account's balances as {currency, balance} pairs, where
            * currency is a Currency object and balance is an integer amount.
            * @returns {array}
            */

            get: function () {
                return this._balances;
            },

            /**
            * Given the balances array returned from horizon, it will create currency objects
            * for each balance and store each {currency, balance} in the account's local balance array.
            */
            set: function (balances) {
                var balanceToObject = function balanceToObject(balance) {
                    var obj = {};
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
        },
        address: {

            /**
            * Returns the account's address as a string.
            * @returns {string}
            */

            get: function () {
                return this._masterKeypair.address();
            }
        },
        masterKeypair: {

            /**
            * Returns the masterkeypair.
            */

            get: function () {
                return this._masterKeypair;
            },

            /**
            * Cannot set the master keypair of an account.
            * @throws {Error} Will always throw an error.
            */
            set: function (keypair) {
                throw new Error("cannot set the master keypair, construct a new account");
            }
        }
    }, {
        random: {

            /**
            * Return a new account from a random keypair.
            */

            value: function random() {
                var keypair = Keypair.random();
                return new this(keypair);
            }
        },
        fromSeed: {

            /**
            * Return a new Account from the given seed.
            */

            value: function fromSeed(seed) {
                var keypair = Keypair.fromSeed(seed);
                return new this(keypair);
            }
        },
        fromAddress: {

            /**
            * Return a new Account from an address.
            */

            value: function fromAddress(address) {
                var keypair = Keypair.fromAddress(address);
                return new this(keypair);
            }
        },
        fromRoot: {

            /**
            * Return the a new Account from the root keypair.
            */

            value: function fromRoot() {
                var keypair = Keypair.master();
                return new this(keypair);
            }
        },
        isValidAddress: {

            /**
            * Returns true if the given address is a valid Stellar address.
            */

            value: function isValidAddress(address) {
                try {
                    decodeBase58Check("accountId", address);
                } catch (err) {
                    return false;
                }
                return true;
            }
        }
    });

    return Account;
})();