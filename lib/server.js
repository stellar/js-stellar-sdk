"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
* Server handles a network connection to a Horizon instance and exposes an
* interface for requests to that instance.
*/

var Server = exports.Server = (function () {
    function Server() {
        var config = arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Server);

        this.hostname = config.hostname || "localhost";
        this.port = config.port || 3000;
    }

    _createClass(Server, {
        submitTransaction: {

            /**
            * Submits a transaction to the network.
            * @param {Transaction} transaction - The transaction to submit.
            */

            value: function submitTransaction(transaction) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    request.post("http://" + self.hostname + ":" + self.port + "/transactions").type("json").send({
                        tx: transaction.toEnvelope().toXDR().toString("hex")
                    }).end(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(JSON.stringify(res.body));
                        }
                    });
                });
            }
        },
        loadAccount: {

            /**
            * Loads account details to the given account object.
            * @param {Account} account - The account to load. Will modify this object with
            */

            value: function loadAccount(account) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    request.get("http://" + self.hostname + ":" + self.port + "/accounts/" + account.address).end(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            account.sequence = res.body.sequence;
                            account.balances = res.body.balances;
                            resolve();
                        }
                    });
                });
            }
        }
    });

    return Server;
})();