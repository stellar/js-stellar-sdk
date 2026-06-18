# R927C2: Contract function named `spec`/`options` clobbers ContractClient internal fields at runtime

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/927-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the same runtime construction path with attention to internal-property
collision.

- `src/contract/client.ts:92-94` — `constructor(public readonly spec: Spec,
  public readonly options: ClientOptions)`. The parameter properties become
  plain runtime-writable own data properties on the instance; `readonly` is a
  compile-time-only annotation and does not freeze or guard the property at
  runtime. These are assigned at constructor entry, before the forEach body runs.
- `src/contract/client.ts:131` — `this[sanitizeIdentifier(method)] = ...` writes
  to ANY property key with no allow-list or reserved-name guard.
- `src/bindings/utils.ts:65-83` — `sanitizeIdentifier("spec") === "spec"` and
  `sanitizeIdentifier("options") === "options"`: both contain only ASCII
  identifier characters, are not in `isNameReserved`, and do not start with a
  digit, so they pass through unchanged.

A remote spec/WASM containing a function literally named `spec` (or `options`)
therefore overwrites `this.spec` (or `this.options`) with the
`assembleTransaction` function during construction.

Materiality bound (confirms the candidate's own anti-evidence): the construction
loop reads the **closure-captured constructor parameters** `spec` and `options`
(`src/contract/client.ts:116,117,127,132`), not `this.spec`/`this.options`, so
overwriting the instance fields does not corrupt binding construction itself.
The impact lands on later external readers of `client.spec` / `client.options`
(application or SDK code performing argument/result introspection or
re-encoding), which receive a function instead of the `Spec`/`ClientOptions`,
producing wrong/misleading binding state or a runtime type error.

## Findings

This is contract-binding state confusion: a structural field the application may
rely on for introspection is silently replaced by a bound method function. It
does not move funds and does not break method invocation, so per the severity
scale it sits at Medium ("security-significant integrity loss without direct
fund loss, including contract binding type confusion"). The trigger is a
remote/contract trust boundary, not a malicious application developer, so it is
in scope; it is above the Low floor because it requires a malicious remote spec
rather than an already-compromised caller.

Novelty: distinct from C1 (R927C1) — the collision target here is an
SDK-internal field, not another contract function — and not covered by prior
records [1][2][3] (TS-string injection) or [4] (NOT_VIABLE fromJSON generic).

## PoC Guidance

- **Test file**: append to an existing contract-client unit test under
  `test/unit`, or create a focused Vitest test.
- **Setup**: construct a `Spec` whose entries include a `ScSpecFunctionV0`
  named `spec` (and/or `options`). Mock the RPC `server` in `ClientOptions`.
- **Steps**: instantiate `new Client(spec, options)`; then read `client.spec`.
- **Assertion**: assert `typeof client.spec === "function"` (it has been
  clobbered) and that `client.spec instanceof Spec` is false / a subsequent
  `client.spec.funcs()`-style introspection call throws — demonstrating the
  internal field was overwritten by an attacker-named contract function.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-310bbe7b42cb719afc52c1fd"
weakness = "code_generation"
record_kind = "single_path"
path = ["Client.constructor.funcs().forEach", "this[sanitizeIdentifier(method)] assignment over spec/options"]
sink = "ContractClient runtime internal-property overwrite"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor", "src/bindings/utils.ts:sanitizeIdentifier"]
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
rules_out = ["source trace confirms spec/options are runtime-writable own properties (readonly is compile-time only) and sanitizeIdentifier passes 'spec'/'options' through unchanged, with no reserved-name guard before the this[key] assignment"]
does_not_rule_out = ["wrong-function routing among contract methods (see C1 / R927C1)", "the concrete set of downstream consumers that read client.spec/client.options for a security decision was not enumerated; severity could shift with a specific reader"]
assumptions = ["spec/WASM bytes are attacker-controlled via fromWasm/fromWasmHash/fromContractId per the route trust boundary", "at least one consumer reads client.spec or client.options after construction for introspection/re-encoding"]
mechanism_brief = "unchecked this[sanitizeIdentifier(method)] assignment can write keys 'spec'/'options', overwriting ContractClient internal fields at runtime since readonly is compile-time only; construction loop uses the captured parameters so it still works, but later client.spec/client.options reads get a function, corrupting introspection state."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier passes 'spec' and 'options' through unchanged and offers no protection of reserved instance property names"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no guard prevents a dynamically attached method key from shadowing the class's own spec/options fields"
```
