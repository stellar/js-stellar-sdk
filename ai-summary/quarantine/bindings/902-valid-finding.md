# R902: sanitizeIdentifier does not reserve generator-emitted type names, allowing UDT type-identity confusion

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/901-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the identifier-reservation and type-emission logic in current source:

- `src/bindings/utils.ts:2-59` `isNameReserved` lists **only JavaScript
  keywords / reserved words / literals**. It does not include `Buffer`,
  `Address`, `Result`, `Error`, or any UDT name.
- `src/bindings/utils.ts:65-83` `sanitizeIdentifier` strips non-`[a-zA-Z0-9_$]`
  chars and appends `_` only for `isNameReserved` hits and leading digits. A UDT
  named `Error`/`Buffer`/`Address`/`Result` passes through unchanged.
- `src/bindings/utils.ts:101-202` `parseTypeFromTypeDef` emits the bare
  generator-owned identifiers: `Error` for `scSpecTypeError` (line 113),
  `Buffer` for `bytes`/`bytesN` (line 128), `Result<...>` for `result`
  (line 193), `Address` for address function inputs (line 137). UDT fields emit
  `sanitizeIdentifier(udt name)` (lines 195-198).
- `src/bindings/types.ts:131-152, 157-178, 183-204, 209-228, 267-280` emit
  `export interface/type/enum/const ${sanitizeIdentifier(name)}` for each UDT.

The "Expected Behavior" (generated identifiers must not collide with the
built-in/imported type names the generator itself emits) is correct, and the
code deviates. Two concrete sub-cases, both source-proven:

1. **Silent type confusion (no import, global symbol) — `Error`.** `Error` is a
   JS global; the generator never imports it. A UDT named `Error` emits a local
   `export interface Error {...}` (or `export const Error` for an error-enum).
   Any field whose spec type is `scSpecTypeError` — including the error position
   of a `Result<ok, Error>` — is emitted as `... : Error`, which now resolves to
   the attacker's UDT shape instead of the native `Error`. No import conflict
   exists, so TypeScript does **not** error: the misrepresentation is silent.
2. **Build-time collision (DoS) — `Buffer`/`Address`/`Result`.** These are
   imported (`import { Buffer } from 'buffer'`, `Address` from
   `@stellar/stellar-sdk`, `Result` from `@stellar/stellar-sdk/contract`; see
   `utils.ts:260-277, 337-381`) whenever a corresponding field type is present.
   A UDT with the same name produces both an import and a local
   `export interface`, yielding a TypeScript duplicate-identifier / import-vs-
   local-declaration error — the generated package fails to compile.

## Findings

The candidate is VIABLE on the strength of sub-case (1): a remote/attacker spec
(from `fromContractId`/`fromWasmHash` against a malicious or MITM RPC, or a
malicious published contract) that declares a UDT named `Error` and uses the
`error` spec type causes generated `types.ts` to misrepresent the contract
interface to the developer — the field is typed as the attacker's struct rather
than a native error. This matches the Medium "contract binding type confusion"
category; the runtime `Spec` (embedded base64) remains authoritative for actual
encode/decode, so this is interface/type-identity misrepresentation rather than
fund movement — severity held at Medium.

Sub-cases for `Buffer`/`Address`/`Result` degrade to build-time DoS of the
generated package rather than silent confusion, and are recorded in
`does_not_rule_out` rather than asserted as the primary mechanism.

## PoC Guidance

- **Test file**: add to `test/unit/bindings/` next to existing `types`/
  `TypeGenerator` unit tests.
- **Setup**: build a `Spec` (via constructed `ScSpecEntry[]`) containing a UDT
  struct named `Error` plus a function or struct whose field type is
  `scSpecTypeError` (or a `Result<u32, Error>` return).
- **Steps**: run `new TypeGenerator(spec).generate()`.
- **Assertion**: the output contains `export interface Error {` AND a field
  typed `: Error` with no `import` of a native Error, demonstrating the field
  silently binds to the attacker UDT. (For the DoS variant, assert that a UDT
  named `Buffer` plus a `bytes` field produces both `import { Buffer } from
  'buffer'` and `export interface Buffer`.)

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
rules_out = ["source trace confirms isNameReserved (utils.ts:2-59) reserves only JS keywords and that parseTypeFromTypeDef emits bare Error for scSpecTypeError with no import, so a UDT named Error silently shadows the native type with no TS duplicate-identifier error to flag it"]
does_not_rule_out = ["Buffer/Address/Result collisions, which produce TS duplicate-identifier build errors (generation/build DoS) rather than silent type confusion", "duplicate-identifier collisions among two UDTs sharing a sanitized name"]
assumptions = ["a remote/attacker-controlled spec can declare a UDT named Error and use the scSpecTypeError type (e.g. in a Result error position), which the generator emits verbatim"]
mechanism_brief = "sanitizeIdentifier reserves only JS keywords; an attacker UDT named Error shadows the global Error that parseTypeFromTypeDef emits for the spec error type, silently misrepresenting the field type (Buffer/Address/Result variants instead cause build-time duplicate-identifier DoS)"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier strips non-identifier chars and appends _ for JS keywords/leading digits, but does not reserve generator-emitted built-in type names (Error/Buffer/Address/Result)"

[[blockers]]
kind = "not_found"
source = "src/bindings/types.ts:generateStruct"
guarantee = "no source-proven guard prevents a UDT name from colliding with Error (silent shadow) or with Buffer/Address/Result (build error) in the emitted file"
```
