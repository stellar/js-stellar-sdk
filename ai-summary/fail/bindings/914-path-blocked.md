# F914: Path blocked: spec-driven TypeScript client/type code injection

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/914-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> clientGenerate` (and sibling type generators: generateEnum,
generateErrorEnum, generateUnion, generateStruct, generateTupleStruct,
generateInterfaceMethod, generateFromJSONMethod, parseTypeFromTypeDef,
configGenerate)

## Blocker

Every attacker-controlled spec value reaches the emitted TypeScript through one
of three source-confirmed sanitizers before interpolation, leaving no break-out
into executable code. All names/identifiers pass `sanitizeIdentifier`, which
strips to `[a-zA-Z0-9_$]` and prefixes/suffixes reserved or digit-leading
tokens (utils.ts:65-83); every string-literal context (union tags, error-enum
messages) passes `escapeStringLiteral` (utils.ts:88-96; types.ts:170-172,221);
all docs pass `escapeJSDocContent`, which rewrites `*/`->`* /` and escapes stray
`@` so attacker docs cannot close the JSDoc block (utils.ts:386-415). The only
raw interpolations are `entry.toXDR("base64")` (base64 alphabet) and numeric
`enumCase.value()` u32 literals — neither carries injectable characters.
`configGenerate` embeds only the caller-supplied `contractName`, not remote spec
data, and JSON-escapes/sanitizes it (config.ts:42-63). This rules out the
code-execution / source-injection mechanism for this area.

## Evidence

- `src/bindings/utils.ts:65-83` - `sanitizeIdentifier` replaces every char outside `[a-zA-Z0-9_$]` with `_`, so no name can emit quotes, braces, semicolons, or comment delimiters.
- `src/bindings/utils.ts:386-415` - `escapeJSDocContent`/`formatJSDocComment` globally rewrite `*/`->`* /` and escape non-allowlisted `@`, blocking JSDoc break-out from attacker docs.
- `src/bindings/types.ts:170-172,221` - union tags and error-enum messages are the only spec-string literals emitted and both go through `escapeStringLiteral`; enum values (193-197,259-264) are numeric u32.
- `src/bindings/client.ts:43-44,99-122` - client sink interpolates only sanitized names, parsed type strings, and base64 spec entries; no raw spec string reaches emitted code.
- `src/bindings/config.ts:42-63` - `configGenerate` uses caller `contractName` (not remote spec) and JSON.stringify/regex-sanitizes it.

## Negative Scope

- Rules out: attacker-controlled contract spec names/types/docs/enum values breaking out of identifier, string-literal, or JSDoc context to inject executable TypeScript into the generated client or types file (code-execution / source-injection).
- Does not rule out: identifier-collision / type-misrepresentation family already reported VIABLE — UDT name shadowing globals (Error/Buffer/Address/Result) and many-to-one `sanitizeIdentifier` / missing name-uniqueness across UDTs and across contract function names (affecting `generateInterfaceMethod` duplicate members and the `fromJSON` last-wins map); these are silent type confusion, not injection, and are tracked under route_id js-sdk-0283c3cad484b8dcb342fe0f and js-sdk-45bef61cba5cce008f254c75.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-764db1ecd1a0b26cd4288e42"
weakness = "generated code integrity"
record_kind = "area_seed"
path = ["<anonymous>", "clientG ... enerate"]
sink = "clientG ... enerate"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "code_generation"
target_functions = ["generate", "configG ... enerate", "generateFromJSONMethod", "sanitizeIdentifier", "generateEnum", "parseTypeFromTypeDef", "typeGen ... enerate", "generateErrorEnum", "clientG ... enerate", "visitTypeDef", "generateInterfaceMethod", "generateTupleStruct", "generateUnion", "generateStruct", "escapeStringLiteral", "escapeJSDocContent"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["identifiers_stripped_to_ascii_ident_set", "string_literals_escaped_before_emit", "jsdoc_close_sequence_rewritten"]
rules_out = ["attacker spec names/types/docs/enum values injecting executable TypeScript into emitted client or types source via identifier/string-literal/JSDoc break-out"]
does_not_rule_out = ["UDT/function name collision and global-name shadowing causing silent type misrepresentation (already VIABLE under js-sdk-0283c3cad484b8dcb342fe0f / js-sdk-45bef61cba5cce008f254c75)", "fromJSON last-wins map and duplicate interface members from many-to-one sanitizeIdentifier across function names"]
assumptions = ["no additional assumptions beyond cited source evidence", "enumCase.value() is decoded by js-xdr as a numeric u32, not a string"]
mechanism_brief = "Attacker-controlled spec names/types/docs flow into generated TS, but sanitizeIdentifier, escapeStringLiteral, and escapeJSDocContent neutralize every break-out character before interpolation; remaining raw interpolations are base64 and numeric."
why_failed_brief = "All three emit-time sanitizers source-confirmed for client and type generators; no injectable raw spec string reaches emitted code, so code-execution/injection is blocked. Collision-based type misrepresentation is a distinct, already-VIABLE family left open."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "input_sanitizer"
guarantee = "sanitizeIdentifier (utils.ts:65-83) strips all chars outside [a-zA-Z0-9_$] from every emitted name, preventing identifier-context break-out"

[[sanitizer_guarantees]]
kind = "string_escaper"
guarantee = "escapeStringLiteral (utils.ts:88-96) escapes backslash/quote/newline for all spec strings emitted as JS string literals (union tags, error-enum messages)"

[[sanitizer_guarantees]]
kind = "comment_escaper"
guarantee = "escapeJSDocContent (utils.ts:386-415) rewrites */ to * / and escapes non-allowlisted @, preventing JSDoc-comment break-out from attacker docs"

[[blockers]]
kind = "encoding_guard"
guarantee = "remaining raw interpolations are entry.toXDR(base64) and numeric u32 enum values (client.ts:43-44; types.ts:193-197), neither of which carries injectable characters"
```
