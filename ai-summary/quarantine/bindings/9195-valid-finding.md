# R9195: Colliding contract function names collapse to one generated method, misrepresenting the contract interface

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/9195-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Confirmed in current source, end to end:

- `sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) rewrites every non-`[a-zA-Z0-9_$]`
  character to `_`, appends `_` for JS-reserved names (`isNameReserved`, utils.ts:2-59),
  prefixes leading digits, and falls back to `_unnamed`. It maintains **no registry of
  already-emitted identifiers** — distinct inputs can return the same string.
- `ClientGenerator.generate` (`src/bindings/client.ts:24-72`) takes `this.spec.funcs()`
  and `.map((func) => this.generateInterfaceMethod(func))` (client.ts:35-39) with **no
  dedupe**. The only `Set` usage in the bindings generator is import de-duplication
  (`src/bindings/utils.ts:361,369`), not generated member uniqueness — verified by search.
- `generateInterfaceMethod` (client.ts:99-113) builds `${name}(${params}): Promise<...>;`
  from `sanitizeIdentifier(func.name())`. Two colliding funcs therefore emit two members
  with the same name into `export interface Client { ... }` (client.ts:55-57). With
  **differing signatures** these are legal TypeScript overloads — the broken interface
  compiles with no duplicate-identifier error. `generateFromJSONMethod` (client.ts:115-123)
  and the `fromJSON` object literal (client.ts:47-51,68-70) are likewise built per-func
  with no collision guard.
- The collision is reachable with realistic, attacker-controlled input. `ScSpecFunctionV0.name`
  is a plain XDR `string | Buffer` (`src/base/generated/next.d.ts:10220,10227`), not a
  charset-validated symbol, so the JS XDR decoder does not reject `-`, space, or unicode in a
  remote spec's function name (e.g. `do_thing` and `do-thing` both sanitize to `do_thing`).
  Even under the strict Soroban `[a-zA-Z0-9_]` symbol convention, the reserved-keyword suffix
  path still collides: a literal `if` sanitizes to `if_` (utils.ts:69-70) and collides with a
  literal `if_` — both are fully valid symbols.
- The misrepresentation is completed downstream at runtime: `ContractClient` constructor
  (`src/contract/client.ts:105-135`) iterates `spec.funcs()` and assigns
  `this[sanitizeIdentifier(method)] = …` (client.ts:131) **last-wins**, with the
  `assembleTransaction` closure capturing the **original** un-sanitized `method` name
  (client.ts:106,115-127). So `client.do_thing(args)` dispatches to whichever colliding
  function is *last* in the attacker-ordered `spec.funcs()`, building/submitting a transaction
  with that function's name, args (`funcArgsToScVals(method, …)`), and result decoding
  (`funcResToNative(method, …)`), while the interface the developer reads can show the benign
  first function's JSDoc/signature (client.ts:100,109,112).

## Findings

This is a genuine deviation from expected behavior. Expected: each distinct contract function
maps to a distinct, unambiguous generated method, or the generator rejects/flags colliding
names. Actual: collisions silently collapse, the broken interface compiles as overloads, and
runtime dispatch is last-wins, ordered by the attacker-supplied spec.

Impact: a remote contract spec (reached without auth via
`BindingGenerator.fromContractId`/`fromWasm`/`fromWasmHash`) can present two functions whose
names collide after sanitization, ordered so the malicious one is processed last. A developer
generating and using the bindings reads the benign function's contract semantics in the emitted
interface but, at runtime, `client.<name>(...)` builds and submits a transaction for the
*other* function. This matches the High-floor impact category "Contract bindings generated from
attacker-controlled spec data ... produce methods/types that misrepresent the contract
interface," and the downstream effect ("transaction submitted with different ... contract
arguments than the application intended") is also a High category.

Confidence is calibrated to medium because (a) the materially decisive last-wins dispatch lives
downstream in `src/contract/client.ts` rather than in the producer this candidate is anchored
on, and (b) the overload set does technically expose both signatures to a careful reader, so the
deception is "benign JSDoc/first overload visible + malicious last-wins runtime" rather than
total hiding — a severity-threshold judgement.

This is distinct from prior VIABLE record [4] (`route_id js-sdk-310bbe7b42cb719afc52c1fd`),
whose mechanism is a dynamically-attached method shadowing the class's own `spec`/`options`
fields. Here the collision is between two *contract functions* with each other, anchored on the
generator's emitted interface. It is also distinct from [1]/[2]/[3], which concern TypeScript
code-injection (a different weakness) and were ruled NOT_VIABLE. Not a duplicate or subsumption.

## PoC Guidance

- **Test file**: append to an existing bindings generator unit test (e.g. under
  `test/unit/` exercising `ClientGenerator.generate` / `BindingGenerator.fromSpec`).
- **Setup**: build a `Spec` / contract spec containing two `ScSpecFunctionV0` entries whose
  names collide after `sanitizeIdentifier` — simplest deterministic pair: function named `if`
  and function named `if_`, with **different** input/output signatures so the overload merge is
  silent. (A `do-thing` / `do_thing` pair also works and exercises the charset-rewrite path.)
  Order the spec so the attacker function is last.
- **Steps**: call `new ClientGenerator(spec).generate()` and capture the emitted string.
- **Assertions**:
  1. The `export interface Client { ... }` block contains the sanitized name (`if_`) declared
     **twice** (two interface members), demonstrating the silent overload merge with no dedupe.
  2. (Optional runtime completion) instantiate the `ContractClient` over the same spec and assert
     `this[sanitizeIdentifier(method)]` resolves to the **last** colliding function's closure
     (captured original name), proving last-wins dispatch diverges from the first/visible
     overload. Use mocked spec entries; do not contact public infrastructure.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-09e5b44caf8e9215e76e25f6"
weakness = "generated code integrity"
record_kind = "single_path"
path = ["BindingGenerator spec decode", "ClientGenerator.generate", "generateInterfaceMethod via sanitizeIdentifier (no collision guard)"]
sink = "ClientGenerator.generateInterfaceMethod"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "code_generation"
target_functions = ["src/bindings/utils.ts:sanitizeIdentifier", "src/bindings/client.ts:generateInterfaceMethod", "src/bindings/client.ts:generate", "src/contract/client.ts:Client.constructor"]
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
rules_out = ["source trace confirms no dedupe/uniqueness/collision guard exists in sanitizeIdentifier or the ClientGenerator family before interface members are emitted; the only Set usage is import dedup at utils.ts:361,369", "candidate is not subsumed by prior VIABLE [4], whose mechanism is internal spec/options field-shadow rather than function/function collision", "ScSpecFunctionV0.name is a plain XDR string (next.d.ts:10227) so the JS decoder does not enforce a charset that would prevent rewrite-based collisions, and the reserved-keyword suffix path collides even under strict symbol charset"]
does_not_rule_out = ["the downstream runtime last-wins dispatch surface in src/contract/client.ts:131 that materially completes the misrepresentation (overlaps the area of prior [4] but via a distinct collision mechanism)", "identical-signature collisions that instead raise a visible TS duplicate-identifier error (Low DoS variant, out of scope)", "type/struct/enum/SDK-reserved import name collisions that fail compilation visibly (Low DoS, not promoted)"]
assumptions = ["a developer fetches and builds bindings from a remote/untrusted contract spec via fromContractId/fromWasm/fromWasmHash (the stated trust boundary)", "two colliding function names carry different signatures so TypeScript treats the duplicated interface members as a silently-merged overload set rather than an error", "spec.funcs() preserves attacker-controlled ordering so the malicious function is processed last in both generation and runtime dispatch"]
mechanism_brief = "sanitizeIdentifier performs no uniqueness check, so two distinct contract function names that normalize to the same identifier emit two same-named members into the generated Client interface (silent TS overload when signatures differ), while ContractClient's runtime this[sanitizeIdentifier(method)] assignment is last-wins over attacker-ordered funcs, so the developer reads the benign function's contract but invokes the other."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "normalizes charset and JS-keyword names but does not deduplicate or reserve generated member names, so distinct inputs can yield the same identifier"

[[blockers]]
kind = "not_found"
source = "src/bindings/client.ts:generate"
guarantee = "no source-proven guard rejects or disambiguates two spec function names that sanitize to the same identifier before they are emitted as interface members; the only Set usage in bindings is import dedup at utils.ts:361,369"
```
