import axios from 'axios';
import { version } from '../package.json';

export default axios.create({
  headers: {
    'X-Client-Name': 'js-stellar-sdk',
    'X-Client-Version': version
  }
});
