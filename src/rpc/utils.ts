/**
 * Type Guard function that checks if an object `obj` possesses the property `prop`.
 * * If the check passes, TypeScript narrows the type of `obj` to include the property,
 * allowing safe access to `obj[prop]` without type assertions.
 *
 * @template X The type of the object being checked.
 * @template Y The type of the property key being checked. Must extend PropertyKey (string, number, or symbol).
 * @param {X} obj - The object to inspect.
 * @param {Y} prop - The name of the property to look for.
 * @returns {obj is X & Record<Y, unknown>} True if the object has the property, narrowing the type.
 * @example
 * ```typescript
 * const config: { port?: number } = {};
 * if (hasOwnProperty(config, 'port')) {
 * // Inside this block, config.port is guaranteed to exist.
 * console.log(config.port); 
 * }
 * ```
 */
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  // Use Object.prototype.hasOwnProperty.call for maximum compatibility, 
  // preventing issues if the object shadows the hasOwnProperty method.
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
