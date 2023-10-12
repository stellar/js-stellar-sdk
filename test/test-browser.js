/* eslint-disable no-undef */
chai.use(require("chai-as-promised"));
window.axios = StellarSdk.axios;
window.HorizonAxiosClient = StellarSdk.Horizon.AxiosClient;
window.SorobanAxiosClient = StellarSdk.Soroban.AxiosClient;
window.serverUrl = "https://horizon-live.stellar.org:1337/api/v1/jsonrpc";
