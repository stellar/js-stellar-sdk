# R902: Attacker UDT name shadows generator-emitted built-in type (type confusion)

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/901-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the identifier-sanitization and type-emission path in source:

- `sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) strips characters outside
  `[a-zA-Z0-9_$]` and appends `_` only for names in `isNameReserved`
  (`utils.ts:2-59`). That reserved set is JS keywords/literals only — it does
  **not** include `Buffer`, `Address`, `Result`, or `Error`, nor any other
  generator-emitted or imported symbol.
- `parseTypeFromTypeDef` (`utils.ts:101-202`) emits these bare built-in
  identifiers for primitive/SDK types: `Error` for `scSpecTypeError`
  (line 113), `Buffer` for `bytes`/`bytesN` (line 128), `string | Address` for
  address function inputs (line 137), `Result<...>` for result (line 193). UDT
  names are emitted as-is through `sanitizeIdentifier` (line 196).
- `TypeGenerator` interpolates the sanitized UDT name directly into top-level
  declarations: `export interface ${name}` (`src/bindings/types.ts:149`),
  `export type ${name}` (lines 176, 279), `export enum ${name}` (line 201),
  `export const ${name}` (line 225).
- Import emission: `visitTypeDef` (`utils.ts:246-301`) adds `Buffer` import for
  bytes (line 267, via `formatImports` line 377), `Address` import for address
  (line 262), `Result` import for result (line 275). Crucially, `scSpecTypeError`
  (line 282) returns with **no import** — `Error` is a JS global.

Silent type-confusion path (no compile error): a contract declares a UDT named
`Error` and any field of type `error`. `sanitizeIdentifier("Error")` returns
`"Error"` unchanged (not reserved). `TypeGenerator` emits
`export interface Error { ...attacker fields... }`, which shadows the JS global
`Error` with no import collision (none is emitted for `Error`). Any field the
contract declares as `error` then resolves via `parseTypeFromTypeDef` to the
local attacker-defined `Error` interface instead of the built-in. The file
still compiles, so the misrepresentation is silent.

For `Buffer`/`Address`/`Result`, a same-named UDT plus a corresponding
`bytes`/`address`/`result` field generally produces a duplicate-identifier
collision against the emitted import (a build break) rather than silent
confusion; this is the lesser variant noted in `does_not_rule_out`.

No prior memory record covers identifier collision / type-name shadowing
(prior [1] is the unrelated hash-shape decode; [2]-[4] concern RPC response
parsing/simulation fees). Novel.

## Findings

`sanitizeIdentifier` is the documented primary defense for attacker-controlled
spec names, but it guards only against character-level injection and JS
keywords. It does not reserve the very identifiers the generator itself emits.
An attacker-controlled spec (from a malicious contract or substituted RPC
response, cf. C1) can therefore make a generated type field silently bind to an
attacker-defined struct shape instead of the intended SDK/built-in type — the
`Error` case being the cleanest silent instance.

Impact: contract binding type confusion — the generated TypeScript interface
misrepresents the contract's true field types to the consuming developer
(wrong IDE/compile-time shape). The runtime `Spec` (embedded base64) remains
authoritative for actual encode/decode, so this does not by itself cause wrong
argument encoding or code execution. Severity held at Medium (type confusion /
interface misrepresentation), consistent with the "contract binding type
confusion" Medium criterion.

## PoC Guidance

- **Test file**: focused Vitest test under `test/unit` alongside existing
  `TypeGenerator` tests.
- **Setup**: build a `Spec` with two entries — a UDT struct named `Error` with
  arbitrary attacker fields, and another struct with a field typed
  `scSpecTypeError`.
- **Steps**: call `new TypeGenerator(spec).generate()`.
- **Assertion**: the output contains `export interface Error {` AND a field
  typed as `Error`, demonstrating the field now references the attacker UDT
  rather than the global `Error`; assert no `import` for `Error` is emitted, so
  there is no collision and the file would compile. (Optionally assert the
  `Buffer`/`Address`/`Result` variants produce duplicate-identifier output to
  document the build-break variant.)

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-0283c3cad484b8dcb342fe0f"
weakness = "identifier_collision_type_confusion"
record_kind = "single_path"
path = ["getRemoteWasmFromHash", "TypeGenerator.generate"]
sink = "TypeGenerator.generate"
sink_role = "code_generation"
impact_class = "type_confusion"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/utils.ts:sanitizeIdentifier", "src/bindings/types.ts:generateStruct", "src/bindings/utils.ts:parseTypeFromTypeDef"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms isNameReserved reserves only JS keywords and emits no import for Error, so a UDT named Error silently shadows the global and rebinds error-typed fields with no compile error or sanitizer block"]
does_not_rule_out = ["Buffer/Address/Result same-name collisions that surface as duplicate-identifier build breaks rather than silent confusion", "downstream runtime decode confusion (Spec base64 remains authoritative)"]
assumptions = ["attacker controls spec UDT names and field types via malicious contract or substituted RPC response", "caller runs TypeGenerator.generate and builds the emitted package"]
mechanism_brief = "sanitizeIdentifier reserves only JS keywords; a UDT named Error (no import emitted for Error) shadows the built-in the generator emits for error-typed fields, silently rebinding the field type"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier strips non-identifier chars and appends _ for JS keywords only; it does not reserve generator-emitted built-in/imported type names (Buffer/Address/Result/Error)"

[[blockers]]
kind = "not_found"
source = "src/bindings/types.ts:generateStruct"
guarantee = "no source-proven guard prevents a UDT name from colliding with or shadowing Buffer/Address/Result/Error in the emitted file; Error emits no import so the shadow is silent"
```
