import {xdr, Keypair, Hyper, hash, encodeBase58Check} from "stellar-base";

import {Account} from "./account";
import {Currency} from "./currency";

export class Operation {
    /**
    * Returns a the xdr representation of a payment operation.
    * @param {object}   opts
    * @param {Account}  opts.destination    - The destination account for the payment.
    * @param {Currency} opts.currency       - The currency to send
    * @param {string|number} otps.amount    - The amount to send.
    * @param {Account}  [opts.source]       - The source account for the payment. Defaults to the transaction's source account.
    * @param {array}    [opts.path]         - An array of Currency objects to use as the path.
    * @param {string}   [opts.sendMax]      - The max amount of currency to send.
    * @param {string}   [opts.sourceMemo]   - The source memo.
    * @param {string}   [opts.memo]         - The memo.
    */
    static payment(opts) {
        if (!opts.destination) {
            throw new Error("Must provide a destination for a payment operation");
        }
        if (!opts.currency) {
            throw new Error("Must provide a currency for a payment operation");
        }
        if (!opts.amount) {
            throw new Error("Must provide an amount for a payment operation");
        }
        let destinationPublicKey    = Keypair.fromAddress(opts.destination).publicKey();
        let currencyXdr             = opts.currency.toXdrObject();
        let value                   = Hyper.fromString(String(opts.amount));
        let sourcePublicKey         = opts.source ? opts.source.masterKeypair : null;
        let path                    = opts.path ? opts.path : [];
        let sendMax                 = opts.sendMax ? Hyper.fromString(String(opts.sendMax)) : value;
        let sourceMemo              = null;
        let memo                    = null;
        if (opts.sourceMemo) {
            sourceMemo = opts.sourceMemo;
        } else {
            sourceMemo = new Buffer(32);
            sourceMemo.fill(0);
        }
        if (opts.memo) {
            memo = opts.memo;
        } else {
            memo = new Buffer(32);
            memo.fill(0);
        }

        let payment = new xdr.PaymentOp({
          destination: destinationPublicKey,
          currency:    currencyXdr,
          path:        path,
          amount:      value,
          sendMax:     sendMax,
          sourceMemo:  sourceMemo,
          memo:        memo,
        });

        let op = new xdr.Operation({
            body: xdr.OperationBody.payment(payment),
        });

        return op;
    }

    /**
    * Converts the xdr form of an operation to its object form.
    */
    static operationToObject(operation) {
        let obj = {};
        let attrs = operation._value._attributes;
        switch (operation._arm) {
            case "paymentOp":
                obj.type = "paymentOp";
                obj.destination = Account.fromAddress(encodeBase58Check("accountId", attrs.destination));
                obj.currency = attrs.currency._switch.name == "native" ? Currency.native() : null;
                obj.path = attrs.path;
                obj.amount = attrs.amount.toString();
                obj.sendMax = attrs.sendMax.toString();
                obj.sourceMemo = attrs.sourceMemo;
                obj.memo = attrs.memo;
                break;
        }
        return obj;
    }

    static objectToOperation(obj) {
        switch (obj.type) {
            case "paymentOp":
                return Operation.payment(obj);
        }
    }
}