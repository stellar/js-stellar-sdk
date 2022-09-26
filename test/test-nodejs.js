/* eslint-disable no-undef */

require("babel-register");
global.StellarSdk = require("../lib/");

global.axios = require("axios");
global.AxiosClient = StellarSdk.AxiosClient;

var chaiAsPromised = require("chai-as-promised");
var chaiHttp = require("chai-http");
global.chai = require("chai");
global.chai.should();
global.chai.use(chaiAsPromised);
global.chai.use(chaiHttp);
global.expect = global.chai.expect;

global.sinon = require("sinon");
