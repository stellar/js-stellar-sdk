"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var decodeBase58Check = require("stellar-base").decodeBase58Check;

/**
* @class Account
*/

var Account = exports.Account = (function () {

    /**
    * Create a new Account object.
    * @param {string} address
    * @param {number} sequence
    */

    function Account(address, sequence) {
        _classCallCheck(this, Account);

        this.address = address;
        this.sequence = sequence;
    }

    _createClass(Account, null, {
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