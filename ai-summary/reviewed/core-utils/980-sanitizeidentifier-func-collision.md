# R980: sanitizeIdentifier function-name collision drops/shadows a contract function in generated bindings and runtime ContractClient

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/980-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) is a confirmed many-to-one
mapping. With only `[a-zA-Z0-9_]` characters it still collapses distinct names:

- reserved-word suffixing: `isNameReserved` (`utils.ts:2-59`) returns true for
  `delete`, `class`, `static`, `package`, `default`, `import`, `export`, etc., so
  `sanitizeIdentifier("delete") === "delete_"`, which is identical to
  `sanitizeIdentifier("delete_") === "delete_"` (line 69-71);
- leading-digit prefix (line 73-75) and the `_unnamed` all-underscore fallback
  (line 78-80) add further collision classes.

No uniqueness/dedup guard exists at any of the three func-name sinks:

1. **Generated interface** — `src/bindings/client.ts:35-39` maps every non-
   constructor func through `generateInterfaceMethod`, whose name is
   `sanitizeIdentifier(func.name().toString())` (line 100). Two colliding funcs
   emit two interface members with the same name (TS treats them as overloads,
   not an error).
2. **Generated `fromJSON` object literal** — `client.ts:47-51` joins
   `generateFromJSONMethod` outputs with `","` into `{ ${fromJSON} }` (line
   68-70). `generateFromJSONMethod` (line 115-123) uses the same sanitized name,
   so colliding funcs produce `{ delete_ : …, delete_ : … }` — a duplicate
   object key; at runtime the second wins.
3. **Runtime ContractClient** — `src/contract/client.ts:105-135`. The
   `forEach` over `spec.funcs()` captures the **original** `method` name
   (`xdrFn.name().toString()`, line 106) inside the `assembleTransaction`
   closure, then assigns `this[sanitizeIdentifier(method)] = …` (line 131). On
   collision the property is overwritten: the first function's closure is
   discarded, so that function is unreachable via the property, and
   `parseResultXdr` (line 126-127) decodes via `spec.funcResToNative(method, …)`
   for the surviving function only.

The expected behavior — each distinct contract function maps to a distinct,
faithful client member — is provably violated: the code emits/binds duplicate
members with no dedup, so one function silently shadows another.

## Findings

Trust boundary is attacker-controlled contract spec data: a developer/wallet
generates bindings or instantiates a `ContractClient` for an arbitrary on-chain
contract (`Client.fromWasmHash` / constructor). A malicious or compromised
contract that declares a colliding function-name pair (e.g. `delete` + `delete_`,
`class` + `class_`) causes:

- the generated interface to advertise two methods that resolve to one property;
- the `fromJSON` decode map to silently bind one of the two names;
- the runtime client to make the first function uncallable and route the shared
  property to the last-defined function, decoding results with that function's
  output schema.

The developer sees a faithful-looking two-method interface but one underlying
function is unreachable and the surviving property silently invokes a different
contract function (args encoded for it, results decoded for it). This is
attacker-controlled-spec binding misrepresentation, matching the High impact
floor for "contract bindings … produce methods/types that misrepresent the
contract interface." Severity-threshold and the malicious-contract trust model
are policy judgments, hence medium confidence.

## PoC Guidance

- **Test file**: append to a bindings unit test under `test/unit` exercising
  `ClientGenerator` / `Spec` (e.g. a `test/unit/contract_client*.test.ts` or a
  new `test/unit/bindings_collision.test.ts`).
- **Setup**: build an `xdr.ScSpec`/`Spec` with two `ScSpecFunctionV0` entries
  named `delete` and `delete_` (no special characters needed), each with a
  distinct, observable output type.
- **Steps**: (a) call `new ClientGenerator(spec).generate()` and assert the
  emitted `fromJSON` object literal and interface contain a duplicate `delete_`
  member; (b) construct `new ContractClient(spec, options)` and assert
  `client.delete_` resolves to a single closure and that the `delete` function
  is unreachable.
- **Assertion**: only one property exists for the two functions; invoking it
  encodes/decodes with the surviving function's schema, demonstrating the first
  function is silently dropped.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-04ce42a44c26c2e20e582d55"
weakness = "code_generation"
record_kind = "single_path"
path = ["<anonymous>", "generate"]
sink = "generate"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/client.ts:generate", "src/bindings/client.ts:generateFromJSONMethod", "src/contract/client.ts:constructor", "src/bindings/utils.ts:sanitizeIdentifier"]
scope.trust_boundary = "contract_spec_data"
scope.protocol_phase = "binding_generation"
scope.auth_state = "caller_configured"
scope.attacker_control = "contract_spec_names"
scope.parser_state = "spec_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms no uniqueness/dedup guard on func-name sinks in bindings/client.ts (interface + fromJSON) or contract/client.ts runtime property assignment; prior NOT_VIABLE [1] only blocked config-value embedding, a different mechanism, so it does not block this name-collision sink"]
does_not_rule_out = ["whether SCSymbol/string XDR decode imposes a charset that would additionally widen the collision space (would only make the attack easier)", "input/field-name collisions inside a single function's parameter list, which were not separately traced"]
assumptions = ["contract spec data is attacker-controlled because bindings are generated for arbitrary on-chain contracts via Client.fromWasmHash/ContractClient constructor", "two valid [a-zA-Z0-9_] function names such as delete and delete_ can both appear in a single spec"]
mechanism_brief = "two spec function names colliding under sanitizeIdentifier produce a duplicate fromJSON object key and a duplicate interface method, and the runtime ContractClient overwrites the shared property, making one contract function unreachable and routing the property to the surviving function's encode/decode schema"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier normalizes names (reserved suffix, leading-digit prefix, _unnamed fallback) but performs no uniqueness/dedup, so distinct in-charset names can map to the same identifier and does not block this candidate path"

[[blockers]]
kind = "not_found"
source = "src/bindings/client.ts:generate"
guarantee = "no source-proven dedup/uniqueness guard found on the func-name sinks in bindings/client.ts (interface + fromJSON) or contract/client.ts runtime property assignment"
```
