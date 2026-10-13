// An Array subclass whose species makes slice() and map() return `outside`.
export function withSpecies<T>(items: T[], outside: unknown[]): T[] {
  class Hijack extends Array<T> {}
  Object.defineProperty(Hijack, Symbol.species, {
    get: () =>
      function steal() {
        return outside;
      },
  });
  return Hijack.from(items);
}
