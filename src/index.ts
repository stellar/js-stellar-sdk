// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

// Expose all types
export * from "./errors";
export { Config } from "./config";
export { Utils } from "./utils";

// TOML (SEP-1), Federation (SEP-2), and WebAuth (SEP-10) helpers to expose
export * as StellarToml from "./stellartoml";
export * as Federation from "./federation";
export * as WebAuth from "./webauth";

export * as Friendbot from "./friendbot";

// Horizon-related classes to expose
export * as Horizon from "./horizon";

/**
 * Tools for interacting with the Soroban RPC server, such as `Server`,
 * `assembleTransaction`, and the `Api` types. You can import these from the
 * `/rpc` entrypoint, if your version of Node and your TypeScript configuration
 * allow it:
 * @example
 * import { Server } from '@stellar/stellar-sdk/rpc';
 */
export * as rpc from "./rpc";

/**
 * Tools for interacting with smart contracts, such as `Client`, `Spec`, and
 * `AssembledTransaction`. You can import these from the `/contract`
 * entrypoint, if your version of Node and your TypeScript configuration allow
 * it:
 * @example
 * import { Client } from '@stellar/stellar-sdk/contract';
 */
export * as contract from "./contract";
export { BindingGenerator } from "./bindings";
// expose classes and functions from stellar-base
export * from "@stellar/stellar-base";

// Re-export key functions with JSDoc for better IDE support.
// These explicit exports shadow the wildcard export above, allowing us to add
// comprehensive JSDoc documentation that doesn't exist in stellar-base's .d.ts files.
import {
  nativeToScVal as _nativeToScVal,
  scValToNative as _scValToNative,
  scValToBigInt as _scValToBigInt,
  xdr,
} from "@stellar/stellar-base";

/**
 * Attempts to convert native JavaScript types into smart contract values
 * ({@link xdr.ScVal}).
 *
 * This function converts JavaScript values to their XDR ScVal equivalents
 * for use with Soroban smart contracts. It performs a best-effort conversion
 * based on the input type and optional type hints.
 *
 * @param {any} val - a native (or convertible) JavaScript value you'd like to
 *    convert into a smart contract value (xdr.ScVal)
 * @param {object} [opts={}] - an object with a single `type` field that can
 *    customize certain aspects of type conversion
 * @param {string} [opts.type] - there is different behavior for different input
 *    types for `val`:
 *
 *     - when `val` is an integer-like type (i.e. number|bigint), this will be
 *       forwarded to `ScInt` or forced to be u32/i32.
 *
 *     - when `val` is an array type, this is forwarded to the recursion
 *
 *     - when `val` is an object type (key-value entries), this should be an
 *       object in which each key has a pair of types (to represent forced types
 *       for the key and the value), where `null` (or a missing entry) indicates
 *       the default interpretation(s) (refer to the examples, below)
 *
 *     - when `val` is a string type, this can be 'string' or 'symbol' to force
 *       a particular interpretation of `val`.
 *
 *     - when `val` is a bytes-like type, this can be 'string', 'symbol', or
 *       'bytes' to force a particular interpretation
 *
 *    As a simple example, `nativeToScVal("hello", {type: 'symbol'})` will
 *    return an `scvSymbol`, whereas without the type it would have been an
 *    `scvString`.
 *
 * @returns {xdr.ScVal} a wrapped, smart, XDR version of the input value
 * @throws {TypeError} if...
 *  - there are arrays with more than one type in them
 *  - there are values that do not have a sensible conversion (e.g. random XDR
 *    types, custom classes)
 *  - the type of the input object (or some inner value of said object) cannot
 *    be determined (via `typeof`)
 *  - the type you specified (via `opts.type`) is incompatible with the value
 *    you passed in (`val`), e.g. `nativeToScVal("a string", { type: 'i128' })`,
 *    though this does not apply for types that ignore `opts` (e.g. addresses).
 * @see scValToNative
 *
 * @example
 * nativeToScVal(1000);                   // gives ScValType === scvU64
 * nativeToScVal(1000n);                  // gives ScValType === scvU64
 * nativeToScVal(1n << 100n);             // gives ScValType === scvU128
 * nativeToScVal(1000, { type: 'u32' });  // gives ScValType === scvU32
 * nativeToScVal(1000, { type: 'i256' }); // gives ScValType === scvI256
 * nativeToScVal("a string");                     // gives ScValType === scvString
 * nativeToScVal("a string", { type: 'symbol' }); // gives scvSymbol
 * nativeToScVal(new Uint8Array(5));                      // scvBytes
 * nativeToScVal(new Uint8Array(5), { type: 'symbol' });  // scvSymbol
 * nativeToScVal(null); // scvVoid
 * nativeToScVal(true); // scvBool
 * nativeToScVal([1, 2, 3]);                    // gives scvVec with each element as scvU64
 * nativeToScVal([1, 2, 3], { type: 'i128' });  // scvVec<scvI128>
 * nativeToScVal([1, '2'], { type: ['i128', 'symbol'] });  // scvVec with diff types
 * nativeToScVal([1, '2', 3], { type: ['i128', 'symbol'] });
 *    // scvVec with diff types, using the default when omitted
 * nativeToScVal({ 'hello': 1, 'world': [ true, false ] }, {
 *   type: {
 *     'hello': [ 'symbol', 'i128' ],
 *   }
 * })
 * // gives scvMap with entries: [
 * //     [ scvSymbol, scvI128 ],
 * //     [ scvString, scvArray<scvBool> ]
 * // ]
 *
 * @example
 * import {
 *   nativeToScVal,
 *   scValToNative,
 *   ScInt,
 *   xdr
 * } from '@stellar/stellar-sdk';
 *
 * let gigaMap = {
 *   bool: true,
 *   void: null,
 *   u32: xdr.ScVal.scvU32(1),
 *   i32: xdr.ScVal.scvI32(1),
 *   u64: 1n,
 *   i64: -1n,
 *   u128: new ScInt(1).toU128(),
 *   i128: new ScInt(1).toI128(),
 *   u256: new ScInt(1).toU256(),
 *   i256: new ScInt(1).toI256(),
 *   map: {
 *     arbitrary: 1n,
 *     nested: 'values',
 *     etc: false
 *   },
 *   vec: ['same', 'type', 'list'],
 * };
 *
 * // then, simply:
 * let scv = nativeToScVal(gigaMap);    // scv.switch() == xdr.ScValType.scvMap()
 *
 * // then...
 * someContract.call("method", scv);
 *
 * // Similarly, the inverse should work:
 * scValToNative(scv) == gigaMap;       // true
 */
export const nativeToScVal = _nativeToScVal;

/**
 * Converts a smart contract value ({@link xdr.ScVal}) to a native JavaScript type.
 *
 * This is a best-effort conversion based on the ScVal type. Complex types like
 * maps and vectors are recursively converted. You should verify the type of the
 * returned value or use TypeScript for type safety.
 *
 * @param {xdr.ScVal} scv - the XDR ScVal to convert to a native type
 * @returns {any} the best JavaScript-native conversion of the XDR value
 * @throws {TypeError} if the XDR has an unexpected or invalid type
 * @see nativeToScVal
 *
 * @example
 * import { nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
 *
 * const scVal = nativeToScVal(1234n);
 * const native = scValToNative(scVal); // returns 1234n
 */
export const scValToNative = _scValToNative;

/**
 * Converts a smart contract value ({@link xdr.ScVal}) to a BigInt.
 *
 * This function specifically extracts integer values from ScVal types and converts
 * them to JavaScript BigInt. Works with various integer ScVal types including
 * i32, i64, i128, i256, u32, u64, u128, and u256.
 *
 * @param {xdr.ScVal} scv - the XDR ScVal containing an integer value
 * @returns {bigint} the integer value as a JavaScript BigInt
 * @throws {TypeError} if the ScVal is not an integer type
 *
 * @example
 * import { nativeToScVal, scValToBigInt } from '@stellar/stellar-sdk';
 *
 * const scVal = nativeToScVal(123456789n);
 * const value = scValToBigInt(scVal); // returns 123456789n
 */
export const scValToBigInt = _scValToBigInt;

export default module.exports;

if (typeof (global as any).__USE_AXIOS__ === "undefined") {
  (global as any).__USE_AXIOS__ = true;
}

if (typeof (global as any).__USE_EVENTSOURCE__ === "undefined") {
  (global as any).__USE_EVENTSOURCE__ = false;
}
