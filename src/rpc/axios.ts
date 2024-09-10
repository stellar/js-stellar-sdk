import { create, HttpClient } from "../http-client";

// eslint-disable-next-line prefer-import/prefer-import-over-require, global-require
export const version = require("../../package.json").version;

export const AxiosClient: HttpClient = create({
  headers: {
    'X-Client-Name': 'js-soroban-client',
    'X-Client-Version': version
  }
});

export default AxiosClient;