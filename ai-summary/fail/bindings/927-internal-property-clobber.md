# F927: Contract function named `spec`/`options` clobbers ContractClient internal fields

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/927-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the same constructor path in `src/contract/client.ts` (LSP unavailable for
`.ts`; scoped Reads used).

- `src/contract/client.ts:92-94` — parameter properties `public readonly spec:
  Spec` and `public readonly options: ClientOptions` are assigned at constructor
  entry. `readonly` is compile-time only; the underlying instance properties are
  runtime-writable.
- `src/contract/client.ts:131` — `this[sanitizeIdentifier(method)] = ...` writes
  unconditionally to any key.
- `src/bindings/utils.ts:65-83` — `sanitizeIdentifier("spec") === "spec"` and
  `sanitizeIdentifier("options") === "options"`: neither is in the reserved set
  (utils.ts:2-58), neither contains non-`[a-zA-Z0-9_$]` characters, neither
  starts with a digit, so both pass through unchanged.

So a contract function literally named `spec` or `options` would overwrite
`this.spec` / `this.options` with an `assembleTransaction` function at runtime.
The clobber is a real code deviation and was confirmed in source.

Impact bounding (confirmed at src/contract/client.ts:105-135): the `forEach`
loop and every `assembleTransaction` closure read the **local** `spec` and
`options` parameters (lines 116, 117, 119, 127, 132), never `this.spec` /
`this.options`. The iterator `this.spec.funcs()` is evaluated once at line 105
before any overwrite. Therefore overwriting `this.spec`/`this.options` neither
breaks client construction nor affects the bound methods; it corrupts only
external reads of `client.spec` / `client.options` after construction.

## Why It Failed

The candidate describes real, source-confirmed behavior, but its security impact
does not reach the objective's **Medium** severity floor; Low/informational
findings are explicitly out of scope for this objective.

The realistic consequence of clobbering `client.spec` / `client.options` with a
function is that later external introspection reads (`client.spec.funcs()`,
`client.options.networkPassphrase`, etc.) receive a function and most likely
**throw** on use — a visible failure / local inconvenience — rather than silently
producing a wrong-but-valid-looking security decision. There is no fund movement,
no signing/auth confusion, no silent transaction-target change, and no documented
SDK guarantee that these fields are tamper-protected. The bound contract methods
themselves remain correct (they use the captured params), so transaction
construction is unaffected. This is an integrity/code-smell issue best classified
as Low, which OUT_OF_SCOPE excludes.

Distinct from C1: C1's last-wins routing causes a *silent* wrong-function
submission (materially wrong semantics for a valid-looking call) and is recorded
VIABLE separately; C2's field clobber produces a broken/throwing client field,
not a silent security-significant decision change.

## What This Rules Out

A contract function named `spec` or `options` overwriting the ContractClient's
own `spec`/`options` instance fields as a **Medium+** integrity finding: the
clobber affects only post-construction external field reads (which fail loudly),
does not alter the bound methods or any submitted transaction, and stays below
the Medium severity floor for this objective.

## What This Does Not Rule Out

- The C1 last-wins routing among contract methods (recorded VIABLE separately).
- A future scenario where some SDK-internal or third-party code path reads
  `this.spec`/`this.options` *after* the `forEach` and makes a silent
  security-relevant decision from it — if such a reader is found, the severity
  calculus could change. No such reader exists in the current constructor path.
- Collision with other dynamically-relevant ContractClient members beyond
  `spec`/`options` not enumerated here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-310bbe7b42cb719afc52c1fd"
weakness = "identifier_collision"
record_kind = "single_path"
path = ["Client.constructor", "this[sanitizeIdentifier(method)] = assembleTransaction", "this.spec/this.options"]
sink = "this[sanitizeIdentifier(method)] assignment"
sink_role = "runtime_method_binding"
impact_class = "contract_binding_state_confusion"
route_family = "code_generation"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor"]
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
negative_claim.rules_out_codes = ["impact_below_medium_severity_floor", "clobber_affects_only_post_construction_external_field_reads"]
rules_out = ["a spec/options-named function clobbering ContractClient internal fields as a Medium+ finding: the clobber affects only post-construction external reads of client.spec/client.options, which fail loudly rather than producing a silent wrong security decision, and does not affect construction or the bound methods"]
does_not_rule_out = ["the C1 last-wins wrong-function routing among contract methods (recorded VIABLE)", "a hypothetical post-forEach SDK reader of this.spec/this.options making a silent security decision, if one is later found"]
assumptions = ["spec is decoded from an attacker-controlled contract spec/WASM", "the constructor forEach and assembleTransaction closures use the local spec/options parameters, not this.spec/this.options, as confirmed at src/contract/client.ts:105-135", "objective severity floor is Medium and Low/informational findings are out of scope"]
mechanism_brief = "unchecked this[sanitizeIdentifier(method)] assignment can write keys 'spec'/'options' (passed through unchanged by sanitizeIdentifier), overwriting ContractClient internal fields at runtime since readonly is compile-time only; impact is limited to corrupting later external client.spec/client.options reads, which throw on use."
why_failed_brief = "real deviation but below Medium floor: clobber only corrupts post-construction external field reads that fail loudly; construction and bound methods use local params and are unaffected; no silent security-significant decision change."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier passes 'spec' and 'options' through unchanged and offers no protection of reserved instance property names"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no guard prevents a dynamically attached method key from shadowing the class's own spec/options fields, but the constructor and bound closures read the local spec/options params so the clobber does not propagate into construction or method behavior"
```
