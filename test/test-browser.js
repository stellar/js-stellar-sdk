/* eslint-disable no-undef */
chai.use(require('chai-as-promised'));
window.axios = StellarSdk.axios;
window.HorizonAxiosClient = StellarSdk.HorizonAxiosClient;