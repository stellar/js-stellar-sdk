# F914: fromJSON object-literal colliding key binds wrong outputType deserializer

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/913-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Confirmed in current source:

- `generateFromJSONMethod` (src/bindings/client.ts:115-123) emits each entry as
  `  ${name} : this.txFromJSON<${outputType}>` keyed by
  `sanitizeIdentifier(func.name())` (line 116).
- `generate` (client.ts:47-51, 68-70) joins these with `","` into a single
  object literal `public readonly fromJSON = { ... }`. Colliding sanitized keys
  therefore produce duplicate object-literal keys.
- `txFromJSON` (src/contract/client.ts:201-212) is the deserializer:
  `const { method, ...tx } = JSON.parse(json)` (line 202) reads the on-chain
  `method` from the *serialized JSON*, and parses results via
  `this.spec.funcResToNative(method, result)` (line 208) keyed on that embedded
  `method` — not on the fromJSON object key.

## Why It Failed

The claimed impact ("remote response decoded into a materially wrong return
value") does not occur at runtime:

1. The `<outputType>` in `this.txFromJSON<outputType>` is a TypeScript generic
   type argument. It is erased at compile time and has no runtime
   representation. At runtime `txFromJSON` ignores the type parameter entirely
   and decodes using the `method` embedded in the serialized JSON. So a stored
   transaction for the shadowed function is decoded correctly under its own
   method via `funcResToNative(method, result)`, regardless of which colliding
   fromJSON key was used to call it.

2. The `fromJSON` object literal exists only in *generated* code. The runtime
   `Client` (src/contract/client.ts) exposes no `fromJSON` object at all — only
   the `txFromJSON` method (lines 201-212). The runtime paths
   (`Client.from`/`fromWasm`/`fromWasmHash`) never build the colliding object
   literal, so they are unaffected.

The only residual effect is a compile-time type annotation that names the
surviving function's `outputType` for a colliding key while the runtime value is
correctly the embedded method's native result. That is a type-level-only
mismatch with correct runtime decoding — informational/low, which is below the
objective's Medium severity floor and out of scope. Additionally, duplicate
keys in the generated object literal are a likely TS diagnostic in the codegen
consumer path, which would surface rather than silently mis-decode.

## What This Rules Out

The fromJSON object-literal collision does not cause a materially wrong runtime
result decode: `txFromJSON` decodes via `funcResToNative(method, result)` keyed
on the JSON-embedded `method`, so the colliding `<outputType>` generic has no
runtime effect.

## What This Does Not Rule Out

- C1 (route_id js-sdk-764db1ecd1a0b26cd4288e42): the runtime `ContractClient`
  constructor last-wins method binding, which *does* cause a different on-chain
  function to be invoked, remains VIABLE (see R913).
- Whether the duplicate object-literal key surfaces a TS1117-style diagnostic in
  every consumer build configuration.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-764db1ecd1a0b26cd4288e42"
weakness = "code_generation"
record_kind = "single_path"
path = ["ClientGenerator.generate", "fromJSON object literal", "txFromJSON"]
sink = "txFromJSON deserializer typing"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/client.ts:generateFromJSONMethod", "src/bindings/client.ts:generate", "src/contract/client.ts:txFromJSON"]
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
negative_claim.rules_out_codes = ["fromjson_outputtype_is_compile_time_generic_only", "type_only_mismatch_below_medium_severity_floor"]
rules_out = ["the fromJSON <outputType> is a TypeScript generic erased at runtime; txFromJSON decodes using the method embedded in the serialized JSON via funcResToNative(method, result), so runtime result decoding is correct regardless of which colliding key was used", "the runtime Client exposes no fromJSON object literal (only txFromJSON), so the runtime Client.from/fromWasm paths are unaffected by the colliding key"]
does_not_rule_out = ["C1 runtime last-wins method binding (different on-chain function invoked) remains VIABLE", "whether the duplicate object-literal key surfaces a TS diagnostic in every consumer build config"]
assumptions = ["TypeScript generic type arguments carry no runtime representation", "txFromJSON reads method from the serialized JSON as shown in src/contract/client.ts:201-212"]
mechanism_brief = "fromJSON object literal keyed by sanitizeIdentifier collapses colliding function names to a last-wins key whose <outputType> generic names the surviving function; but the generic is type-only and txFromJSON decodes using the JSON-embedded method, so no runtime value is mis-decoded"
why_failed_brief = "runtime decode uses the JSON-embedded method (correct); the outputType collision is type-level only with no runtime effect, below the Medium severity floor"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/client.ts:txFromJSON"
guarantee = "txFromJSON decodes via funcResToNative(method, result) keyed on the JSON-embedded method, not on the colliding fromJSON object key"

[[blockers]]
kind = "type_erasure"
source = "src/bindings/client.ts:generateFromJSONMethod"
guarantee = "the colliding key only affects the compile-time generic <outputType>; the generic has no runtime representation so no runtime value is mis-decoded"
```
