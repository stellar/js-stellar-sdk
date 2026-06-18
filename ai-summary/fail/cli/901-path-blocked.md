# F901: Path blocked: CLI JSON deserialization of argv/network/file input

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/901-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`runCli (generate command dispatch) -> JSON.parse`

Area seed target set: `runCli`, `program.parse`, `<anonymous>` action handler,
`JSON.parse`, `parse`. Re-derived from source rather than copied from the prior
NOT_VIABLE records for this route_id.

## Blocker

The only `JSON.parse` reachable from CLI command dispatch is
`JSON.parse(options.headers)` at `src/cli/index.ts:118`, whose input is the
local user's own `--headers` argv string (commander option). It is wrapped in
try/catch (rethrown as a generic "Invalid JSON" error) and its product is a
plain `Record<string,string>` passed only as outbound HTTP headers to the
user-chosen RPC server. No trust boundary is crossed: the argv author and the
header consumer are the same local principal, so this is local-only (severity
floor Low, out of scope). The generate path itself fetches contract data as
WASM bytes and parses the spec as XDR (`BindingGenerator.fromWasm` /
`fromWasmHash` in `src/cli/util.ts`), never via a JSON deserializer — matching
prior records [1]/[2]. The second `JSON.parse` in scope-adjacent source,
`Client.txFromJSON` at `src/contract/client.ts:202`, is a runtime bindings API
whose `json` argument is an application-supplied serialized AssembledTransaction
string; it is never invoked on the CLI dispatch path (`runCli` → `generate`
action → `createGenerator`), so no argv-, file-, or network-derived JSON reaches
it via the CLI.

## Evidence

- `src/cli/index.ts:116-122` - only CLI-dispatch `JSON.parse` is `options.headers`, local argv, try/catch, becomes a headers object.
- `src/cli/util.ts:61-104` - `createGenerator` fetches via `BindingGenerator.fromWasm`/`fromWasmHash` (WASM/XDR); no JSON deserialization of network/file data.
- `src/contract/client.ts:201-212` - `txFromJSON` is a runtime bindings method on `Client`, not called from CLI dispatch; `json` is caller-supplied.

## Per-Target Disposition

- `runCli` / `program.parse` / `<anonymous>` action: commander parses argv into an options object; no JSON deserialization sink here.
- `JSON.parse`: two sites total in src/cli + src/contract + src/bindings. `cli/index.ts:118` = local argv headers (out of scope). `client.ts:202` = runtime bindings API, off the CLI path.
- `parse`: TOML/commander `parse` are separate routes; the remote stellar.toml `parse` route is a distinct route_id already adjudicated (prior [4]) and is not a JSON deserializer.

## Negative Scope

- Rules out: network- or attacker-controlled JSON reaching `JSON.parse` via CLI generate dispatch; the only dispatch-reachable `JSON.parse` consumes local argv (`--headers`) inside try/catch and yields an HTTP-headers object.
- Does not rule out: `Client.txFromJSON` (`src/contract/client.ts:202`) abuse when an *application* feeds attacker-shaped serialized-transaction JSON to that runtime API — a non-CLI route that should be evaluated under the contract/transaction subsystem, not CLI dispatch.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-0ffaa2a664052d27f227e6ff"
weakness = "JSON deserialization / parse integrity"
record_kind = "area_seed"
path = ["<anonymous>", "JSON.parse"]
sink = "JSON.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["runCli", "program.parse", "<anonymous>", "JSON.parse", "parse"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "argv_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["network_or_attacker_json_reaching_JSON.parse_via_cli_generate_dispatch"]
rules_out = ["attacker-controlled JSON reaching JSON.parse via CLI generate dispatch; only dispatch-reachable JSON.parse is local argv --headers (src/cli/index.ts:118), try/catch-wrapped, yielding an HTTP-headers object"]
does_not_rule_out = ["Client.txFromJSON JSON.parse at src/contract/client.ts:202 when an application feeds attacker-shaped serialized-transaction JSON to that runtime bindings API (non-CLI route)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Only CLI-dispatch JSON.parse is local argv --headers; generate path fetches WASM/XDR, not JSON; contract-client txFromJSON is a runtime API off the CLI path."
why_failed_brief = "No argv/file/network JSON crosses a trust boundary into JSON.parse on CLI dispatch; sole sink is local-user headers (out of scope Low)."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "src/cli/index.ts:116-122 wraps JSON.parse(options.headers) in try/catch and the input is the local user's own --headers argv; no remote/file trust boundary is crossed"

[[sanitizer_guarantees]]
kind = "type_constraint"
guarantee = "src/cli/util.ts createGenerator fetches contract data as WASM and parses spec as XDR (BindingGenerator.fromWasm/fromWasmHash); no JSON deserializer on the network/file generate path"

[[blockers]]
kind = "unreachable"
guarantee = "Client.txFromJSON (src/contract/client.ts:202) is a runtime bindings method never invoked from CLI command dispatch, so no CLI argv/file/network JSON reaches it"
```
