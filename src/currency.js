import {Account} from "./account";
import {xdr, Keypair, encodeBase58Check} from "stellar-base";

/**
* Currency class represents a currency, either the native currency ("XLM")
* or a currency code / issuer address pair.
*/
export class Currency {

    /**
    * Returns a currency object for the native currency.
    */
    static native() {
        return new Currency("XLM");
    }

    /**
    * Returns a currency object from its XDR object representation.
    * @param {xdr.Currency.iso4217} xdr - The currency xdr object.
    */
    static fromOperation(xdr) {
        if (xdr._switch.name == "native") {
            return this.native();
        } else {
            let code = xdr._value._attributes.currencyCode;
            let issuer = encodeBase58Check("accountId", xdr._value._attributes.issuer);
            return new this(code, issuer);
        }
    }

    /**
    * A currency code describes a currency and issuer pair. In the case of the native
    * currency XLM, the issuer will be null.
    * @constructor
    * @param {string} code - The currency code.
    * @param {string} issuer - The address of the issuer.
    */
    constructor(code, issuer) {
        if (code.length != 3 && code.length != 4) {
            throw new Error("Currency code must be 3 or 4 characters");
        }
        if (code !== "XLM" && !issuer) {
            throw new Error("Issuer cannot be null");
        }
        // pad code with null byte if necessary
        this.code = code.length == 3 ? code + "\0" : code;
        this.issuer = issuer;
    }

    /**
    * Returns the xdr object for this currency.
    */
    toXdrObject() {
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

    /**
    * Returns true if this currency object is the native currency.
    */
    isNative() {
        return this.code === "XLM\0";
    }

    /**
    * Returns true if this currency equals the given currency.
    */
    equals(currency) {
        return this.code == currency.code && this.issuer == currency.issuer;
    }
}