/* eslint-disable no-undef */

if (typeof window === "undefined") {
  require("babel-register");
  global.StellarSdk = require("../dist/stellar-sdk");
  global.axios = StellarSdk.axios;
  global.HorizonAxiosClient = StellarSdk.HorizonAxiosClient;
  var chaiAsPromised = require("chai-as-promised");
  global.chai = require("chai");
  global.chai.should();
  global.chai.use(chaiAsPromised);
  global.sinon = require("sinon");
  global.expect = global.chai.expect;
} else {
  window.axios = StellarSdk.axios;
  window.HorizonAxiosClient = StellarSdk.HorizonAxiosClient;
}
