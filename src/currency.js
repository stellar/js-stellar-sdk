import {Account} from "./account";
import {xdr} from "stellar-base";

export class Currency {

    static native() {
        return new Currency("XLM");
    }

    static ISO4217(type, issuer) {
        return new Currency(type, issuer);
    }

    /**
    * A currency type describes a currency and issuer pair. In the case of the native
    * currency XLM, the issuer will be null.
    * @constructor
    * @type {string} The currency code
    */
    constructor(type, issuer) {
        this.type      = type;
        this.issuer   = issuer ? issuer : null;
    }

    toXdrObject() {
        if (this.isNative()) {
            return xdr.Currency.native();
        } else {
            throw new Error("not implemented");
        }
    }

    isNative() {
        return this.type === "XLM";
    }
}