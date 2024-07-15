import axios from 'axios';
import fetchAdapter from 'konfig-axios-fetch-adapter';

// eslint-disable-next-line prefer-import/prefer-import-over-require
export const version = require('../../package.json').version;

export const AxiosClient = axios.create({
  adapter: fetchAdapter,
  headers: {
    'X-Client-Name': 'js-soroban-client',
    'X-Client-Version': version
  }
});

export default AxiosClient;
