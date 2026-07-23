import { expect } from "vitest";

/**
 * Assert that an XDR union-class value has the expected `type` discriminant,
 * and return the same value narrowed to that variant. Use in tests to access
 * variant-specific fields (e.g. `.value`) without manual `instanceof` checks
 * or casts.
 *
 *     // OperationBody is a class union:
 *     //   OperationBodyPayment | OperationBodyCreateAccount | ...
 *     const body = expectVariant(tx.operations[0].body, "payment");
 *     //    ^? OperationBodyPayment — `.value` is typed as PaymentOp
 *     expect(body.value.amount).toBe(1000n);
 *
 *     // SCVal works the same way:
 *     const v = expectVariant(scval, "scvU32");
 *     //    ^? SCValU32 — `.value` typed as number
 *     expect(v.value).toBe(42);
 */
export function expectVariant<
  U extends { readonly type: string },
  K extends U["type"],
>(value: U, type: K): Extract<U, { readonly type: K }> {
  expect(value.type).toBe(type);
  if (value.type !== type) {
    // Defensive: vitest's `expect` already throws on mismatch, but be explicit
    // so the type predicate below is sound even if `expect` is mocked.
    throw new Error(
      `Expected XDR variant '${type}', got '${value.type}'` +
        ` (${value.constructor.name})`,
    );
  }
  return value as Extract<U, { readonly type: K }>;
}
