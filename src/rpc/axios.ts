import axios from 'axios';

/* tslint:disable-next-line:no-var-requires */
export const {version} = require('../../package.json');

export const AxiosClient = axios.create({
  headers: {
    'X-Client-Name': 'js-soroban-client',
    'X-Client-Version': version
  }
});

export default AxiosClient;
