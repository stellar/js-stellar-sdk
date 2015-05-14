import {xdr} from "stellar-base";

/**
* @class Memo
*/
export class Memo {

    /**
    * Returns an empty memo.
    */
    static none() {
        return xdr.Memo.memoNone();
    }

    /**
    * Creates and returns a "text" memo.
    * @param {string} text - memo text
    * @returns {xdr.Memo}
    */
    static text(text) {
        if (typeof text !== "string") {
            throw new Error("Expects string type got a " + typeof(text));
        }
        if (Buffer.byteLength(text, "ascii") > 32) {
            throw new Error("Text should be < 32 bytes (ascii encoded). Got " + Buffer.byteLength(text, "ascii"));
        }
        return xdr.Memo.memoText(text);
    }

    /**
    * Creates and returns an "id" memo.
    * @param {string} id - 64 bit id
    * @returns {xdr.Memo}
    */
    static id(id) {
        if (Number(id) === "NaN") {
            throw new Error("Expects a int64 as a string. Got " + id);
        }
        return xdr.Memo.memoId(id);
    }

    /**
    * Creates and returns a "hash" memo.
    * @param {array|string} hash - 32 byte hash
    */
    static hash(hash) {
        if (typeof hash === "string" && Buffer.byteLength(hash) != 32) {
            throw new Error("Expects a 32 byte hash value. Got " + Buffer.byteLength(hash) + " bytes instead");
        }
        return xdr.Memo.memoHash(hash);
    }

    /**
    * Creates and returns a "return hash" memo.
    * @param {array|string} hash - 32 byte hash
    */
    static returnHash(hash) {
        if (typeof hash === "string" && Buffer.byteLength(hash) != 32) {
            throw new Error("Expects a 32 byte hash value. Got " + Buffer.byteLength(hash) + " bytes instead");
        }
        return xdr.Memo.memoReturn(hash);
    }
}