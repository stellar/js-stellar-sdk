/* eslint-disable no-undef */
chai.use(require('chai-as-promised'));
window.SorobanClient = StellarSdk.SorobanClient;
window.axios = StellarSdk.axios;
window.AxiosClient = StellarSdk.AxiosClient;

global.serverUrl = 'https://horizon-live.stellar.org:1337/api/v1/jsonrpc';