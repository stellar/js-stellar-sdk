// Compile-time regression test for PR #1701: `HorizonApi.Predicate` must stay
// an `interface`, not become an alias of `HorizonPredicateJson`. Only an
// interface accepts declaration merging, so a type alias silently breaks every
// consumer that augments the namespace to describe a field Horizon added ahead
// of the SDK — with `TS2300: Duplicate identifier 'Predicate'`, raised inside
// the SDK's own source rather than at the consumer's augmentation. This file
// only has to typecheck; it never runs.

import type { HorizonApi } from "../../src/horizon/horizon_api.js";

declare module "../../src/horizon/horizon_api.js" {
  namespace HorizonApi {
    interface Predicate {
      abs_after?: string;
    }
  }
}

// The augmented field and the shared shape's own fields must both be visible.
export const augmented: HorizonApi.Predicate = {
  abs_after: "2026-09-03T13:49:59Z",
  abs_before: "2026-09-03T13:49:59Z",
  abs_before_epoch: "1788443399",
};

export const unconditional: HorizonApi.Predicate = { unconditional: true };

// Augmentation must reach the recursive positions too. `and`, `or` and `not`
// are redeclared as `Predicate` for exactly this reason: inherited as
// `HorizonPredicateJson`, a nested augmented field fails excess-property
// checking (TS2353) even though the root works.
export const nested: HorizonApi.Predicate = {
  not: { abs_after: "2026-09-03T13:49:59Z" },
};

export const inAnd: HorizonApi.Predicate = {
  and: [{ abs_after: "2026-09-03T13:49:59Z" }, { unconditional: true }],
};

export const inOr: HorizonApi.Predicate = {
  or: [{ not: { abs_after: "2026-09-03T13:49:59Z" } }, { unconditional: true }],
};
