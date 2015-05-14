"use strict";

require("babel/polyfill");

module.exports = require("./index");
module.exports.axios = require("axios");
module.exports.bluebird = require("bluebird");
module.exports.StellarBase = require("stellar-base");