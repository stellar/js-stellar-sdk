# R903: Generated UDT names can collide with generator-emitted built-in types (Buffer/Address/Result/Error)

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/901-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced identifier handling in current source:

- `sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) strips non-identifier
  characters and, via `isNameReserved` (`utils.ts:2-59`), only reserves
  **JavaScript keywords**. It does not reserve the type-level symbols the
  generator itself emits: `Buffer`, `Address`, `Result`, `Error`.
- `parseTypeFromTypeDef` (`utils.ts:101-202`) emits those bare symbols for
  contract field types: `"Error"` for `scSpecTypeError` (line 113), `"Buffer"`
  for `bytes`/`bytesN` (line 128), `"Result<...>"` for result types (line
  184-193), and resolves UDT references through `sanitizeIdentifier`
  (line 195-197).
- UDT names are interpolated directly into top-level declarations in
  `types.ts`: `export interface ${name}` (`types.ts:149`), `export type
  ${name}` (`types.ts:176, 279`), `export enum ${name}` (`types.ts:201`),
  `export const ${name}` (`types.ts:225`), each with only `sanitizeIdentifier`
  applied.
- Imports are emitted by `formatImports` (`utils.ts:337-381`):
  `import { Buffer } from 'buffer'` (line 377), `Address` from
  `@stellar/stellar-sdk` (visitTypeDef `utils.ts:260-262`), `Result` from
  `@stellar/stellar-sdk/contract` (visitTypeDef `utils.ts:274-276`); UDT names go
  into `typeFileImports` (`utils.ts:254-257`).

Because `sanitizeIdentifier` does not reserve these names, an attacker-named UDT
can redeclare/shadow a symbol the generator relies on in the same emitted module.

## Findings

Two source-confirmed effects, both deviations from the expected behavior that
"generated type identifiers should not collide with the built-in/imported type
names the generator itself emits":

1. **Silent type confusion (no build error).** `scSpecTypeError` emits the bare
   global `Error` (`utils.ts:113`) with no import. A UDT named `Error` produces
   `export interface Error {...}` in the same `types.ts`. A struct field typed
   `error` then resolves to the attacker's interface instead of the global
   `Error`, silently misrepresenting that field's shape. This is contract
   binding type confusion (an explicit Medium category in the severity scale).

2. **Duplicate-identifier collisions → binding/build failure.** A UDT named
   `Buffer` produces `export interface Buffer` while a `bytes` field forces
   `import { Buffer } from 'buffer'` (`utils.ts:376-377`) — TypeScript then fails
   with a duplicate-identifier error. The same occurs for `Address` and `Result`
   when the UDT is referenced and pulled into `typeFileImports` alongside the
   SDK import. This breaks generation/build of the package.

Novelty: route_id js-sdk-0283c3cad484b8dcb342fe0f prior records only cover the
hash-shape (record [1]) and unrelated XDR/RPC paths ([2]-[4]); none touch
identifier collision in the generator, so this is not a duplicate or subsumed.

Severity Medium: the runtime `Spec` embedded as base64 remains authoritative for
actual encoding/decoding, so there is no direct runtime fund movement; impact is
generated-interface misrepresentation and developer-facing type confusion plus a
bounded build DoS — squarely "contract binding type confusion" (Medium). Not
High because the attacker cannot make the generated client *execute* code (the
escape/sanitization defenses for code injection hold) and runtime encoding is
unaffected.

## PoC Guidance

- **Test file**: add a focused Vitest under `test/unit/bindings/` exercising
  `TypeGenerator.generate` directly.
- **Setup**: build a `Spec` with (a) a struct UDT named `Error` plus another
  struct with a field of type `scSpecTypeError`, and (b) a UDT named `Buffer`
  plus a struct with a `bytes` field.
- **Steps**: call `new TypeGenerator(spec).generate()`.
- **Assertion (silent confusion)**: the emitted source contains both
  `export interface Error` and a field typed `Error`, demonstrating the field
  now references the attacker UDT (assert both substrings co-occur in one
  module).
- **Assertion (build break)**: the emitted source contains both
  `import { Buffer } from 'buffer'` and `export interface Buffer`, which is a
  TypeScript duplicate-identifier error; optionally run `yarn build:node` or
  `tsc --noEmit` on the generated file to show it fails to compile.

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
rules_out = ["source trace of utils.ts:2-59 confirms isNameReserved only reserves JS keywords; utils.ts:113,128,184-197 and types.ts:149,176,201,225,279 confirm Buffer/Address/Result/Error are emitted bare and UDT names are interpolated with only sanitizeIdentifier, so no guard prevents collision"]
does_not_rule_out = ["the exact downstream developer behavior after consuming a type-confused field (depends on application code)", "collisions among two UDTs sharing a name beyond the built-in set"]
assumptions = ["remote spec (attacker contract or malicious/MITM RPC) can declare a UDT whose name equals a generator-emitted built-in type", "caller runs TypeGenerator/ClientGenerator and builds the generated package"]
mechanism_brief = "sanitizeIdentifier reserves only JS keywords; an attacker UDT named Buffer/Address/Result/Error shadows the bare type the generator emits for bytes/address/result/error fields (silent confusion) or duplicates an emitted import (build break)"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier strips non-identifier chars and JS keywords but does not reserve generator-emitted built-in type names (Buffer/Address/Result/Error)"

[[blockers]]
kind = "not_found"
source = "src/bindings/types.ts:generateStruct"
guarantee = "no source-proven guard prevents a UDT name from colliding with Buffer/Address/Result/Error or another UDT in the emitted module"
```
