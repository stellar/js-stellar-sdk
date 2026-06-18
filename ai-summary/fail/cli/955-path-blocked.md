# F955: Path blocked: CLI contract-binding code generation integrity

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/955-path-seed.md
**Verdict**: NOT_VIABLE
**Hypothesis by**: claude-opus-4-8, high

## Path Checked

`<anonymous> -> generate`

Area seed targets: `generateAndWrite`, `generate`, `generator.generate`, `<anonymous>`.
Trust boundary: attacker-controlled contract spec reaches generation when WASM is
fetched from the network by contract ID / WASM hash (`fromContractId`,
`fromWasmHash`), parsed via `specFromWasm`, then rendered into generated
TypeScript that a downstream application compiles and trusts. The investigated
mechanism was **code injection into the generated bindings** (struct/enum/union
names, field names, function names, doc comments, UDT type references, and import
names flowing into emitted source without escaping).

## Blocker

Every spec-derived string that reaches generated code is passed through a
source-confirmed sanitizer before interpolation. Identifiers (`struct`, `enum`,
`union`, `error-enum`, field, function, param, and UDT type/import names) go
through `sanitizeIdentifier`, which replaces every character outside
`[a-zA-Z0-9_$]` with `_` (utils.ts:67), so braces, quotes, slashes, semicolons,
and whitespace cannot escape an identifier position. Free-text doc strings go
through `formatJSDocComment` -> `escapeJSDocContent`, which rewrites `*/` to
`* /` and escapes non-whitelisted `@` tags, preventing JSDoc block breakout
(utils.ts:386-397, 403-416). String-valued case/error names are emitted only
inside double-quoted literals via `escapeStringLiteral`, which escapes `\`, `"`,
`\n`, `\r`, U+2028/U+2029 (utils.ts:88-96; types.ts:170,172,221). Spec entries
are embedded as base64 (`entry.toXDR("base64")`, client.ts:43-44) and enum
values are integers from XDR decode. No unescaped spec-derived interpolation
point was found, so attacker contract metadata cannot inject executable code
into the generated bindings.

## Evidence

- `src/bindings/utils.ts:65-83` - `sanitizeIdentifier` strips all non-`[a-zA-Z0-9_$]` chars, reserved-word and leading-digit safe, fallback `_unnamed`.
- `src/bindings/utils.ts:386-416` - `escapeJSDocContent`/`formatJSDocComment` neutralize `*/` block-comment breakout and stray `@` tags in attacker doc strings.
- `src/bindings/utils.ts:88-96,195-197,254-257` - `escapeStringLiteral` for string literals; UDT type and import names also routed through `sanitizeIdentifier`.
- `src/bindings/types.ts:131-228,267-280` - struct/union/enum/error-enum/tuple generators sanitize every name and escape every doc/string before emit.
- `src/bindings/client.ts:43-44,99-123` - spec entries emitted as base64; method/param/fromJSON names sanitized; only types and base64 spec reach generated client.

## Negative Scope

- Rules out: attacker-controlled contract spec (names, fields, docs, UDT/import references) injecting executable or interface-altering code into the generated `client.ts`/`types.ts`/`index.ts` via the CLI `generate` path.
- Does not rule out: (a) the known VIABLE network-trust gap where fetched WASM is not content-hash-verified on the `fromWasmHash`/`fromContractId` fetch path (wasm_fetcher.ts:29-61,118-141 / route js-sdk-f7107932d67c6535c2ca097a) — distinct, already reported, not re-asserted here; (b) recursion-depth/entry-count resource cost in `parseTypeFromTypeDef` during generation (assessed local/dev-time only, below Medium for the CLI scope).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-e372b979e414457315f847d9"
weakness = "Generated code integrity"
record_kind = "area_seed"
path = ["<anonymous>", "generate"]
sink = "generate"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "code_generation"
target_functions = ["generateAndWrite", "generate", "generator.generate", "<anonymous>", "src/bindings/generator.ts:BindingGenerator.generate", "src/bindings/types.ts:TypeGenerator.generate", "src/bindings/client.ts:ClientGenerator.generate", "src/bindings/utils.ts:sanitizeIdentifier", "src/bindings/utils.ts:escapeJSDocContent", "src/bindings/utils.ts:escapeStringLiteral"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "wasm_spec_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["spec_names_docs_sanitized_before_codegen_no_injection"]
rules_out = ["attacker contract spec names/fields/docs/types injecting code into generated CLI bindings"]
does_not_rule_out = ["fetched WASM not content-hash-verified on fromWasmHash/fromContractId (distinct, already VIABLE js-sdk-f7107932d67c6535c2ca097a)", "parseTypeFromTypeDef recursion/entry-count cost during generation (local/dev-time, below Medium)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Attacker contract spec from network-fetched WASM reaches CLI binding generation, but all names go through sanitizeIdentifier, all docs through escapeJSDocContent, all string literals through escapeStringLiteral, and spec entries are base64, so no unescaped spec-derived value reaches emitted code."
why_failed_brief = "Every spec-derived interpolation point into generated code is source-confirmed sanitized; no code-injection vector remains on the generate path. Distinct WASM-hash-trust gap is already reported."
confidence = "high"

[[sanitizer_guarantees]]
kind = "input_sanitizer"
guarantee = "sanitizeIdentifier (utils.ts:67) replaces every non-[a-zA-Z0-9_$] char with _ for all identifier/type/import names; escapeJSDocContent (utils.ts:390) neutralizes */ and stray @ in docs; escapeStringLiteral (utils.ts:88-96) escapes quotes/backslashes/newlines in emitted string literals"

[[blockers]]
kind = "output_encoding"
guarantee = "spec entries emitted as base64 (client.ts:43-44) and enum values as integers; combined with the name/doc/string sanitizers, no attacker-controlled spec string reaches generated code unescaped"
```
