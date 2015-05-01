"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Account = require("./account").Account;

var _stellarBase = require("stellar-base");

var xdr = _stellarBase.xdr;
var Keypair = _stellarBase.Keypair;
var encodeBase58Check = _stellarBase.encodeBase58Check;

/**
* Currency class represents a currency, either the native currency ("XLM")
* or a currency code / issuer address pair.
*/

var Currency = exports.Currency = (function () {

    /**
    * A currency code describes a currency and issuer pair. In the case of the native
    * currency XLM, the issuer will be null.
    * @constructor
    * @param {string} code - The currency code.
    * @param {string} issuer - The address of the issuer.
    */

    function Currency(code, issuer) {
        _classCallCheck(this, Currency);

        if (code.length != 3 && code.length != 4) {
            throw new Error("Currency code must be 3 or 4 characters");
        }
        if (code !== "XLM" && !issuer) {
            throw new Error("Issuer cannot be null");
        }
        // pad code with null byte if necessary
        this.code = code.length == 3 ? code + "\u0000" : code;
        this.issuer = issuer;
    }

    _createClass(Currency, {
        toXdrObject: {

            /**
            * Returns the xdr object for this currency.
            */

            value: function toXdrObject() {
                if (this.isNative()) {
                    return xdr.Currency.native();
                } else {
                    // need to pad the currency code with the null byte
                    var isoCurrencyIssuer = new xdr.IsoCurrencyIssuer({
                        currencyCode: this.code,
                        issuer: Keypair.fromAddress(this.issuer).publicKey()
                    });
                    var currency = xdr.Currency.iso4217();
                    currency.set("iso4217", isoCurrencyIssuer);

                    return currency;
                }
            }
        },
        isNative: {

            /**
            * Returns true if this currency object is the native currency.
            */

            value: function isNative() {
                return this.code === "XLM\u0000";
            }
        },
        equals: {

            /**
            * Returns true if this currency equals the given currency.
            */

            value: function equals(currency) {
                return this.code == currency.code && this.issuer == currency.issuer;
            }
        }
    }, {
        native: {

            /**
            * Returns a currency object for the native currency.
            */

            value: function native() {
                return new Currency("XLM");
            }
        },
        fromOperation: {

            /**
            * Returns a currency object from its XDR object representation.
            * @param {xdr.Currency.iso4217} xdr - The currency xdr object.
            */

            value: function fromOperation(xdr) {
                if (xdr._switch.name == "native") {
                    return this.native();
                } else {
                    var code = xdr._value._attributes.currencyCode;
                    var issuer = encodeBase58Check("accountId", xdr._value._attributes.issuer);
                    return new this(code, issuer);
                }
            }
        }
    });

    return Currency;
})();