# F913: Path blocked: CLI argv deserialization through commander parse

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/913-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`runCli -> program.parse`

Area seed targets: `runCli`, `program.parse`, `parse`, `<anonymous>`.

## Blocker

`program.parse()` (src/cli/index.ts:182) hands `process.argv` to commander,
which deserializes it into a flat option set of **strings/booleans** under the
local CLI user's own trust domain — there is no attacker-controlled structured
deserialization at this sink. The only place argv is parsed into a structured
object is `JSON.parse(options.headers)` (index.ts:118), which is try/catch
wrapped and yields an HTTP-headers object the local user already controls
(prior NOT_VIABLE, high confidence). All other options (`--wasm`, `--wasm-hash`,
`--contract-id`, `--rpc-url`, `--network`, `--output-dir`, `--timeout`,
`--contract-name`, `--overwrite`, `--allow-http`) reach `createGenerator`
(src/cli/util.ts:61) as plain strings/booleans. `program.parse` only forwards;
the material security effects are downstream (network fetch / generation), not
in the argv deserialization itself.

## Per-Target Disposition

- `runCli` (index.ts:36-183): builds the `Command`, defines options, and an
  action handler. No structured argv deserialization except `JSON.parse(--headers)`.
- `program.parse` (index.ts:182): commander argv→options; produces string/bool
  options from local argv. No remote/attacker structured input.
- `parse` / `<anonymous>` (action at index.ts:72): receives the option object;
  consumes strings; only `JSON.parse` is the prior-ruled-out `--headers` path.

## Evidence

- `src/cli/index.ts:182` - `program.parse()` deserializes local `process.argv` via commander into a flat string/boolean option set.
- `src/cli/index.ts:116-122` - the sole structured argv deserialization is `JSON.parse(options.headers)`, try/catch wrapped into an HTTP-headers object the local user controls.
- `src/cli/util.ts:61-131` - option set forwards into `createGenerator`; network fetch (`fromWasmHash`/`fromContractId`) is where any material network-trust effect occurs, downstream of `program.parse`.

## Negative Scope

- Rules out: attacker-controlled structured deserialization at `program.parse`
  (commander argv→options) as a parse-integrity vulnerability; local argv yields
  only string/boolean options and the lone JSON deserializer (`--headers`) is
  guarded and yields a caller-controlled headers object.
- Does not rule out: the downstream network-derived surfaces reached through
  the parsed option set — network WASM fetch without source-proven content-hash
  verification (`BindingGenerator.fromWasmHash`/`fromContractId`, util.ts:102-128;
  separate already-VIABLE route `js-sdk-f7107932d67c6535c2ca097a`), and contract
  spec → generated bindings consumption. These are downstream of this sink and
  are not adjudicated by this argv-deserialization record.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-07d68fbe41c5eff078d1feb8"
weakness = "json_deserialization"
record_kind = "area_seed"
path = ["runCli", "program.parse"]
sink = "program.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["runCli", "program.parse", "parse", "<anonymous>", "createGenerator", "BindingGenerator.fromWasmHash"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "argv_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["argv_commander_deserialization_parse_integrity_vuln_at_program_parse"]
rules_out = ["attacker-controlled structured deserialization at commander program.parse; local argv yields only string/boolean options and the sole JSON deserializer (--headers) is try/catch-wrapped into a caller-controlled HTTP headers object"]
does_not_rule_out = ["network WASM fetch without content-hash verification via fromWasmHash/fromContractId (already-VIABLE route js-sdk-f7107932d67c6535c2ca097a)", "network/contract spec -> generated bindings consumption"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "program.parse deserializes local argv into a flat string/boolean option set; no attacker-controlled structured deserialization at the sink, and the only JSON deserializer (--headers) is guarded; material effects are downstream network/generation operations."
why_failed_brief = "argv is local-user trust and commander produces only string/boolean options; the lone structured deserializer (JSON.parse of --headers) is try/catch-wrapped into a caller-controlled headers object; program.parse only forwards to downstream sinks."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "JSON.parse(options.headers) at src/cli/index.ts:116-122 is try/catch wrapped and yields an HTTP headers object the local user already controls"

[[sanitizer_guarantees]]
kind = "type_constraint"
guarantee = "commander program.parse (src/cli/index.ts:182) produces only string/boolean option values from local argv; no nested attacker-controlled object is deserialized at the sink"

[[blockers]]
kind = "trust_boundary"
guarantee = "argv at program.parse originates from the local CLI user's own trust domain (local_user); shaping one's own argv is not a cross-trust attack"

[[blockers]]
kind = "forwarder_only"
guarantee = "program.parse forwards the parsed option set to createGenerator (src/cli/util.ts:61); any material network-trust effect happens downstream, not at the deserialization sink"
```
