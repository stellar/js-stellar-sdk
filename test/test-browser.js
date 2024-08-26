/* eslint-disable no-undef */
chai.use(require("chai-as-promised"));
window.axios = StellarSdk.httpClient;
window.HorizonAxiosClient = StellarSdk.Horizon.HorizonHttpClient;
window.SorobanAxiosClient = StellarSdk.Soroban.RpcHttpClient;
window.serverUrl = "https://horizon-live.stellar.org:1337/api/v1/jsonrpc";
