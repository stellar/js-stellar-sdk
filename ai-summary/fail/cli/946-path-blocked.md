# F946: Path blocked: unbounded ScSpecTypeDef recursion is a local-only codegen crash

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/946-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`createGenerator -> Binding ... romWasm`

(concretely: `createGenerator` -> `BindingGenerator.fromWasm` -> `new Spec(specFromWasm(...))` -> `TypeGenerator` -> `parseTypeFromTypeDef`)

## Resolution of Residual Question

The escalated lead resolves to a concrete **YES on the mechanism, NO on
reportable impact**. `parseTypeFromTypeDef` (src/bindings/utils.ts:101-202) is
genuinely recursive with no depth counter, recursing into `vec().elementType()`,
`map().keyType()/valueType()`, `tuple().valueTypes()`, and
`result().okType()/errorType()`. A deeply nested `ScSpecTypeDef`
(e.g. `Vec<Vec<Vec<...>>>`) — whether it overflows during js-xdr decode of the
spec or during this generation walk — produces a `RangeError: Maximum call
stack size exceeded`.

## Blocker

The material effect is a local-only code-generation crash that produces **no
output**. The crash throws before `generate()` returns any TypeScript, so there
is no malicious generated artifact for a real application to consume — the CLI
command simply aborts on a malformed/hostile contract spec. Per the objective
SEVERITY_SCALE and the CLI subsystem summary ("Local-only inconvenience and
testnet-only behavior are low severity and out of scope"; "Production impact
usually requires generated output or network-derived data to be consumed by a
real application"), a clean abort of a developer codegen step with no
transaction, signing, auth, or persisted-output consequence is **Low and out of
scope**. It does not reach the Medium minimum: no integrity loss, no fund
movement, no transaction/auth confusion, and no unbounded hang (a stack
overflow is a bounded terminal crash, not amplified resource exhaustion).

## Evidence

- `src/bindings/utils.ts:101-202` - `parseTypeFromTypeDef` recurses on Vec/Map/Tuple/Result element types with no depth guard.
- `src/bindings/generator.ts:125-128` - `fromWasm` builds a `Spec` then `generate()` walks types; a thrown RangeError yields no `GeneratedBindings`.
- `src/cli/util.ts:78-110` - all three sources (local `--wasm`, `--wasm-hash`, `--contract-id`) terminate in `BindingGenerator.fromWasm`; the crash aborts the command with no produced output.

## Negative Scope

- Rules out: stack-depth recursion on deeply nested `ScSpecTypeDef` during CLI binding generation as a Medium+ reportable finding (effect is a local-only codegen crash producing no consumable output).
- Does not rule out: the shared recursive Spec/XDR decode reached via the non-codegen `Client.fromWasm`/`Spec.fromWasm` production path (src/contract/client.ts:176-177, src/contract/spec.ts:504) if a deeply nested spec from a remote response can crash a live application flow whose result is consumed — a distinct route outside this CLI codegen seed.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-015da0dba1205e17ca885978"
weakness = "contract_wasm_parse"
record_kind = "residual_escalation"
path = ["createGenerator", "Binding ... romWasm"]
sink = "Binding ... romWasm"
sink_role = "contract_wasm_parse"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/utils.ts:parseTypeFromTypeDef", "src/bindings/generator.ts:fromWasm", "src/cli/util.ts:createGenerator"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "wasm_fetched_and_spec_decoded"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["cli_wasm_spec_nested_recursion_local_crash_below_medium"]
rules_out = ["deeply nested ScSpecTypeDef stack-depth recursion in CLI binding generation as a Medium+ finding; crash produces no consumable generated output"]
does_not_rule_out = ["recursive Spec/XDR decode reached via non-codegen Client.fromWasm/Spec.fromWasm production path consumed by a live application"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "parseTypeFromTypeDef recurses on Vec/Map/Tuple/Result element types with no depth bound; deeply nested ScSpecTypeDef overflows the stack and throws RangeError"
why_failed_brief = "mechanism confirmed real but effect is a local-only codegen crash producing no output; below Medium minimum and out of scope per CLI subsystem policy"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "generation throws before returning any GeneratedBindings, so no malicious generated TypeScript artifact is produced for an application to consume"

[[blockers]]
kind = "severity_floor"
guarantee = "effect is a bounded local-only generation crash (RangeError) with no transaction/auth/integrity/output consequence; Low and out of scope, below Medium minimum"
```
