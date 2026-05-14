/**
 * Narrows a discriminated-union value to a specific arm by its `type` tag,
 * throwing a `TypeError` if the tag doesn't match.
 *
 * Works on any object shape with a string `type` discriminator — primarily the
 * generated DX-layer XDR types (`xdr.ScVal`, `xdr.LedgerEntryData`, etc.) but
 * also any user-authored discriminated union following the same convention.
 *
 * @example
 * const cd = expectUnionArm(ledgerEntry, "contractData").contractData;
 * const u32 = expectUnionArm(scv, "scvU32").u32;
 */
export function expectUnionArm<T extends { type: string }, K extends T["type"]>(
  value: T,
  tag: K,
): Extract<T, { type: K }> {
  if (value.type !== tag) {
    throw new TypeError(`Expected union arm ${tag}, got ${value.type}`);
  }
  return value as Extract<T, { type: K }>;
}

/**
 * Non-throwing variant of {@link expectUnionArm}: returns the narrowed value if
 * the tag matches, otherwise `null`. Use when the caller's contract is "skip
 * malformed entries" rather than "treat wrong-arm as a bug."
 */
export function tryArm<T extends { type: string }, K extends T["type"]>(
  value: T,
  tag: K,
): Extract<T, { type: K }> | null {
  return value.type === tag ? (value as Extract<T, { type: K }>) : null;
}

/**
 * Type-guard variant of {@link expectUnionArm}: predicate form for use in
 * `if`/`switch` flow where the narrowed type should flow through control-flow
 * analysis rather than be returned.
 *
 * @example
 * if (isArm(scAddress, "scAddressTypeAccount")) {
 *   // scAddress.accountId is typed here
 * }
 */
export function isArm<T extends { type: string }, K extends T["type"]>(
  value: T,
  tag: K,
): value is Extract<T, { type: K }> {
  return value.type === tag;
}
