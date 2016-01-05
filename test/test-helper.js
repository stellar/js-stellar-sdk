if (typeof window === 'undefined') {
  require('babel/register');
  global.StellarSdk = require('../src/index');
  global.axios = require("axios");
  var chaiAsPromised = require("chai-as-promised");
  global.chai = require('chai');
  global.chai.should();
  global.chai.use(chaiAsPromised);
  global.sinon = require('sinon');
  global.Promise = require('bluebird');
  global.expect = global.chai.expect;
} else {
  window.axios = StellarSdk.axios;
  window.Promise = window.bluebird = StellarSdk.bluebird;
}
