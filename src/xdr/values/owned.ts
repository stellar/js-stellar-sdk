/** Constructor token for an input that nobody else holds, such as bytes or arrays that the decoder just made. A constructor that gets it stores the input without a copy. Internal: `src/xdr/index.ts` does not export it. */
export const OWNED: unique symbol = Symbol("xdr.owned");

/**
 * Copies caller bytes into a plain `Uint8Array`, as decoded values are. Not the input's `slice`: `Buffer#slice` returns a view, and a subclass can point its species at a buffer it keeps.
 *
 * Any other input stays as is, so encoding still rejects it. `new Uint8Array(undefined)` would silently make empty bytes.
 */
export function copyBytes(bytes: Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array ? new Uint8Array(bytes) : bytes;
}

/**
 * Copies a caller array into a plain array by index, mapping each item when `map` is given. Not the input's `slice` or `map`: a subclass can override those or set a species that returns an array it keeps. Not `Array.from` in general: it runs the input's own or subclass iterator, which can yield other items than the array holds. With a map function, `Array.from` is also about 10 times slower than `map`. A Proxy or a patched `Array.prototype` is outside this guarantee: it controls every read.
 *
 * With `map`, a hole in a sparse array stays a hole, as with `Array.prototype.map`, so encoding rejects it. A mapper such as `nativeToScVal` would otherwise turn it into a value. Without `map`, a hole becomes `undefined`, which encoding also rejects.
 *
 * Any other input stays as is, so encoding still rejects it. `Array.from` would turn `5` or `{}` into an empty array.
 */
export function copyArray<T>(items: T[]): T[];
export function copyArray<T, U>(
  items: T[],
  map: (item: T, index: number) => U,
): U[];
export function copyArray<T, U>(
  items: T[],
  map?: (item: T, index: number) => U,
): T[] | U[] {
  if (!Array.isArray(items)) return items;
  const length = items.length;
  if (map === undefined) {
    // Array.from copies a plain array of 100 items about 2 times faster than the loop, and such an array can only use the built-in iterator.
    if (
      length > 8 &&
      Object.getPrototypeOf(items) === Array.prototype &&
      !Object.hasOwn(items, Symbol.iterator)
    ) {
      return Array.from(items);
    }
    const copy = new Array<T>(length);
    for (let i = 0; i < length; i++) copy[i] = items[i];
    return copy;
  }
  const out = new Array<U>(length);
  for (let i = 0; i < length; i++) if (i in items) out[i] = map(items[i], i);
  return out;
}
