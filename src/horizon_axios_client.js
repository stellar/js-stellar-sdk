let axios = require("axios");
let version = require('../package.json').version;

export default axios.create({
  headers: {
    'X-Client-Name': 'js-stellar-sdk',
    'X-Client-Version': version,
  }
});
