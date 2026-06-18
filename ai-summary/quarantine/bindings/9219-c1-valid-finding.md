# R001: sanitizeIdentifier has no cross-entry uniqueness, so attacker spec names collide/merge in generated bindings

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/9219-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Trust boundary: a remote contract/RPC server supplies WASM bytes whose embedded
`contractspecv0` XDR carries attacker-chosen UDT/type/function/field names.
These names flow through `specFromWasm` → `new Spec(...)` →
`TypeGenerator`/`ClientGenerator`, which emit TypeScript source strings consumed
by the developer's build.

Source-confirmed mechanism:

- `src/bindings/utils.ts:65-83` — `sanitizeIdentifier` replaces every
  `[^a-zA-Z0-9_$]` character with `_`, appends `_` for reserved words, prefixes
  `_` for a leading digit, and falls back to `_unnamed`. It keeps **no registry
  of already-emitted identifiers**: no de-duplication, no collision suffixing,
  no cross-entry uniqueness tracking.
- `src/bindings/types.ts:132,158,184,210,268` and
  `src/bindings/client.ts:100,116` — each struct/union/enum/error-enum/function
  /field/parameter name is sanitized independently. Two distinct spec names that
  differ only by characters that sanitize to `_` therefore yield the same
  emitted identifier with no detection.
- `src/bindings/utils.ts:195-198,254-258` — UDT references are emitted as the
  bare `sanitizeIdentifier(udt name)` and added to `typeFileImports`.

I traced each claimed collision variant to determine whether it fails closed at
the developer's TypeScript build or silently misrepresents the interface:

- SDK-symbol shadowing (UDT named `Address`/`Result`/`Buffer`/`Client`/`Spec`):
  these reserved names are *imported* into the generated file — `Address` from
  `@stellar/stellar-sdk` (`utils.ts:262`), `Result` from
  `@stellar/stellar-sdk/contract` (`utils.ts:275`), `Buffer` from `'buffer'`
  (`utils.ts:377`), and `Client as ContractClient`/`Spec` in `client.ts:84-93`.
  When a same-named UDT is also referenced, the generated file contains a
  duplicate import vs. local declaration → **TypeScript compile error
  (fail-closed)**. When only the UDT exists, the bare name resolves to the UDT
  correctly. `Option` is never emitted (options become `T | null`), so it is not
  a real reserved symbol. These variants are therefore mostly build-caught.
- **Silent, compiling variant (the viable core):** two distinct *struct* UDTs
  whose names collapse to the same identifier (e.g. attacker structs `Foo-Bar`
  and `Foo_Bar`, both → `Foo_Bar`) both emit `export interface Foo_Bar {...}`
  into the types file (`types.ts:131-152`). TypeScript **interface declaration
  merging** silently combines them into a single interface holding the union of
  both structs' fields — no compile error — so the generated `Foo_Bar` faithfully
  represents neither contract type. This compiles cleanly and misrepresents the
  contract interface.

Impact bounding (confirmed): `ContractClient` serializes arguments from `Spec`
using the **original** unsanitized names, so a generated-type collision does not
redirect a runtime call or alter submitted transaction arguments; argument-type
mismatches tend to fail closed at `Spec` serialization. Impact is therefore
bounded to developer-facing interface/type misrepresentation, not wrong
submission.

Novelty: prior memory `js-sdk-310bbe7b42cb719afc52c1fd` ruled out executable-TS
**injection** only; it did not assess collision/shadowing/merging, so it does
not block this candidate. Distinct mechanism, novel.

## Findings

A malicious or compromised contract can craft a spec whose UDT struct names
collapse under `sanitizeIdentifier` to a single identifier. Because TypeScript
merges duplicate `export interface` declarations, the generated bindings present
one structurally-merged type that misrepresents both underlying contract types,
with no error surfaced to the developer at generation or build time. A developer
relying on the generated types for field shape/optionality may write code
against an interface that does not match either real contract type.

Severity Medium: this is contract binding type confusion / interface
misrepresentation (SEVERITY_SCALE Medium row, IMPACT_CATEGORIES "bindings ...
misrepresent the contract interface"). It is held below High because the runtime
call/serialization path uses the original spec names and does not produce a
wrong submission. Confidence medium: the severity floor is a threshold judgment
and the runtime no-wrong-submission argument, while source-supported, was not
exhaustively traced through every `Spec` serialization branch.

## PoC Guidance

- **Test file**: append to an existing bindings unit test, e.g.
  `test/unit/spec/bindings_*` / the TypeGenerator test under `test/unit`.
- **Setup**: build a `Spec`/`ScSpecEntry[]` (or a minimal WASM `contractspecv0`)
  containing two `scSpecEntryUdtStructV0` structs with names that sanitize to the
  same identifier — e.g. `"Foo-Bar"` with field `a: u32` and `"Foo_Bar"` with
  field `b: bool`.
- **Steps**: run `new TypeGenerator(spec).generate()`.
- **Assertion**: assert the output contains two `export interface Foo_Bar`
  declarations (i.e. two distinct contract structs collapsed to one identifier),
  demonstrating that the emitted bindings rely on TS declaration merging and
  misrepresent the two contract types. Optionally compile the emitted string
  with `tsc` and assert it does *not* error (merge is silent), in contrast to a
  duplicate `export type` collision which would error.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-b83e13b0f623b7d3d2225d7f"
weakness = "contract interface integrity (untrusted WASM/spec decode)"
record_kind = "single_path"
path = ["<anonymous>", "Binding ... romWasm"]
sink = "Binding ... romWasm"
sink_role = "contract_wasm_parse"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "contract_wasm_parse"
target_functions = ["src/bindings/utils.ts:sanitizeIdentifier", "src/bindings/utils.ts:parseTypeFromTypeDef", "src/bindings/types.ts:generateStruct", "src/bindings/client.ts:generateInterfaceMethod"]
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
rules_out = ["source trace of sanitizeIdentifier (utils.ts:65-83) confirms no uniqueness/de-dup/collision-suffix registry exists, ruling out a hidden collision guard that would block the candidate", "interface declaration merging of duplicate export interface compiles silently, ruling out the assumption that all collisions fail closed at the developer build"]
does_not_rule_out = ["SDK-symbol-shadowing variants (UDT named Address/Result/Buffer/Client/Spec) are largely build-caught as duplicate import vs declaration TS errors rather than silent", "runtime wrong-call/wrong-argument submission (ContractClient uses original spec names; serialization branches not exhaustively traced)", "duplicate export type / enum-vs-interface collisions that surface as TS compile errors rather than silent merges"]
assumptions = ["attacker-controlled WASM can embed contractspecv0 UDT names containing non-identifier characters (e.g. '-') so two distinct struct names collapse to one identifier", "developer consumes the emitted TypeScript strings via a normal tsc build where interface declaration merging applies"]
mechanism_brief = "sanitizeIdentifier collapses non-ident chars to _ with no cross-entry uniqueness tracking, so two distinct attacker struct names collapse to one identifier; duplicate export interface declarations are silently merged by TypeScript, producing a single binding type that misrepresents both contract structs."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier restricts characters to [a-zA-Z0-9_$] and avoids reserved words/leading digits but provides no uniqueness or collision-avoidance across spec entries, so it does not block this candidate"

[[blockers]]
kind = "not_found"
source = "src/bindings/types.ts:generateStruct"
guarantee = "no source-proven collision/uniqueness/shadowing guard exists on the struct type-name generation path; duplicate export interface emission relies on silent TS declaration merging"
```
