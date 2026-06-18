# R927: Last-wins sanitizeIdentifier collision silently re-routes a ContractClient method to a different contract function

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/927-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the runtime construction path
`Client.from*/new Client(spec, options) -> constructor -> this.spec.funcs().forEach`
in current source (LSP unavailable for `.ts`; fell back to scoped Reads of
`src/contract/client.ts` and `src/bindings/utils.ts`).

- `src/contract/client.ts:106` — `const method = xdrFn.name().toString();`
  captures the **raw**, unsanitized contract function name.
- `src/contract/client.ts:110-128` — the `assembleTransaction` closure captures
  the raw `method` and uses it for `spec.funcArgsToScVals(method, args)` (line
  116), `AssembledTransaction.build({ method, ... })` (line 115), and
  `spec.funcResToNative(method, result)` (line 127).
- `src/contract/client.ts:131` — `this[sanitizeIdentifier(method)] = ...` is the
  only assignment; there is **no** `if (key in this)`, dedup, or uniqueness check
  anywhere in the `forEach` before the write. Last assignment wins.
- `src/bindings/utils.ts:65-83` — `sanitizeIdentifier` is many-to-one:
  `replace(/[^a-zA-Z0-9_$]/g, "_")` (line 67), reserved-word → `name + "_"`
  (line 69-71, reserved set includes `default` at utils.ts:16), leading-digit →
  `"_" + name` (line 73-75), all-special/empty → `"_unnamed"` (line 78-80).

The combination is confirmed: two distinct raw names can map to one property key
(`get_balance` / `get-balance` → `get_balance`; `default` → `default_` colliding
with a literal `default_`; `1pay` → `_1pay` colliding with `_1pay`; two distinct
all-special names → `_unnamed`), and the later-ordered function in
`spec.funcs()` overwrites the earlier one. Because the surviving closure carries
the **raw** `method`, `client.<key>(...)` encodes args for, builds, and decodes
results for the last-wins raw function — not the function the developer's
recognized name implies.

## Novelty / Prior Memory

Prior records [1][2][3] (routes ...310bbe…, ...764db…, ...a815…) closed only the
**code-generation / TS-string-injection** family (generated source text). They
do not touch this runtime property-assignment path, so they do not block C1.

The hypothesis batch asserts prior record [4] is "already VIABLE for exactly this
last-wins mechanism." The injected prior-memory brief contradicts this: record
[4] (route js-sdk-764db1ecd1a0b26cd4288e42) is **NOT_VIABLE** (failed_at=
reviewer) and concerns the `fromJSON <outputType>` **compile-time generic** and
`txFromJSON` — a different sub-path whose conclusion was that the generic is
erased at runtime and `txFromJSON` decodes via the method embedded in the
serialized JSON. That negative record is scoped to the erased-generic decode path
and does **not** subsume the constructor's runtime `this[key]` method-dispatch
boundary evaluated here. No existing VIABLE or blocking typed record covers this
exact runtime collision route, so C1 survives the duplicate/subsumption check.

## Findings

This is a genuine deviation from expected behavior. Expected: each
developer-facing method maps unambiguously to exactly one contract function, with
colliding sanitized names detected/disambiguated/rejected. Actual: collisions are
silently resolved last-wins with no guard.

Security impact: a malicious or compromised RPC server / proxy / contract that
supplies the spec or WASM (`Client.fromWasm`, `fromWasmHash`, `fromContractId`)
can include two functions whose names collide under `sanitizeIdentifier`, ordered
so the attacker's variant wins. The developer calls a recognized interface name
(e.g. `client.get_balance(...)`) but the SDK encodes arguments for and submits an
invocation of a **different** raw contract function. This is a valid-looking call
that submits a transaction invoking a different function (with different args
encoding and result decoding) than the application intended — i.e. a transaction
with materially different contract target/arguments than intended. That maps to
the High impact category ("transaction submitted with different ... contract
arguments than the application intended" / "bindings ... misrepresent the
contract interface"), so Severity = High.

The trust-confusion delta over "the contract is attacker-controlled anyway" is
real: the SDK presents a stable, developer-trusted name while wiring it to a
different underlying function, and a tampering proxy/RPC can introduce the
collider without the application observing any name change. Confidence is held at
medium because the High classification rests on a trust/materiality judgment
about the attacker-controlled-spec scope rather than a fund-movement proof, while
the underlying last-wins mechanism itself is source-proven.

## PoC Guidance

- **Test file**: add a focused Vitest unit test under `test/unit` near existing
  contract-client / spec tests (e.g. alongside other `Spec`/`Client`
  constructor tests).
- **Setup**: build a `Spec` (via `Spec.fromJSON` / constructed XDR entries)
  containing two function entries that collide under `sanitizeIdentifier`, e.g.
  raw names `get_balance` then `get-balance` (the colliding `-` variant ordered
  last), each with a distinguishable signature/return.
- **Steps**: construct `new Client(spec, options)` with a mocked/no-network
  `options` (stub `options.server`); inspect the bound property `get_balance`.
- **Assertion**: assert that `client.get_balance` resolves to the closure for the
  **last** raw name (`get-balance`) — e.g. by asserting the built
  `AssembledTransaction`/`method` carries `"get-balance"`, or by stubbing
  `spec.funcArgsToScVals`/`funcResToNative` and asserting they are called with
  `"get-balance"` rather than `"get_balance"`. Demonstrates the earlier function
  is silently shadowed with no error/warning.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-310bbe7b42cb719afc52c1fd"
weakness = "identifier_collision"
record_kind = "single_path"
path = ["Client.constructor", "this.spec.funcs().forEach", "sanitizeIdentifier", "this[key] = assembleTransaction"]
sink = "this[sanitizeIdentifier(method)] assignment"
sink_role = "runtime_method_binding"
impact_class = "contract_interface_misrepresentation"
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
rules_out = ["source trace at src/contract/client.ts:105-135 confirms no dedup/uniqueness/pre-existing-key guard precedes the this[sanitizeIdentifier(method)] assignment, ruling out the only blocker that would make the last-wins collision non-viable", "prior code-generation TS-injection records [1][2][3] do not cover this runtime property-assignment path and do not block it", "prior NOT_VIABLE record [4] is scoped to the erased fromJSON <outputType> generic / txFromJSON decode and does not subsume this constructor method-dispatch route"]
does_not_rule_out = ["collision of a contract function name with a ContractClient internal property such as spec/options (see C2)", "code-generation-time (BindingGenerator string-emission) collisions outside this runtime constructor path"]
assumptions = ["spec is decoded from an attacker-controlled contract spec/WASM via Client.fromWasm/fromWasmHash/fromContractId", "spec.funcs() preserves an attacker-influenceable ordering so the colliding function can be placed last", "two raw contract function names can differ yet map to one sanitizeIdentifier key, which the many-to-one normalization at src/bindings/utils.ts:67-80 confirms"]
mechanism_brief = "sanitizeIdentifier is many-to-one; the constructor forEach assigns this[sanitizeIdentifier(method)] with no dedup, so the last colliding raw method wins and a developer-facing method name silently routes to a different contract function (raw method captured in the assembleTransaction closure keys funcArgsToScVals/build/funcResToNative)."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier only normalizes characters/reserved words/leading digits; it provides no uniqueness guarantee, so it does not block colliding keys on this path"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no dedup/uniqueness/pre-existing-key (key in this) check exists between sanitizeIdentifier and the this[key] assignment in the constructor forEach"
```
