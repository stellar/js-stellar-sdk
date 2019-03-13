import axios from 'axios';
import URI from 'urijs';

import { version } from '../package.json';

// keep a local map of server times
// (export this purely for testing purposes)
export const SERVER_TIME_MAP = {
  /* each entry will map the server domain to the last-known time and the local 
  time it was recorded
  ex:

  "horizon-testnet.stellar.org": {
    serverTime: 1552513039,
    localTimeRecorded: 1552513052
  }
  */
};

const HorizonAxiosClient = axios.create({
  headers: {
    'X-Client-Name': 'js-stellar-sdk',
    'X-Client-Version': version
  }
});

function _toSeconds(ms) {
  return Math.floor(ms / 1000);
}

HorizonAxiosClient.interceptors.response.use((response) => {
  const hostname = URI(response.config.url).hostname();
  const serverTime = _toSeconds(Date.parse(response.headers.Date));
  const localTimeRecorded = _toSeconds(new Date().getTime());

  SERVER_TIME_MAP[hostname] = {
    serverTime,
    localTimeRecorded
  };

  // if (!isNaN(serverTime))
  // SERVER_TIME_MAP[]

  return response;
});

export default HorizonAxiosClient;

/**
 * Given a hostname, get the current time of that server (i.e., use the last-
 * recorded server time and offset it by the time since then.) If there IS no
 * recorded server time, then return null.
 * @param {string} hostname Hostname of a Horizon server.
 * @returns {number} The UNIX timestamp (in seconds, not milliseconds)
 * representing the current time on that server, or `null` if we don't have
 * a record of that time.
 */
export function getCurrentServerTime(hostname) {
  const { serverTime, localTimeRecorded } = SERVER_TIME_MAP[hostname] || {};

  if (
    serverTime === undefined ||
    localTimeRecorded === undefined ||
    serverTime === null ||
    localTimeRecorded === null
  ) {
    return null;
  }

  const currentTime = _toSeconds(new Date().getTime());
  return currentTime - localTimeRecorded + serverTime;
}
