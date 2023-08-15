/* eslint-disable no-undef */

require("@babel/register");
global.StellarSdk = require("../lib/");
global.SorobanClient = global.StellarSdk.SorobanClient;

global.axios = require("axios");
global.HorizonAxiosClient = StellarSdk.HorizonAxiosClient;
global.AxiosClient = global.SorobanClient.AxiosClient;
global.serverUrl = "https://horizon-live.stellar.org:1337/api/v1/jsonrpc";

var chaiAsPromised = require("chai-as-promised");
var chaiHttp = require("chai-http");
global.chai = require("chai");
global.chai.should();
global.chai.use(chaiAsPromised);
global.chai.use(chaiHttp);
global.expect = global.chai.expect;

global.sinon = require("sinon");
