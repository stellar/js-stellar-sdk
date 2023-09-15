/* eslint-disable no-undef */
chai.use(require("chai-as-promised"));
window.axios = StellarSdk.axios;
window.HorizonAxiosClient = StellarSdk.HorizonAxiosClient;
window.SorobanAxiosClient = StellarSdk.SorobanAxiosClient;
window.serverUrl = 'https://horizon-live.stellar.org:1337/api/v1/jsonrpc';
