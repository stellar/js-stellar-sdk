# R9072: Function-name sanitized collision conflates distinct contract entrypoints in ClientGenerator output

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/907-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Same trust boundary and decode path as C1: `Spec.entries`
(`src/contract/spec.ts:495,520-538`) holds raw attacker-decoded entries with no
dedup or name validation. `Spec.funcs()` (`src/contract/spec.ts:544-552`) filters
to function entries and maps to `xdr.ScSpecFunctionV0` with no uniqueness check.

`ClientGenerator.generate` (`src/bindings/client.ts:24-72`) builds two surfaces
from `this.spec.funcs()`:

- Interface methods (`client.ts:35-39`): `.filter(... !== "__constructor")
  .map((func) => this.generateInterfaceMethod(func)).join("\n")`. Each method is
  `${docs}  ${name}(${params}): Promise<AssembledTransaction<${outputType}>>;`
  with `name = sanitizeIdentifier(func.name().toString())`
  (`client.ts:99-113`, line 100).
- `fromJSON` (`client.ts:47-51`): `.filter(...).map((func) =>
  this.generateFromJSONMethod(func)).join(",")`, then interpolated into
  `public readonly fromJSON = { ${fromJSON} };` (`client.ts:68-70`). Each entry is
  `  ${name} : this.txFromJSON<${outputType}>` (`client.ts:115-123`, line 122)
  with the same `sanitizeIdentifier`-derived `name`.

`sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) is the same verified
many-to-one map driving the collision (e.g. `"get balance"` and `"get-balance"`
→ `get_balance`). There is no de-dup or collision check anywhere on
`spec.funcs()` in `ClientGenerator.generate`.

## Findings

Two distinct contract functions whose raw names sanitize to the same identifier
produce, in the generated client:

1. A **duplicate key** in the `fromJSON` object literal:
   `{ get_balance : this.txFromJSON<A>, get_balance : this.txFromJSON<B> }`.
   JavaScript object-literal semantics keep the last key, silently dropping one
   decoder's declared return type. Modern TypeScript does not reject duplicate
   object-literal keys by default, so this compiles silently (last-wins).
2. **Repeated method signatures** in `export interface Client` — legal TypeScript
   overloads, no diagnostic — so the two distinct entrypoints are presented as a
   single overloaded method on the client's public type surface.

The runtime `Spec` is rebuilt from base64 entries keyed by original names
(`client.ts:43-45,62`), and `txFromJSON` is type-erased at runtime (identical
regardless of its type parameter), so there is no runtime decoder swap — the
divergence is at the generated TS type / public-API surface. This caps severity
at Medium (interface misrepresentation: two distinct contract entrypoints
conflated to one method/return type on the binding surface), matching the
IMPACT_CATEGORIES "produce methods/types that misrepresent the contract
interface" category and the SEVERITY_SCALE Medium "contract binding type
confusion" criterion. It is at or above the Medium minimum floor.

This is a genuine deviation from expected behavior — each distinct contract
function should map to a distinct, unambiguous client method and `fromJSON`
decoder entry. Per the security-review procedure, a confirmed deviation is
VIABLE at its correct severity; it is not rejected for being below High.

Novelty: distinct sink (`ClientGenerator.generate`) from C1's
`TypeGenerator.generate` and from prior route
`js-sdk-0283c3cad484b8dcb342fe0f` (UDT-vs-global). The route's own NOT_VIABLE
priors (truncation; recursion-depth) do not address function-name collision.

## PoC Guidance

- **Test file**: append to an existing `ClientGenerator`/bindings client Vitest
  under `test/unit`.
- **Setup**: build a `Spec` containing two `ScSpecEntry` function entries whose
  raw names differ only in a sanitizer-collapsed character (e.g. `"get balance"`
  and `"get-balance"`), with distinct output types.
- **Steps**: call `new ClientGenerator(spec).generate()`.
- **Assertion**: assert the emitted string contains two `get_balance :
  this.txFromJSON<` occurrences inside the `fromJSON` literal (duplicate key,
  last-wins) and two `get_balance(` signatures inside `export interface Client`
  (silent overload), demonstrating that two distinct entrypoints collapse to one
  on the generated client surface.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-45bef61cba5cce008f254c75"
weakness = "identifier_collision_duplicate_key"
record_kind = "single_path"
path = ["fetchFromWasmHash", "specFromWasm", "ClientGenerator.generate"]
sink = "ClientGenerator.generate"
sink_role = "code_emit"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/client.ts:generate", "src/bindings/client.ts:generateInterfaceMethod", "src/bindings/client.ts:generateFromJSONMethod", "src/bindings/utils.ts:sanitizeIdentifier"]
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
rules_out = ["source trace confirms no de-dup or collision check on spec.funcs() in ClientGenerator.generate (client.ts:35-51,115-123); sanitizeIdentifier (utils.ts:65-83) enforces no uniqueness, so two function names colliding to one identifier conflate at the client interface and fromJSON surface and are not blocked"]
does_not_rule_out = ["runtime decoder divergence (none, since txFromJSON is type-erased)", "UDT-vs-global shadowing covered by route js-sdk-0283c3cad484b8dcb342fe0f", "C1 UDT-vs-UDT declaration merging in the separate TypeGenerator sink"]
assumptions = ["modern TypeScript does not reject duplicate object-literal keys by default, so the fromJSON duplicate key compiles silently with last-wins rather than as a loud compile error; repeated interface method signatures are legal overloads", "spec is fetched from an attacker-controlled RPC/contract server so function name bytes are attacker-controlled, per the cited decode path"]
mechanism_brief = "two contract function names sanitize to one identifier; fromJSON object literal gets a duplicate last-wins key and the Client interface gets a silent overload, conflating two distinct entrypoints on the generated client's public surface"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier maps function names without uniqueness enforcement, so colliding function names are not blocked"

[[blockers]]
kind = "not_found"
source = "src/bindings/client.ts:generate"
guarantee = "no de-dup or collision check on spec.funcs() in ClientGenerator.generate for this exact viable path"
```
