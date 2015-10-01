if (typeof window === 'undefined') {
  require('babel/register');
  global.StellarSdk = require('../lib/index'); // Use compiled code because it will be used by node
  global.axios = require("axios");
  global.chai = require('chai');
  global.sinon = require('sinon');
  global.Promise = require('bluebird');
  global.expect = global.chai.expect;
} else {
  window.axios = StellarSdk.axios;
  window.bluebird = StellarSdk.bluebird;
}
