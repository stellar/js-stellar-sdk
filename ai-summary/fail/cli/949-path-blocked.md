# F949: Path blocked: CLI argv → program.parse → command dispatch into file/network/spec consumers

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/949-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> program.parse` (area_seed targets: `runCli`, `program.parse`, `parse`, `<anonymous>`)

Followed the producer past `program.parse` to the real material sinks reached
from parsed argv/options: the `generate` action handler, `createGenerator`,
`generateAndWrite`/`writeBindings`, and the network-spec → generated-TypeScript
binding pipeline.

## Blocker

Argv/options at `program.parse` belong to the local CLI user's own trust domain
(`local_user`); shaping one's own argv is not a cross-trust attack, and the
local-user filesystem sinks reached from it (`--output-dir` → `fs.rm`/`fs.writeFile`,
`--wasm` → `fs.readFile`, `--headers` JSON.parse) are local-only and out of scope.
The single cross-trust surface — a network RPC returning an attacker-controlled
contract spec via `--contract-id`/`--wasm-hash` — flows into the binding code
generator, where every spec-derived string is neutralized before interpolation:
identifiers via `sanitizeIdentifier` (strip to `[a-zA-Z0-9_$]`), string literals
via `escapeStringLiteral`, and doc comments via `escapeJSDocContent` (`*/`→`* /`).
No spec-derived value reaches generated source unescaped, so no code-injection
or interface-misrepresentation candidate survives on this path.

## Per-Target Disposition

- `runCli` / `<anonymous>` (src/cli/index.ts:36-183): builds a single `generate`
  command; all options are commander string/boolean values from local argv. No
  structured deserialization beyond the try/catch-wrapped `--headers` JSON.parse
  (line 116-122) producing a local HTTP-headers object.
- `program.parse` / `parse` (src/cli/index.ts:182): commander dispatch only;
  yields option strings, not attacker-structured objects across a trust boundary.
- Downstream file sinks (`createGenerator` src/cli/util.ts:78-79 `fs.readFile`;
  `writeBindings` src/cli/util.ts:150 `fs.rm({recursive,force})`,
  155-172 `fs.writeFile`): paths are local-user `--wasm`/`--output-dir`;
  local-only effect, out of scope.
- Network spec sink (`createGenerator` → `BindingGenerator.fromContractId`/
  `fromWasmHash` → `TypeGenerator`/`ClientGenerator`): the only cross-trust
  surface; code-generation is sanitized (see Evidence). Not viable.

## Evidence

- `src/bindings/utils.ts:65-83` - `sanitizeIdentifier` strips all chars outside `[a-zA-Z0-9_$]` and guards reserved words / leading digit; used for every func, field, struct, enum, union, and UDT type name.
- `src/bindings/utils.ts:386-415` - `escapeJSDocContent`/`formatJSDocComment` rewrite `*/`→`* /`, blocking JSDoc comment breakout for all spec doc strings.
- `src/bindings/types.ts:131-279` - struct/union/enum/error-enum/tuple-struct generation routes every name through `sanitizeIdentifier`, every tag/message through `escapeStringLiteral`, every doc through `formatJSDocComment`; enum values are XDR u32 numeric keys.
- `src/bindings/client.ts:99-122,43-45` - method/param names sanitized; specEntries emitted as base64 `toXDR` strings.
- `src/cli/util.ts:78-79,150,177-184` - local-user `--wasm`/`--output-dir` filesystem effects (local-only, out of scope).

## Negative Scope

- Rules out: attacker-controlled CLI argv/option deserialization at `program.parse` producing structured cross-trust input, and network-spec-driven code injection / comment breakout / string-literal escape into generated bindings.
- Does not rule out: the already-VIABLE `--wasm-hash` content-hash-absence integrity gap (route js-sdk-f7107932d67c6535c2ca097a); deep-recursion resource exhaustion in `parseTypeFromTypeDef` during local generation (local-only); local-user filesystem effects of `--output-dir`/`--wasm` if ever reached from a non-local caller.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-72f37f0d96b57c1b8c918538"
weakness = "Input Parsing / Deserialization Integrity"
record_kind = "area_seed"
path = ["<anonymous>", "program.parse"]
sink = "program.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["runCli", "program.parse", "parse", "<anonymous>", "createGenerator", "writeBindings", "BindingGenerator.fromContractId"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "argv_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["argv_commander_deserialization_no_cross_trust_structured_input", "network_spec_codegen_sanitized_no_injection"]
rules_out = ["attacker-structured deserialization at commander program.parse from local argv", "network-spec-driven code injection/comment-breakout/string-escape into generated TypeScript bindings"]
does_not_rule_out = ["wasm-hash content-hash-absence integrity gap (already VIABLE route js-sdk-f7107932d67c6535c2ca097a)", "deep-recursion resource exhaustion in parseTypeFromTypeDef during local generation", "local-user filesystem effects of --output-dir/--wasm"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Local argv at program.parse is same-trust; the only cross-trust input (network contract spec via --contract-id/--wasm-hash) is fully sanitized before interpolation into generated bindings (sanitizeIdentifier, escapeStringLiteral, escapeJSDocContent)."
why_failed_brief = "argv is local-user trust and downstream file sinks are local-only; the network-spec codegen sink neutralizes every spec-derived string, so no injection or interface-misrepresentation candidate survives."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "input_sanitizer"
guarantee = "sanitizeIdentifier (src/bindings/utils.ts:65-83) strips spec-derived identifiers to [a-zA-Z0-9_$] and guards reserved words/leading digit"

[[sanitizer_guarantees]]
kind = "string_escape"
guarantee = "escapeStringLiteral and escapeJSDocContent (src/bindings/utils.ts:88-96,386-398) escape quotes/backslashes and rewrite */ to block string and JSDoc comment breakout"

[[blockers]]
kind = "trust_boundary"
guarantee = "argv/options at program.parse originate from the local CLI user (local_user); shaping one's own argv is not a cross-trust attack and local filesystem sinks are out of scope"

[[blockers]]
kind = "checked_guard"
guarantee = "every spec-derived string reaching generated TypeScript passes a sanitizer/escaper before interpolation; no raw spec value is emitted into generated source"
```
