# F932: Path blocked: CLI json deserialization via runCli -> parse

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/932-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`runCli -> parse`

Area seed targets: `runCli`, `program.parse`, `parse`, `<anonymous>` (the
`generate` `.action` callback).

## Blocker

The only explicit JSON deserializer reachable from CLI command dispatch is
`JSON.parse(options.headers)` at `src/cli/index.ts:118`. It is try/catch-wrapped
(throws a flat "Invalid JSON" error on failure), its input is the local CLI
user's own `--headers` argument (local_user trust domain, not cross-trust), and
its product is only an HTTP-headers object forwarded to the user's own RPC
request via `serverOptions.headers`. `program.parse()` (`src/cli/index.ts:182`)
is commander argv parsing in the same local-user domain, yielding only
strings/booleans. All network-derived contract data fetched via
`createGenerator` (`fromWasmHash`/`fromContractId`) is consumed through XDR
decoding (`server.getLedgerEntries` then `xdr.LedgerKey`/`contractCode`/
`contractData`) and raw WASM byte parsing, never through a JSON deserializer
with parse-integrity security impact. A repo-scoped grep confirms no other
`JSON.parse` exists in `src/cli`, `src/bindings`, or `src/rpc`.

## Evidence

- `src/cli/index.ts:116-122` - sole reachable `JSON.parse` is `--headers`, try/catch-wrapped, local-user input, yields HTTP-headers object.
- `src/cli/index.ts:182` - `program.parse()` is commander argv parsing in local-user trust domain (strings/booleans only).
- `src/bindings/wasm_fetcher.ts:42-54,84-102` - network contract data is decoded via `getLedgerEntries` + `xdr.*`, not JSON deserialization, before WASM bytes flow to the generator.
- `grep JSON.parse src/cli src/bindings src/rpc` - returns only `src/cli/index.ts:118`; no JSON deserializer of file/network data feeds binding output.

## Negative Scope

- Rules out: attacker-controlled JSON deserialization with parse-integrity impact on the `runCli -> parse` path; the only JSON deserializer is the local-user, try/catch-wrapped `--headers` parse, and network contract data is XDR/WASM-decoded.
- Does not rule out: the already-VIABLE content-hash absence on `fromWasmHash` (route js-sdk-f7107932d67c6535c2ca097a, different weakness family — integrity verification, not json_deserialization), nor WASM-spec-driven binding code generation reaching generated output (code-generation family, distinct sink in `src/bindings/generator.ts`).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-4389ebdef686c89728f9ae21"
weakness = "json_deserialization"
record_kind = "area_seed"
path = ["runCli", "parse"]
sink = "parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["runCli", "program.parse", "parse", "<anonymous>"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "argv_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["cli_json_deserialization_parse_integrity_no_remote_or_file_json_reaches_parse"]
rules_out = ["attacker-controlled JSON deserialization with parse-integrity impact on runCli->parse; sole reachable JSON.parse is local-user try/catch-wrapped --headers, network contract data is XDR/WASM-decoded"]
does_not_rule_out = ["already-VIABLE content-hash absence on fromWasmHash (js-sdk-f7107932d67c6535c2ca097a, integrity-verification family)", "WASM-spec-driven binding code generation in src/bindings/generator.ts (code-generation family)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "CLI generate dispatch exposes one JSON deserializer (--headers JSON.parse), which is local-user, try/catch-wrapped, and produces an HTTP-headers object; network-derived contract data is decoded via XDR/WASM, not via a JSON deserializer with parse-integrity impact."
why_failed_brief = "Only reachable JSON deserializer is local-user --headers parse; no remote/file JSON reaches a parse-integrity sink, and network contract data is XDR/WASM-decoded."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "src/cli/index.ts:116-122 wraps the sole reachable JSON.parse (--headers) in try/catch and the input is local-user argv, not cross-trust"

[[sanitizer_guarantees]]
kind = "type_decode"
guarantee = "src/bindings/wasm_fetcher.ts:42-102 consumes network contract data via xdr.* decoding and raw WASM bytes, not via a JSON deserializer"

[[blockers]]
kind = "trust_boundary"
guarantee = "program.parse and --headers JSON.parse operate entirely within the local CLI user's own trust domain; shaping one's own argv/headers is not a cross-trust deserialization attack"
```
