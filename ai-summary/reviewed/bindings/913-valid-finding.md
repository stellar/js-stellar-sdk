# R913: Many-to-one sanitizeIdentifier collapses distinct contract functions to one last-wins client method

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/913-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Confirmed in current source:

- `sanitizeIdentifier` (src/bindings/utils.ts:65-83) is many-to-one. The first
  step `identifier.replace(/[^a-zA-Z0-9_$]/g, "_")` (line 67) collapses every
  non-`[a-zA-Z0-9_$]` character to `_`. Additionally `isNameReserved`
  (utils.ts:2-59) causes reserved words to be suffixed with `_` (line 70), so a
  reserved-word function name `class` and a literal function name `class_` both
  sanitize to `class_`. Both `class` and `class_` are valid on-chain symbols
  (`[a-zA-Z0-9_]`), so the collision is reachable even under a strict Soroban
  symbol charset and does not depend on exotic characters. No uniqueness/dedup
  pass exists anywhere on the path.

- Runtime binding, `ContractClient` constructor (src/contract/client.ts:105-135):
  the constructor iterates `this.spec.funcs()`, captures `method =
  xdrFn.name().toString()` (line 106), and assigns
  `this[sanitizeIdentifier(method)] = ...assembleTransaction` (line 131) with no
  dedup. For two functions whose names sanitize to the same key, the later
  iteration overwrites the earlier; the surviving `assembleTransaction` closes
  over the surviving `method`, so `spec.funcArgsToScVals(method, args)` (line
  116) and `spec.funcResToNative(method, result)` (line 127) target the
  surviving on-chain function. The earlier function is silently unreachable.

- This runtime path is reached by `Client.from` (client.ts:188-199),
  `Client.fromWasm` (176-179), and `Client.fromWasmHash` (148-166) — all build
  the client at runtime from fetched WASM with no codegen and no TypeScript
  compile step, so the last-wins binding occurs regardless of any
  generated-code TS diagnostic.

- Codegen path (`ClientGenerator.generate`, src/bindings/client.ts:24-72):
  `interface Client` members are keyed by `sanitizeIdentifier(func.name())`
  (generateInterfaceMethod, lines 99-113); duplicate interface method
  signatures are merged by TypeScript as overloads (not a compile error), so the
  collision is not surfaced to the developer there either.

## Findings

A remote/attacker-controlled contract spec (trust boundary
`contract_spec_or_rpc_server`) can declare two functions whose names collide
under `sanitizeIdentifier`. The generated/runtime client exposes a single
callable under the sanitized name, bound last-wins to the surviving on-chain
function. A developer who intends to invoke the shadowed function (by the
displayed method name) instead submits a transaction that calls a different
on-chain function, with arguments re-encoded under the surviving function's arg
spec (`funcArgsToScVals(survivingMethod, args)`) and the result parsed under the
surviving function's output type. This is a transaction submitted to a different
contract method than the application intended, and bindings that misrepresent
the contract interface — High under the objective impact categories.

Novelty: prior record [1] (route_id `js-sdk-764db1ecd1a0b26cd4288e42`,
NOT_VIABLE) closed only executable-TypeScript injection via the ascii-identifier
strip ("identifiers_stripped_to_ascii_ident_set"). That strip is the very
mechanism that *creates* this many-to-one collision; record [1] does not address
the semantic-collapse / last-wins failure mode. Record [3]
(`js-sdk-0283c3cad484b8dcb342fe0f`) covers UDT *type-name* shadowing in the type
generator, a different route and sink. This finding is novel.

## PoC Guidance

- **Test file**: append to an existing bindings unit test under
  `test/unit` (e.g. a `ClientGenerator`/`Spec`-based test).
- **Setup**: construct a `Spec` with two `ScSpecFunctionV0` entries whose names
  collide after sanitization — simplest is reserved-word `class` and literal
  `class_` (both valid symbols), or `transfer_funds` and `transfer-funds` if the
  spec decode does not enforce the symbol charset. Give them distinct input/
  output signatures.
- **Steps**: build a runtime `Client` via `new Client(spec, options)` (mock
  server/options); inspect the bound property for the collided key.
- **Assertion**: assert only one callable exists for the sanitized key and that
  it dispatches to the *last* function's `method` (e.g. by stubbing
  `AssembledTransaction.build` and checking the `method` it receives), proving
  the first function is unreachable and the displayed name invokes a different
  on-chain function. Optionally assert `ClientGenerator.generate()` emits
  duplicate interface members for the colliding key.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-764db1ecd1a0b26cd4288e42"
weakness = "code_generation"
record_kind = "single_path"
path = ["Client.from/fromWasm", "ContractClient.constructor", "this[sanitizeIdentifier(method)]"]
sink = "ContractClient.constructor method binding"
sink_role = "runtime_method_dispatch"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:constructor", "src/bindings/utils.ts:sanitizeIdentifier", "src/bindings/client.ts:generate"]
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
negative_claim.rules_out_codes = ["candidate_not_blocked_by_prior_injection_record", "candidate_not_blocked_after_source_trace"]
rules_out = ["prior record [1] (route_id js-sdk-764db1ecd1a0b26cd4288e42) only closed executable-TS injection via ascii-identifier stripping; that strip is the mechanism that creates the many-to-one collision, so it does not block this semantic-collapse route", "source trace confirms no dedup/uniqueness pass exists between sanitizeIdentifier and the last-wins this[sanitizeIdentifier(method)] binding"]
does_not_rule_out = ["the C2 fromJSON object-literal outputType mismatch is assessed separately as a type-only issue", "UDT type-name collision routes (route_id js-sdk-0283c3cad484b8dcb342fe0f) are outside this exact path"]
assumptions = ["attacker-controlled contract spec/wasm supplies two function names that sanitize to one identifier (e.g. reserved-word `class` vs literal `class_`, both valid Soroban symbols)", "developer uses Client.from/fromWasm/fromContractId or the generated client to call the displayed method"]
mechanism_brief = "many-to-one sanitizeIdentifier collapses two distinct contract function names to one identifier; the ContractClient constructor registers them last-wins on this[sanitizeIdentifier(method)] and the closure captures the surviving method, so calling the displayed method invokes a different on-chain function with re-encoded args and result"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier and isNameReserved only normalize/suffix characters; neither detects nor prevents sanitized-name collisions, and reserved-word suffixing introduces new collisions"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:constructor"
guarantee = "no dedup/uniqueness check exists between sanitizeIdentifier and the last-wins this[sanitizeIdentifier(method)] assignment"
```
