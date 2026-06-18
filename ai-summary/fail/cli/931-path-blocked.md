# F931: Path blocked: residual WASM-fetch content-hash escalation already covered by VIABLE finding

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/931-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`runCli -> program.parse` (residual escalation into `createGenerator -> BindingGenerator.fromWasmHash/fromContractId -> fetchFromWasmHash/fetchFromContractId -> getRemoteWasmFromHash`)

## Blocker

The residual question is **confirmed true at source** — there is no content-hash
verification of fetched WASM — but it is **already recorded as VIABLE** under
route `js-sdk-f7107932d67c6535c2ca097a` (prior reviewed finding), so this
escalation yields no new reportable candidate. `getRemoteWasmFromHash` returns
the RPC server's `contractCode.code()` bytes verbatim with no `sha256(code) ==
requested_hash` check; `fetchFromWasmHash` validates only the 32-byte hash
length; the `fromContractId` path derives the wasm hash from the server-supplied
`instance.executable().wasmHash()`, and `verifyNetwork` only re-queries the same
untrusted server. The "blocker" here is duplication of a known VIABLE finding,
not a source defense. A source hunt for a *distinct* mechanism on this path
(unbounded WASM size, SAC type-confusion, network-verify bypass) found only
local-only/out-of-scope or same-trust-class effects, so no distinct candidate
is warranted.

## Evidence

- `src/bindings/wasm_fetcher.ts:29-61` getRemoteWasmFromHash - returns `Buffer.from(contractCode.code())` from the RPC response with no sha256-vs-hash check.
- `src/bindings/wasm_fetcher.ts:118-141` fetchFromWasmHash - only validates `hashBuffer.length === 32`; never verifies returned content against the hash.
- `src/bindings/wasm_fetcher.ts:146-165, 77-113` fetchFromContractId/fetchWasmFromContract - wasm hash itself comes from server-supplied `instance.executable().wasmHash()` (trust-the-server, no fix possible via content check).
- `src/bindings/generator.ts:151-193` fromWasmHash/fromContractId - pass server bytes straight into `BindingGenerator.fromWasm`.
- `src/cli/util.ts:46-99` createGenerator/verifyNetwork - network "verification" only compares passphrase against the same untrusted RPC server, providing no content gate.

## Negative Scope

- Rules out: a *new distinct* reportable vulnerability on the `runCli -> program.parse` residual escalation path beyond the already-VIABLE content-hash-absence finding (no separate failure mode, attacker input shape, or sibling sink survives source tracing here).
- Does not rule out: the already-VIABLE finding `js-sdk-f7107932d67c6535c2ca097a` itself (confirmed real and unchanged by this trace); downstream WASM/Spec parser behavior in the bindings layer if it were dispatched as its own route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-07d68fbe41c5eff078d1feb8"
weakness = "json_deserialization"
record_kind = "residual_escalation"
path = ["runCli", "program.parse"]
sink = "program.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["runCli", "program.parse", "src/bindings/wasm_fetcher.ts:getRemoteWasmFromHash", "src/bindings/wasm_fetcher.ts:fetchFromWasmHash", "src/bindings/generator.ts:fromWasmHash"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "argv_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["residual_wasm_content_hash_already_viable_no_distinct_new_vuln"]
rules_out = ["new distinct reportable vulnerability on runCli->program.parse residual path beyond the already-VIABLE content-hash-absence finding"]
does_not_rule_out = ["already-VIABLE route js-sdk-f7107932d67c6535c2ca097a (confirmed real, unchanged)", "downstream WASM/Spec parser behavior in bindings layer as a separate route"]
assumptions = ["no additional assumptions beyond cited source evidence"]
residual_question = "network WASM fetch without content-hash verification via fromWasmHash/fromContractId (already-VIABLE route js-sdk-f7107932d67c6535c2ca097a)"
mechanism_brief = "Residual escalation confirms at source that no sha256-vs-requested-hash verification exists on the wasm-hash or contract-id fetch path, but this is already recorded VIABLE under js-sdk-f7107932d67c6535c2ca097a; no distinct new vulnerability survives source tracing on this path."
why_failed_brief = "duplicate of already-VIABLE finding; confirmed real but not re-reported, and no distinct additional vulnerability found within budget"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "fetchFromWasmHash validates only 32-byte hash length (wasm_fetcher.ts:125), which does not bound or verify returned content; not a content-integrity guarantee"

[[blockers]]
kind = "duplicate_known_viable"
guarantee = "content-hash absence is already recorded VIABLE under route js-sdk-f7107932d67c6535c2ca097a; re-reporting suppressed per duplicate rule, and no distinct new vulnerability reachable on this path"
```
