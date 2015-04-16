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
        sendTransaction: {
            value: function sendTransaction(transaction) {
                var re = request.post(this.hostname + ":" + this.port + "/transactions").type("json").send({
                    tx: transaction.blob
                });
                console.log(re);
                re.end(function (err, res) {
                    console.log(res);
                    if (err) {
                        console.error(err);
                    } else if (res.body.status === "fail") {} else if (res.body.status === "success") {} else {}
                });
            }
        }
    });

    return Server;
})();

// resolver.reject(new errors.UnknownError(JSON.stringify(res.body)));