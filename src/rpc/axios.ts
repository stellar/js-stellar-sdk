import axios from 'axios';
/* eslint-disable global-require */

// eslint-disable-next-line prefer-import/prefer-import-over-require
export const version = require('../../package.json').version;

export const AxiosClient = axios.create({
  headers: {
    'X-Client-Name': 'js-soroban-client',
    'X-Client-Version': version
  }
});

export default AxiosClient;
