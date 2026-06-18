# F001: Path blocked: CLI JSON.parse of args and network-derived metadata

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/001-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`runCli/program.parse (generate action) -> JSON.parse`

Area seed targets adjudicated: `runCli`, `program.parse`, `<anonymous>` (generate
`.action` handler), `JSON.parse`.

## Blocker

The only `JSON.parse` sink in the CLI subsystem is `src/cli/index.ts:118`,
deserializing the `--headers` option. Its input is a local-user CLI argument, not
a value crossing a trust boundary; it is wrapped in try/catch that rethrows a
sanitized `Invalid JSON for --headers` error (`index.ts:119-121`), so malformed
JSON cannot crash the process or surface raw parser internals. The parsed object
only becomes HTTP request headers for the user's *own* RPC server
(`index.ts:143` → `serverOptions.headers` → `RpcServer`). The dispatch premise
that network-derived metadata reaches a `JSON.parse` is unsupported: network
sources (`--wasm-hash`, `--contract-id`) flow through `createGenerator`
(`util.ts:98-128`) into `BindingGenerator.fromWasmHash`/`fromContractId`, which
parse WASM/XDR contract specs — `src/bindings` contains **no** `JSON.parse`. No
attacker-controlled JSON crosses into this sink.

## Evidence

- `src/cli/index.ts:116-122` - `--headers` JSON.parse is the sole JSON sink, local-arg sourced, try/catch wrapped with a sanitized rethrow.
- `src/cli/index.ts:137-144` - parsed headers only become `serverOptions.headers` for the user's own RPC server; no downstream re-deserialization.
- `src/cli/util.ts:98-131` - network sources reach `BindingGenerator.from{WasmHash,ContractId}` (WASM/XDR), never a JSON deserializer.
- `grep "JSON.parse" src/bindings` - no matches; network contract metadata never reaches a JSON.parse sink.

## Negative Scope

- Rules out: attacker-controlled or network-derived JSON reaching a `JSON.parse` deserialization sink via CLI command dispatch (`generate` action).
- Does not rule out: integrity/parse issues in the downstream WASM/XDR contract-spec parsing under `src/bindings` (different sink family, `material_effect` not json_deserialization), or prototype-pollution-style concerns in a local-user-supplied `--headers` object (local trust boundary, below Medium).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-0ffaa2a664052d27f227e6ff"
weakness = "json_deserialization"
record_kind = "area_seed"
path = ["<anonymous>", "JSON.parse"]
sink = "JSON.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["runCli", "program.parse", "src/cli/index.ts:generate.action", "JSON.parse"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "argv_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["js-sdk-0ffaa2a664052d27f227e6ff"]
rules_out = ["network_or_attacker_json_reaching_JSON.parse_via_cli_generate_dispatch"]
does_not_rule_out = ["wasm_xdr_contract_spec_parse_integrity_in_src_bindings", "local_user_headers_object_prototype_pollution_below_medium"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Only CLI JSON.parse is the local-user --headers arg (try/catch wrapped, used as own RPC headers); network metadata flows to WASM/XDR parsing, and src/bindings has no JSON.parse."
why_failed_brief = "Sole JSON.parse sink is local-arg sourced and guarded; no network/attacker JSON crosses a trust boundary into any cli JSON deserializer."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "src/cli/index.ts:119-121 try/catch converts JSON.parse failure into a sanitized 'Invalid JSON for --headers' error; no crash or raw parser output."

[[sanitizer_guarantees]]
kind = "trust_boundary"
guarantee = "--headers JSON.parse input is a local-user CLI argument; no network or attacker-controlled value reaches it."

[[blockers]]
kind = "no_sink"
guarantee = "grep of src/bindings shows no JSON.parse; network-derived contract metadata is parsed as WASM/XDR, never via a JSON deserializer reachable from CLI dispatch."
```
