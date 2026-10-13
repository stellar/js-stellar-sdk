/** Constructor token for an input that nobody else holds, such as bytes or arrays that the decoder just made. A constructor that gets it stores the input without a copy. Internal: `src/xdr/index.ts` does not export it. */
export const OWNED: unique symbol = Symbol("xdr.owned");

/**
 * Copies caller bytes and keeps their class, so a `Buffer` stays a `Buffer`. Not the input's `slice`: `Buffer#slice` returns a view, and the intrinsic `slice` builds its result through the input's species, which a subclass can point at a buffer it keeps.
 *
 * Any other input stays as is, so encoding still rejects it. `new Uint8Array(undefined)` would silently make empty bytes.
 */
export function copyBytes(bytes: Uint8Array): Uint8Array {
  if (!(bytes instanceof Uint8Array)) return bytes;
  const copy = new Uint8Array(bytes);
  const proto: object | null = Object.getPrototypeOf(bytes);
  if (proto !== Uint8Array.prototype) Object.setPrototypeOf(copy, proto);
  return copy;
}

/**
 * Copies a caller array into a plain array, mapping each item when `map` is given. `Array.from`, not the input's `slice` or `map`: a subclass can override those or set a species that returns an array it keeps.
 *
 * Any other input stays as is, so encoding still rejects it. `Array.from` would turn `5` or `{}` into an empty array.
 */
export function copyArray<T>(items: T[]): T[];
export function copyArray<T, U>(items: T[], map: (item: T) => U): U[];
export function copyArray<T, U>(items: T[], map?: (item: T) => U): T[] | U[] {
  if (!Array.isArray(items)) return items;
  return map === undefined ? Array.from(items) : Array.from(items, map);
}
