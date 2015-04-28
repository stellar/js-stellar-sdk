import {Account} from "./account";
import {xdr, Keypair} from "stellar-base";

export class Currency {

    static native() {
        return new Currency("XLM");
    }

    static ISO4217(code, issuer) {
        return new Currency(code, issuer);
    }

    /**
    * A currency code describes a currency and issuer pair. In the case of the native
    * currency XLM, the issuer will be null.
    * @constructor
    * @param {string} code - The currency code.
    * @param {string} issuer - The address of the issuer.
    */
    constructor(code, issuer) {
        if (code.length != 3) {
            throw new Error("Currency code must be 3 characters");
        }
        if (code !== "XLM" && !issuer) {
            throw new Error("Issuer cannot be null");
        }
        this.code = code;
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
                currencyCode: this.code + "\0",
                issuer: Keypair.fromAddress(this.issuer).publicKey()
            });
            var currency = xdr.Currency.iso4217();
            currency.set("iso4217", isoCurrencyIssuer);

            return currency;
        }
    }

    isNative() {
        return this.code === "XLM";
    }

    equals(currency) {
        return this.code == currency.code && this.issuer == currency.issuer;
    }
}