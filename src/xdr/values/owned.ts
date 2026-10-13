/** Constructor token for an input that nobody else holds, such as bytes or arrays that the decoder just made. A constructor that gets it stores the input without a copy. Internal: `src/xdr/index.ts` does not export it. */
export const OWNED: unique symbol = Symbol("xdr.owned");

/**
 * Copies caller bytes and keeps their class, so a `Buffer` stays a `Buffer`. The intrinsic `slice` always copies; `Buffer#slice` returns a view.
 *
 * Any other input stays as is, so encoding still rejects it. `new Uint8Array(undefined)` would silently make empty bytes.
 */
export function copyBytes(bytes: Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array
    ? Uint8Array.prototype.slice.call(bytes)
    : bytes;
}
