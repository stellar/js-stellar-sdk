if (typeof window === 'undefined') {
  require('babel-register');
  global.StellarSdk = require('../src/index');
  global.axios = require('axios');
  global.HorizonAxiosClient = StellarSdk.HorizonAxiosClient;
  var chaiAsPromised = require('chai-as-promised');
  global.chai = require('chai');
  global.chai.should();
  global.chai.use(chaiAsPromised);
  global.sinon = require('sinon');
  global.expect = global.chai.expect;
} else {
  // eslint-disable-next-line no-undef
  window.axios = StellarSdk.axios;
  window.HorizonAxiosClient = StellarSdk.HorizonAxiosClient;
}
