# F978: Path blocked: parseTypeFromTypeDef recursion/entry-count cost during generation

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/978-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> generate`

Residual escalation of the question: does `parseTypeFromTypeDef`
recursion/entry-count cost during binding generation reach a material
(>= Medium) resource-exhaustion impact?

## Blocker

`parseTypeFromTypeDef` (src/bindings/utils.ts:101-202) recurses on nested
container types with no depth guard, but each type node is visited exactly once
and performs O(1) work (Vec=1 call, Map=2, Tuple=N, Option collapses then 1,
Result=2), so total cost is **linear** in the number of spec type nodes — there
is no super-linear/algorithmic amplification, and the entry loop in
`generate` is likewise linear in spec size (bounded by the local/fetched WASM
spec). The only super-linear risk is call-stack depth on a single deeply-nested
type chain, which can only crash the generator at code-generation time and
yields no output. Decisively, `parseTypeFromTypeDef` is imported **only** by the
codegen modules `src/bindings/client.ts` and `src/bindings/types.ts`; the
runtime contract client `src/contract/client.ts` imports only
`sanitizeIdentifier`, so this function never executes inside a deployed
application. Per CLI subsystem scope, a local/dev-time generation crash is
Low/local-inconvenience and below the Medium floor.

## Evidence

- `src/bindings/utils.ts:101-202` - recursive type walker; each branch makes a
  fixed number of recursive calls and O(1) work per node — linear total, no
  amplification, no depth limit (stack-depth crash only).
- `src/contract/client.ts:6` - runtime contract client imports only
  `sanitizeIdentifier` from bindings/utils, not `parseTypeFromTypeDef`, so the
  walker is unreachable in a running application.
- `src/bindings/generator.ts:226-243` and `src/cli/util.ts:177-182` - `generate`
  is invoked only by the CLI/programmatic codegen path (local dev tool); a crash
  produces no generated output for an app to consume.

## Negative Scope

- Rules out: attacker contract spec causing material (>= Medium)
  resource-exhaustion via `parseTypeFromTypeDef` recursion or entry-count cost
  during CLI binding generation.
- Does not rule out: a stack-overflow crash of the local generator on a
  pathologically deep nested type (local/dev-time DoS, below Medium); spec
  string-content injection into generated bindings (separately ruled out by
  route js-sdk-e372b979e414457315f847d9); unverified WASM content on the
  fetch path (separate VIABLE route js-sdk-f7107932d67c6535c2ca097a).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-e372b979e414457315f847d9"
weakness = "code_generation"
record_kind = "residual_escalation"
path = ["<anonymous>", "generate"]
sink = "generate"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/utils.ts:parseTypeFromTypeDef", "src/bindings/generator.ts:generate", "src/cli/util.ts:generateAndWrite"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "wasm_spec_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["codegen_typewalker_linear_cost_no_amplification", "typewalker_unreachable_at_app_runtime"]
rules_out = ["attacker contract spec causing >= Medium resource exhaustion via parseTypeFromTypeDef recursion or entry-count cost during binding generation"]
does_not_rule_out = ["local/dev-time stack-overflow crash on pathologically deep nested type (below Medium)", "unverified fetched WASM content on fromContractId/fromWasmHash path (route js-sdk-f7107932d67c6535c2ca097a)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "parseTypeFromTypeDef recurses on nested container types with no depth guard but visits each node once with O(1) work (linear total, no amplification); it is imported only by codegen modules (client.ts/types.ts) and not by the runtime contract client, so it runs only at local/dev generation time; worst case is a stack-overflow crash producing no output, below the Medium floor and out of CLI scope."
why_failed_brief = "cost is linear in spec size with no algorithmic amplification, and the function is unreachable in a deployed app (only codegen); worst impact is a local generation-time crash, below Medium."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "structural_bound"
guarantee = "parseTypeFromTypeDef visits each spec type node once with O(1) work per node; total cost is linear in spec node count, no super-linear amplification"

[[sanitizer_guarantees]]
kind = "reachability"
guarantee = "parseTypeFromTypeDef is imported only by src/bindings/client.ts and src/bindings/types.ts (codegen); src/contract/client.ts imports only sanitizeIdentifier, so the walker never runs at application runtime"

[[blockers]]
kind = "severity_threshold"
guarantee = "worst-case impact is a stack-overflow crash of the local CLI binding generator (no output consumed by an app); local/dev-time inconvenience is below the Medium floor and out of scope per CLI subsystem rules"
```
