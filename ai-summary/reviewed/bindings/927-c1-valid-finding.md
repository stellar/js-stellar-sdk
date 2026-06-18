# R927C1: Runtime last-wins method-name collision routes a developer-facing ContractClient method to a different contract function

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/927-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the runtime construction path `new Client(spec, options) -> constructor
forEach -> this[sanitizeIdentifier(method)] = assembleTransaction` against
current source.

- `src/contract/client.ts:105` — `this.spec.funcs().forEach((xdrFn) => {...})`
  iterates every `ScSpecFunctionV0` entry. `funcs()` (`src/contract/spec.ts:544-552`)
  returns all function entries verbatim with no dedup or uniqueness filtering.
- `src/contract/client.ts:106` — `const method = xdrFn.name().toString();`
  captures the **raw** contract function name.
- `src/contract/client.ts:110-128` — the `assembleTransaction` closure captures
  the raw `method` and uses it for `spec.funcArgsToScVals(method, args)` (line 116),
  `AssembledTransaction.build({ method, ... })` (line 114-115), and
  `spec.funcResToNative(method, result)` (line 127).
- `src/contract/client.ts:131-134` — `this[sanitizeIdentifier(method)] = ...`
  is assigned unconditionally; there is no `if (key in this)`, dedup, or
  uniqueness check before assignment, so the function whose raw name appears
  **last** in `funcs()` wins the property key.
- `src/bindings/utils.ts:65-83` — `sanitizeIdentifier` is many-to-one:
  `replace(/[^a-zA-Z0-9_$]/g, "_")` (line 67), reserved word → `name + "_"`
  (line 69-71), leading digit → `"_" + name` (line 73-75), all-underscore/empty
  → `"_unnamed"` (line 78-80). Multiple distinct raw names therefore collapse to
  one key.

Collision classes are reachable even when names are restricted to the ASCII
identifier set `[a-zA-Z0-9_]`:
- reserved-word vs suffixed literal: `default` → `default_` collides with a
  literal `default_` → `default_`.
- leading-digit vs prefixed literal: `1pay` → `_1pay` collides with `_1pay` → `_1pay`.
- all-underscore fallback: `_` → `_unnamed` collides with a literal `_unnamed` → `_unnamed`.
The trust boundary is attacker-controlled spec/WASM bytes decoded through RPC
(`Client.fromWasm`/`fromWasmHash`/`fromContractId`); the XDR string decode does
not enforce the Soroban symbol charset, so character-strip collisions
(e.g. `get-balance` → `get_balance`) are also reachable from crafted bytes.

Because the winning closure carries the winner's raw `method`, `getFunc`/
`funcArgsToScVals`/`funcResToNative` are all keyed on the last-wins raw name, so
the call is internally consistent with the wrong function — i.e. it silently and
faithfully invokes the colliding function, not the one the developer named.

## Findings

A malicious or compromised RPC server / contract returns a spec containing two
functions whose names collide under `sanitizeIdentifier`, with the collider
ordered after the expected function. After construction, calling
`client.<key>(...)` (the developer-recognized name, e.g. `get_balance`) builds,
encodes, submits, and decodes the transaction for the *other* raw function.

This is a contract-binding interface misrepresentation: the generated binding
presents a developer-recognized method name while wiring it to a different
underlying contract function, so a tampered proxy/RPC can re-route a known
interface name with no name change visible to the application. Per the
objective impact table ("Contract bindings generated from attacker-controlled
spec data ... produce methods/types that misrepresent the contract interface"),
this is High severity. The trigger is a remote/contract trust boundary, not a
malicious application developer, so it is in scope.

Novelty: prior records [1][2][3] (route `js-sdk-310bbe...`, `...764db...`,
`...a815...`) closed only the code-generation / TS-string-injection family and
do not touch this runtime property-assignment path. Prior record [4] is
NOT_VIABLE and concerns the `fromJSON <outputType>` compile-time generic in
generated client code — a different path that decodes via the method embedded in
the serialized JSON; it neither duplicates nor subsumes this runtime
ContractClient constructor route. No prior structured record disposes of this
mechanism.

## PoC Guidance

- **Test file**: append to an existing contract-client unit test under
  `test/unit` (e.g. a `test/unit/contract*client*` spec), or create a focused
  Vitest test.
- **Setup**: construct a `Spec` whose entries contain two `ScSpecFunctionV0`
  functions that collide under `sanitizeIdentifier` (e.g. names `default` and
  `default_`, or `1pay` and `_1pay`), each with a distinguishable signature.
  Mock the RPC `server` in `ClientOptions` so no network is contacted.
- **Steps**: instantiate `new Client(spec, options)` and call the colliding
  property key (e.g. `client.default_(...)`).
- **Assertion**: assert the built transaction's `method` / encoded args
  correspond to the *last* colliding raw function, not the first — demonstrating
  the developer-facing name routes to the wrong contract function. Assert the
  count of bound method keys is fewer than the number of `funcs()` entries
  (a collision silently dropped a method).

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-310bbe7b42cb719afc52c1fd"
weakness = "code_generation"
record_kind = "single_path"
path = ["Client.constructor.funcs().forEach", "this[sanitizeIdentifier(method)] assignment"]
sink = "ContractClient runtime method property assignment"
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
rules_out = ["source trace confirms no dedup/uniqueness/pre-existing-key guard exists between sanitizeIdentifier and the this[key] assignment, and the prior TS-injection records [1][2][3] and NOT_VIABLE fromJSON-generic record [4] do not cover this runtime property-assignment path"]
does_not_rule_out = ["collision of a contract function name with a ContractClient internal property (see C2 / R927C2)", "collision behavior of contract names against prototype/static members not assessed here"]
assumptions = ["spec/WASM bytes are attacker-controlled via fromWasm/fromWasmHash/fromContractId per the route trust boundary", "XDR string decode of the function name does not enforce the Soroban symbol charset, so character-strip collisions are reachable; reserved-word/leading-digit/all-underscore collisions are reachable regardless"]
mechanism_brief = "sanitizeIdentifier is many-to-one; constructor forEach assigns this[sanitizeIdentifier(method)] with no dedup, so the last colliding raw method wins and a developer-facing method name silently routes to a different contract function because the bound closure captures the raw method used for funcArgsToScVals/build/funcResToNative."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier only normalizes characters/reserved words/leading digits; it provides no uniqueness guarantee, so it does not block colliding keys on this path"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no dedup/uniqueness/pre-existing-key check exists between sanitizeIdentifier and the this[key] assignment in the constructor forEach"
```
