# F900: Path blocked: wasm/xdr contract spec parse integrity in src/bindings

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/900-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> JSON.parse`

Residual question resolved: `wasm_xdr_contract_spec_parse_integrity_in_src_bindings` → **NO** material parse-integrity / code-injection vulnerability on the CLI `generate` dispatch path.

The escalation traced the full attacker-controlled flow, not just the JSON.parse grep:
`bin` → `src/cli/index.ts generate.action` → `createGenerator` → `BindingGenerator.fromWasm/fromWasmHash/fromContractId` → `specFromWasm` → `parseWasmCustomSections` + `processSpecEntryStream` (XDR) → `TypeGenerator`/`ClientGenerator` codegen → files on disk.

## Blocker

Two independent, source-proven blockers dispose of the route. (1) No `JSON.parse` is reachable from the contract-spec parse path: the network/local WASM spec is parsed as **XDR** via `cereal.XdrReader` in `processSpecEntryStream`, never a JSON deserializer; the only `JSON.parse` reachable from CLI `generate` dispatch parses the local `--headers` argument (a local-user value, no remote trust boundary). (2) The wasm→xdr→codegen integrity path sanitizes every attacker-controlled spec field before emission: identifiers via a strict allowlist `[a-zA-Z0-9_$]` (`sanitizeIdentifier`), string literals via `escapeStringLiteral` (escapes `\ " \n \r U+2028 U+2029` inside double-quoted strings), and doc comments via `escapeJSDocContent` (rewrites `*/`→`* /`, blocking JSDoc block breakout). The two hand-rolled parsers are bounded: `read()` is bounds-checked, `readVarUint32` caps at 32 bits, the section loop always advances ≥2 bytes per iteration (no zero-length stall, no infinite loop), and the XDR loop advances per entry and throws on malformed input. No unsanitized spec value reaches generated TypeScript and no unbounded parse exists.

## Evidence

- `src/contract/utils.ts:181-189` - `processSpecEntryStream` parses the spec buffer with `XdrReader`, looping `xdr.ScSpecEntry.read` per entry; XDR, not JSON, and throws on malformed bytes.
- `src/cli/index.ts:116-122` - the sole CLI-dispatch `JSON.parse` parses the local `--headers` arg, wrapped in try/catch; not network/spec data.
- `src/bindings/utils.ts:65-83` - `sanitizeIdentifier` replaces every char outside `[a-zA-Z0-9_$]` with `_`, blocking code injection through names.
- `src/bindings/utils.ts:88-96,386-416` - `escapeStringLiteral` and `escapeJSDocContent`/`formatJSDocComment` escape quote/backslash/line-terminators and `*/`, closing string and JSDoc breakout in `types.ts`/`client.ts`.
- `src/contract/utils.ts:110-172` - `parseWasmCustomSections` uses bounds-checked `read`, `readVarUint32` (32-bit cap), and `offset = start + sectionLength` after a ≥2-byte advance, so the custom-section loop is bounded and cannot stall.
- `src/bindings/client.ts:43-45,116-122` & `src/bindings/types.ts:131-228` - all emitted names/types/tags route through the sanitizers above; spec entries are emitted as base64 XDR string literals.

## Negative Scope

- Rules out: network- or attacker-controlled JSON reaching `JSON.parse` via CLI `generate` dispatch, and unsanitized attacker spec data (identifiers, string literals, doc comments) injecting executable code into generated bindings.
- Does not rule out: (a) `sanitizeIdentifier` collision where two distinct spec names map to one identifier, producing duplicate interface members / last-wins `fromJSON` keys — assessed below Medium (compile-time-only type annotations, developer-reviewed output, no remote-data mis-decode); (b) deep type recursion in `parseTypeFromTypeDef` causing a local generation-time stack overflow — local CLI crash, below Medium.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-0ffaa2a664052d27f227e6ff"
weakness = "json_deserialization"
record_kind = "residual_escalation"
path = ["<anonymous>", "JSON.parse"]
sink = "JSON.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/utils.ts:processSpecEntryStream", "src/contract/utils.ts:parseWasmCustomSections", "src/cli/index.ts:generate.action", "src/bindings/utils.ts:sanitizeIdentifier", "src/bindings/utils.ts:escapeJSDocContent"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "xdr_spec_stream"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["network_or_attacker_json_reaching_JSON.parse_via_cli_generate_dispatch", "unsanitized_spec_field_codeinjection_into_generated_bindings"]
rules_out = ["attacker JSON reaching JSON.parse via CLI generate dispatch", "attacker wasm/xdr spec field injecting executable code into generated TypeScript bindings"]
does_not_rule_out = ["sanitizeIdentifier name-collision producing duplicate generated members (assessed below Medium)", "deep parseTypeFromTypeDef recursion causing local generation-time stack overflow (below Medium)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "CLI generate parses contract spec as XDR via XdrReader (not JSON); only CLI JSON.parse handles the local --headers arg; codegen sanitizes all spec-derived identifiers, string literals, and doc comments, and both hand-rolled parsers are bounds-checked and terminating."
why_failed_brief = "spec path uses XDR not JSON, the reachable JSON.parse is local-arg only, and identifier/string/jsdoc sanitizers plus bounded parsers close code-injection and parse-corruption on this exact route."
confidence = "high"

[[sanitizer_guarantees]]
kind = "input_validation"
guarantee = "sanitizeIdentifier (src/bindings/utils.ts:65-83) reduces every spec name to [a-zA-Z0-9_$], preventing code injection via identifiers"

[[sanitizer_guarantees]]
kind = "output_encoding"
guarantee = "escapeStringLiteral and escapeJSDocContent (src/bindings/utils.ts:88-96,386-416) escape string-literal terminators and the */ comment-close, preventing string/JSDoc breakout in generated bindings"

[[blockers]]
kind = "type_mismatch"
guarantee = "contract spec is parsed as XDR via cereal.XdrReader in processSpecEntryStream (src/contract/utils.ts:181-189); no JSON deserializer is on the spec path"

[[blockers]]
kind = "bounds_check"
guarantee = "parseWasmCustomSections (src/contract/utils.ts:110-172) uses bounds-checked reads, a 32-bit LEB128 cap, and a strictly-advancing section loop, so the wasm parse is bounded and terminating"
```
