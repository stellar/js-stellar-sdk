/* eslint-disable no-undef */
chai.use(require("chai-as-promised"));
window.axios = StellarSdk.axios;
window.Horizon.AxiosClient = StellarSdk.Horizon.AxiosClient;
window.AxiosClient = StellarSdk.AxiosClient;
window.serverUrl = "https://horizon-live.stellar.org:1337/api/v1/jsonrpc";
