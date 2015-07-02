global.StellarLib = require('../../src/index');
global.chai = require('chai');
global.chaiAsPromised = require("chai-as-promised");
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));
global.axios = require("axios");
global.bluebird = require("bluebird");
global.dev_server = {hostname: "localhost", port: 1337};

global.chai.should();
global.chai.use(chaiAsPromised);

global.expect = global.chai.expect;

beforeEach(function() {
  this.sandbox = global.sinon.sandbox.create();
  global.stub = this.sandbox.stub.bind(this.sandbox);
  global.spy  = this.sandbox.spy.bind(this.sandbox);
});

afterEach(function() {
  delete global.stub;
  delete global.spy;
  this.sandbox.restore();
});
