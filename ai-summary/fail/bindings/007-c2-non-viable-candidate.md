# F007C2: Unbounded recursion in parseTypeFromTypeDef via nested spec type

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/007-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The recursion in the type printer is real:

- `src/bindings/utils.ts:142-148` — `scSpecTypeVec` recurses into
  `parseTypeFromTypeDef(typeDef.vec().elementType(), ...)` with no depth counter.
- `src/bindings/utils.ts:149-158` — `scSpecTypeMap` recurses on key and value.
- `src/bindings/utils.ts:160-194` — `scSpecTypeTuple`/`scSpecTypeResult` also
  recurse with no depth guard.

However, the recursive printer can only run on a `ScSpecTypeDef` that has
**already been XDR-decoded**, and that decode is depth-capped first:

- `src/bindings/generator.ts:126` — `new Spec(specFromWasm(wasmBuffer))`.
- `src/contract/spec.ts:520-522` — the `Spec` constructor, given a Buffer, calls
  `processSpecEntryStream(entries)`.
- `src/contract/utils.ts:181-189` — `processSpecEntryStream` does
  `xdr.ScSpecEntry.read(reader)` with **no explicit depth argument**.
- `@stellar/js-xdr@4.0.0` `src/union.js:68`, `src/struct.js:15`, `src/array.js:14`,
  `src/var-array.js:19`, `src/option.js:13` — every `read` defaults
  `remainingDepth = this._maxDepth`, and `src/xdr-type.js:149,173-174` set
  `DEFAULT_MAX_DEPTH = 200`. Each nested read recurses with `remainingDepth - 1`
  and calls `NestedXdrType.checkDepth`, which throws
  `XdrReaderError('exceeded max decoding depth')` once the budget goes negative
  (`src/xdr-type.js:159-171`).

`ScSpecTypeDef` is a generated XDR union and `ScSpecTypeVec`/`ScSpecTypeMap` are
generated structs, so each nesting level consumes the depth budget. A
`Vec<Vec<...>>`/`Map<...>` nested beyond ~100-200 levels therefore throws a
**catchable** `XdrReaderError` inside `processSpecEntryStream` during
`new Spec(...)` — before `parseTypeFromTypeDef` is ever invoked (the printer runs
later, during `generate()`).

## Why It Failed

The stack-overflow precondition (a `ScSpecTypeDef` nested deep enough to exhaust
the JS call stack, which needs thousands of levels) is unreachable: js-xdr 4.0.0
caps decode recursion at `DEFAULT_MAX_DEPTH = 200` on the default `read` path
used by `processSpecEntryStream`, and throws a catchable error long before the
spec object exists. `parseTypeFromTypeDef` can only receive a type def at most
~200 levels deep, which does not overflow the V8 stack (default limit is in the
~10k-frame range). The missing depth guard in the printer is therefore not
independently exploitable for a DoS on this route.

This is the same depth-cap mechanism recorded in prior [4] (ScVal nesting via
`fromXDR`, capped at 200), applied here to the sibling `ScSpecEntry`/
`ScSpecTypeDef` decode route, which uses the manual `cereal.XdrReader` but still
inherits the same default `maxDepth` because `read` defaults
`remainingDepth = this._maxDepth`.

## What This Rules Out

Deep-nesting recursion / stack-overflow DoS via `parseTypeFromTypeDef` on the
`fromWasm -> new Spec -> processSpecEntryStream -> ScSpecEntry.read` route: the
XDR decode of a deeply nested `ScSpecTypeDef` throws a catchable
`XdrReaderError('exceeded max decoding depth')` at ~200 levels, before any type
printer recursion, so the call stack is never exhausted.

## What This Does Not Rule Out

- A `RangeError`/throw from `parseTypeFromTypeDef` is impossible only because the
  decode caps first; if a future change bypasses the depth-capped `read` (e.g.
  passing `Infinity`/`undefined` depth, or a non-default reader), the missing
  guard in the printer would become reachable again.
- Resource/throughput costs from a wide-but-shallow spec (many sibling entries
  rather than deep nesting) are not assessed here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-45bef61cba5cce008f254c75"
weakness = "unbounded recursion / nesting depth"
record_kind = "single_path"
path = ["fetchFromWasmHash", "processSpecEntryStream", "ScSpecEntry.read"]
sink = "parseTypeFromTypeDef"
sink_role = "type_printer_recursion"
impact_class = "resource_exhaustion"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["src/bindings/utils.ts:parseTypeFromTypeDef", "src/contract/utils.ts:processSpecEntryStream"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["xdr_decode_depth_capped_at_200_before_type_printer", "recursion_depth_bounded_catchable_throw"]
rules_out = ["deeply nested ScSpecTypeDef cannot reach parseTypeFromTypeDef: ScSpecEntry.read in processSpecEntryStream decodes with js-xdr DEFAULT_MAX_DEPTH=200 and throws a catchable XdrReaderError at ~200 levels, before the spec object or any type-printer recursion exists"]
does_not_rule_out = ["printer recursion would become reachable if a future change decodes with bypassed/Infinity depth or a non-default reader", "wide shallow specs as a throughput cost are not assessed"]
assumptions = ["ScSpecTypeDef is a generated js-xdr Union and ScSpecTypeVec/Map are generated structs that consume the depth budget per nesting level", "V8 default stack tolerates the <=200-deep recursion the cap permits"]
mechanism_brief = "parseTypeFromTypeDef recurses on nested vec/map/tuple/result type defs with no depth guard, but it only runs after XDR decode; processSpecEntryStream's ScSpecEntry.read uses js-xdr 4.0.0 default maxDepth=200, throwing a catchable XdrReaderError on deep nesting before the printer is reached."
why_failed_brief = "XDR decode depth cap (DEFAULT_MAX_DEPTH=200) throws a catchable error during new Spec() before parseTypeFromTypeDef runs, so deep nesting cannot overflow the call stack on this route."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "@stellar/js-xdr@4.0.0:xdr-type.js:checkDepth"
guarantee = "NestedXdrType.checkDepth throws XdrReaderError('exceeded max decoding depth') when remainingDepth<0; read methods default remainingDepth=this._maxDepth (DEFAULT_MAX_DEPTH=200), so ScSpecEntry.read caps nested ScSpecTypeDef decode at ~200 levels"

[[blockers]]
kind = "depth_cap"
source = "src/contract/utils.ts:processSpecEntryStream"
guarantee = "ScSpecEntry.read(reader) decodes with the default 200-level depth budget and throws a catchable error before the spec is built, so parseTypeFromTypeDef never receives a type def deep enough to overflow the stack"
```
