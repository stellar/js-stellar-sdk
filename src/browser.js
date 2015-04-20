"use strict";

require("babel/polyfill");

module.exports = require("./index");
module.exports.request = require("superagent");
module.exports.fixtures = require("../test/setup/fixtures");