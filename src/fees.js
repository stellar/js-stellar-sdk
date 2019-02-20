/**
 * @module
 * A library of functions, each of which employs a different weighing of trade-offs
 * in suggesting a transaction fee.
 *
 * All functions should return a promise that resolves to a number of stroops.
 */

/**
 * Fetch the bare minimum fee.
 * @returns {Promise<number>} Minimum fee in stroops.
 */
export function fetchBaseFee() {
  return Promise.resolve(100);
}
