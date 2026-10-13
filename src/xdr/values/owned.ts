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
 * Copies a caller array into a plain array, mapping each item when `map` is given. Not the input's `slice` or `map`: a subclass can override those or set a species that returns an array it keeps. The mapped form uses an index loop, because `Array.from(items, map)` is about 10 times slower than `map`.
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
  if (map === undefined) return Array.from(items);
  const length = items.length;
  const out = new Array<U>(length);
  for (let i = 0; i < length; i++) out[i] = map(items[i], i);
  return out;
}
