/**
 * Assert that an XDR union value has the expected `type` discriminant, and if so narrow the type of the value to that variant.
 * @param value the XDR union value to check
 * @param type the expected type discriminant
 * @throws {TypeError} if `value.type !== type`
 * @returns the same value, but with its type narrowed to the expected variant
 */
export function expectUnionVarient<
  U extends { readonly type: string },
  K extends U["type"],
>(value: U, type: K): Extract<U, { readonly type: K }> {
  if (value.type !== type) {
    // Defensive: vitest's `expect` already throws on mismatch, but be explicit
    // so the type predicate below is sound even if `expect` is mocked.
    throw new TypeError(
      `Expected XDR variant '${type}', got '${value.type}'` +
        ` (${value.constructor.name})`,
    );
  }
  return value as Extract<U, { readonly type: K }>;
}

/**
 * Check if an XDR union value has a given `type` discriminant, and if so narrow
 * @param value the XDR union value to check
 * @param type the expected type discriminant
 * @returns `true` if `value.type === type`, and narrows the type of `value` to that variant; otherwise `false`
 */
export function isUnionVarient<
  U extends { readonly type: string },
  K extends U["type"],
>(value: U, type: K): value is Extract<U, { readonly type: K }> {
  return value.type === type;
}
