"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Keypair = require("stellar-base").Keypair;

var Currency = require("./currency").Currency;

var Account = exports.Account = (function () {

    /**
    * Constructs a new Account given the master keypair.
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
            get: function () {
                return this._masterKeypair.address();
            }
        },
        masterKeypair: {
            get: function () {
                return this._masterKeypair;
            },
            set: function (keypair) {
                throw new Error("cannot set the master keypair, construct a new account");
            }
        }
    }, {
        random: {
            value: function random() {
                var keypair = Keypair.random();
                return new this(keypair);
            }
        },
        fromSeed: {
            value: function fromSeed(seed) {
                var keypair = Keypair.fromSeed(seed);
                return new this(keypair);
            }
        },
        fromAddress: {
            value: function fromAddress(address) {
                var keypair = Keypair.fromAddress(address);
                return new this(keypair);
            }
        },
        fromMaster: {
            value: function fromMaster() {
                var keypair = Keypair.master();
                return new this(keypair);
            }
        }
    });

    return Account;
})();