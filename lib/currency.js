"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Account = require("./account").Account;

var xdr = require("stellar-base").xdr;

var Currency = exports.Currency = (function () {

    /**
    * A currency type describes a currency and issuer pair. In the case of the native
    * currency XLM, the issuer will be null.
    * @constructor
    * @type {string} The currency code
    */

    function Currency(type, issuer) {
        _classCallCheck(this, Currency);

        this.type = type;
        this._issuer = issuer ? Account.copy(issuer) : null;
    }

    _createClass(Currency, {
        toXdrObject: {
            value: function toXdrObject() {
                if (this.isNative()) {
                    return xdr.Currency.native();
                } else {
                    throw new Error("not implemented");
                }
            }
        },
        isNative: {
            value: function isNative() {
                return this.type === "XLM";
            }
        },
        issuer: {
            get: function () {
                return this._issuer ? Account.copy(this._issuer) : null;
            },
            set: function (issuer) {
                this._issuer = Account.copy(issuer);
            }
        }
    }, {
        copy: {
            value: function copy(currency) {
                return new Currency(currency.type, currency.issuer);
            }
        },
        native: {
            value: function native() {
                return new Currency("XLM");
            }
        },
        ISO4217: {
            value: function ISO4217(type, issuer) {
                return new Currency(type, issuer);
            }
        }
    });

    return Currency;
})();