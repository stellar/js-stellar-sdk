"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Keypair = require("stellar-base").Keypair;

var Account = exports.Account = (function () {
    function Account(keypair) {
        _classCallCheck(this, Account);

        this._keypair = keypair;
    }

    _createClass(Account, null, {
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