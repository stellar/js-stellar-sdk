# R957-C1: Runtime Client method dispatch collision via non-injective sanitizeIdentifier

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/957-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Confirmed in current source:

- `src/bindings/utils.ts:65-83` — `sanitizeIdentifier` replaces every char outside
  `[a-zA-Z0-9_$]` with `_` (`utils.ts:67`). On the valid-symbol charset it is the
  identity map *except* for three transforms that can collapse distinct valid names:
  reserved-word suffixing (`utils.ts:69-71`, `name + "_"`), leading-digit prefixing
  (`73-75`), and the all-underscore fallback to `"_unnamed"` (`78-80`). The map is
  therefore non-injective even when restricted to characters a real contract can use.
- `src/contract/client.ts:105-135` — the constructor iterates `this.spec.funcs()`.
  For each function it captures the **raw** name `method = xdrFn.name().toString()`
  (`client.ts:106`), builds a closure that calls
  `AssembledTransaction.build({ method, ... })` and `spec.funcArgsToScVals(method, args)`
  (`client.ts:114-116`) and `spec.funcResToNative(method, result)` (`127`), then binds
  that closure onto the instance under the **sanitized** key
  `this[sanitizeIdentifier(method)] = ...` (`client.ts:131`).

There is no per-key uniqueness/dedup check. When two spec functions sanitize to the
same key, the later one in `funcs()` iteration order silently overwrites the earlier
binding, and the surviving accessor's closure carries the later function's raw name.

On-chain-feasible collision pairs (both members are valid SCSymbols a deployed
contract can actually export, so the surviving invocation hits a real function):

- `new` and `new_` → both sanitize to `new_` (`new` is reserved → `new_`).
- `_`, `__`, `___`, and a literal `_unnamed` → all sanitize to `_unnamed`.

The hypothesis headline pair (`transfer-funds` vs `transfer_funds`) requires a hyphen,
which is not a valid SCSymbol character for a callable on-chain function, so that exact
pair is not the strongest case — the reserved-word and all-underscore pairs above are.

## Findings

The expected behavior — each contract function maps to exactly one unambiguous
accessor, and calling that accessor invokes exactly that function — is violated. A
developer who calls `client.new_(args)` (the documented function) actually submits an
invocation of whichever colliding raw function the spec lists last, with arguments
encoded via that function's own arg spec. An attacker who controls the remote
wasm/spec (`Client.fromWasmHash` / `specFromWasmHash`, `client.ts:10-23`) can order the
spec so the malicious sibling wins, while the developer-expected function becomes
unreachable (only one accessor name exists).

This is a transaction-integrity defect: a transaction is built and submitted invoking a
different contract function (and arg encoding) than the application intended, matching
the High impact floor for "transaction submitted with different ... contract arguments
than the application intended."

Novelty: prior records on this sink concern TypeScript *injection* in the generator
([1],[3]) and `xdr.Hash.fromXDR` shape validation ([2],[4]) — a different weakness
(`identifier_collision` vs injection/decode). No prior covers runtime dispatch
collision. Treated as anti-evidence only; candidate survives.

## PoC Guidance

- **Test file**: append to an existing contract Client unit test under `test/unit`
  (e.g. a spec/client builder test) that constructs a `Spec` from synthetic entries.
- **Setup**: build a `Spec` containing two `ScSpecFunctionV0` entries named `new` and
  `new_` (distinct inputs/outputs), then `new Client(spec, options)`.
- **Steps**: inspect the bound accessor `client.new_` and trigger it (mock
  `AssembledTransaction.build` to capture the `method` it receives).
- **Assertion**: only one accessor `new_` exists, and its captured `method` equals the
  last-iterated raw name (`new`), proving the developer-facing accessor invokes a
  different contract function than its name implies. Also assert there is no accessor
  for the shadowed function.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-e7f284422e64462425cb9d4b"
weakness = "identifier_collision"
record_kind = "single_path"
path = ["Client.constructor", "sanitizeIdentifier"]
sink = "sanitizeIdentifier"
sink_role = "identifier_normalization"
impact_class = "transaction_integrity"
route_family = "xdr_decode"
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
rules_out = ["source trace confirms no dedup/uniqueness guard over sanitized method keys on the runtime Client path; reserved-word and all-underscore transforms collapse distinct valid SCSymbols to one key with last-write-wins"]
does_not_rule_out = ["generated-source duplicate declarations (C2)", "instance-field/prototype clobber (C3)", "collisions among names containing non-SCSymbol characters that cannot map to a real on-chain function"]
assumptions = ["remote wasm/spec is attacker-controlled per scope", "a real contract can export both members of a reserved-word or all-underscore collision pair (valid SCSymbols)"]
mechanism_brief = "lossy sanitizeIdentifier collapses distinct valid contract function names (new/new_, _ /__ /_unnamed) to one property key; the constructor binds by sanitized key but each closure captures its own raw name, so last-iterated function wins and a developer's call to the sanitized accessor submits a different on-chain function than intended"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "reserved-word, leading-digit, and all-underscore handling do not restore injectivity and add no per-key uniqueness check"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no source-proven dedup/uniqueness guard over sanitized method keys on the runtime Client binding path"
```
