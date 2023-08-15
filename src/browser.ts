/* tslint:disable:no-var-requires */

export * from './index';
export * as StellarBase from 'stellar-base';
export * as SorobanClient from './soroban';

import axios from 'axios'; // idk why axios is weird
export { axios };

export default module.exports;
