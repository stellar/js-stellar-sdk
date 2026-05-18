# Legacy XDR fixtures

These are the `@stellar/js-xdr`-backed generated XDR classes as they existed
at master (commit `6ba32bc5^`), copied here verbatim. They are **not** shipped
as part of the library — `src/` does not import from this directory.

## Role

Source of truth for byte-compatibility testing. Round-trip tests in
`test/unit/base/xdr/` use this layer as an oracle: encode the same logical
value through both the new class-based runtime (`src/xdr/`) and this legacy
layer, then assert byte equality. If the bytes diverge, the new layer has a
bug.

## Files

- `curr_generated.{js,d.ts}` — generated XDR primitives for the curr
  protocol, depend on `@stellar/js-xdr` (still in `dependencies`).
- `curr.d.ts` — high-level type wrapper around `curr_generated`.
- `next_*` — same, for the next protocol.

The only edit from master is fixing the `OperationRecord` import path in
`curr.d.ts` / `next.d.ts` (was `../operations/types.js`, now points at
`src/base/operations/types.js` via three-levels-up).

## When to delete

Once the class-based runtime has been in production for a couple releases
and we're confident in byte-for-byte equivalence, this directory can be
removed. The round-trip tests stay relevant via the new-XDR side; the
legacy oracle is a transitional confidence-builder.
