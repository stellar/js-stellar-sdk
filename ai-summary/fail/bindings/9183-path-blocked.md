# F9183: Path blocked: spec-driven TS generation through identifier sanitization

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/9183-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> sanitizeIdentifier`

Area seed over the generator family (`TypeGenerator` and `ClientGenerator`):
`generate`, `generateStruct`, `generateTupleStruct`, `generateUnion`,
`generateUnionCase`, `generateEnum`, `generateErrorEnum`, `generateEnumCase`,
`generateInterfaceMethod`, `generateFromJSONMethod`, `generateDeployMethod`,
`parseTypeFromTypeDef`, `visitTypeDef`, `sanitizeIdentifier`.

## Blocker

Every attacker-controlled spec field that reaches an emitted TypeScript
identifier position is routed through `sanitizeIdentifier`, which strips the
entire input to the ASCII identifier-safe set `[a-zA-Z0-9_$]` (`_` substituted
for anything else), de-conflicts reserved words, and fixes leading-digit/empty
cases (utils.ts:65-83). Every spec field that reaches a string-literal position
(union/error tags) is routed through `escapeStringLiteral` (utils.ts:88-96),
and every doc string is routed through `escapeJSDocComment`, which rewrites the
`*/` close sequence (utils.ts:386-398). The only raw interpolations are numeric
u32 enum values (types.ts:197,221) and `entry.toXDR("base64")` (client.ts:44),
neither of which carries injectable characters. UDT type names are themselves
sanitized inside `parseTypeFromTypeDef`/`visitTypeDef` (utils.ts:196,256), so
the type and import positions are equally constrained. The remaining adversarial
shape — many distinct names colliding to one sanitized identifier — manifests in
emitted *source* as a TypeScript duplicate-identifier compile error (build-time,
local-dev, below Medium) or a runtime-erased type-only difference; the single
runtime-material collision (last-wins method dispatch) is the already-VIABLE
route [4] in `src/contract` (route_id js-sdk-764db1ecd1a0b26cd4288e42), not the
generator.

## Per-Target Disposition

- `generateStruct`/`generateTupleStruct`/`generateUnion`/`generateEnum`/
  `generateErrorEnum` (types.ts:131-280): names sanitized, tags escaped,
  types from `parseTypeFromTypeDef`, enum values numeric — no raw injectable
  interpolation. Collisions across UDT names → duplicate `export interface`/
  `export type`/`export enum` = TS compile error, not silent confusion.
- `generateInterfaceMethod`/`generateFromJSONMethod`/`generateDeployMethod`
  (client.ts:99-149): method, input, and output names all sanitized.
  Interface method-name collisions merge as TS overloads (compile clean), but
  the runtime last-wins selection is route [4]; the generator only emits source.
- `parseTypeFromTypeDef`/`visitTypeDef` (utils.ts:101-301): UDT names sanitized
  before reaching type/import positions.
- `sanitizeIdentifier` (utils.ts:65-83): full-charset strip confirmed.

## Evidence

- `src/bindings/utils.ts:65-83` - `sanitizeIdentifier` strips all non-`[a-zA-Z0-9_$]` to `_`, handles reserved/leading-digit/empty.
- `src/bindings/utils.ts:386-398` - `escapeJSDocContent` rewrites `*/` to `* /` so doc strings cannot close the JSDoc block.
- `src/bindings/utils.ts:196,256` - UDT type names sanitized before emission into type and import positions.
- `src/bindings/types.ts:132-221` - struct/union/enum/error names sanitized, tags via `escapeStringLiteral`, enum values numeric.
- `src/bindings/client.ts:100,102,116,138` - all client method/input/output identifiers sanitized; only raw interpolations are base64 XDR and numeric values.

## Negative Scope

- Rules out: attacker-controlled spec names, type names, function names, field names, union/error tags, docs, or enum values injecting executable TypeScript (identifier break-out, string-literal break-out, or JSDoc close-sequence break-out) into the generated types/client source via the generator family.
- Does not rule out: the already-VIABLE runtime last-wins method-collision in `src/contract` ContractClient (route_id js-sdk-764db1ecd1a0b26cd4288e42); build-time duplicate-identifier compile failure from sanitized-name collisions (below Medium floor, local-dev).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-310bbe7b42cb719afc52c1fd"
weakness = "generated code integrity"
record_kind = "area_seed"
path = ["<anonymous>", "sanitizeIdentifier"]
sink = "sanitizeIdentifier"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "code_generation"
target_functions = ["generate", "generateStruct", "generateTupleStruct", "generateUnion", "generateUnionCase", "generateEnum", "generateErrorEnum", "generateEnumCase", "generateInterfaceMethod", "generateFromJSONMethod", "generateDeployMethod", "parseTypeFromTypeDef", "visitTypeDef", "sanitizeIdentifier"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["identifiers_stripped_to_ascii_ident_set", "string_literals_escaped", "jsdoc_close_sequence_rewritten", "udt_type_names_sanitized", "numeric_values_only_in_raw_interpolation"]
rules_out = ["attacker spec names/types/funcs/fields/tags/docs/enum values injecting executable TypeScript into the generated types or client source via the TypeGenerator/ClientGenerator family"]
does_not_rule_out = ["runtime last-wins method-name collision in src/contract ContractClient (route_id js-sdk-764db1ecd1a0b26cd4288e42, already VIABLE)", "build-time TS duplicate-identifier compile failure from sanitized-name collisions (below Medium, local-dev)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Generator family routes every attacker-controlled identifier through sanitizeIdentifier (full non-ident charset strip), every string literal through escapeStringLiteral, and every doc through escapeJSDocContent (*/ rewrite); only raw interpolations are numeric enum values and base64 XDR, so no TS injection survives. Identifier collisions in emitted source are TS compile errors or type-erased, not runtime-material here."
why_failed_brief = "All attacker-controlled identifier, string-literal, and doc positions in the generator are sanitized/escaped; numeric and base64 raw interpolations carry no injectable characters; the only runtime-material collision is the already-covered src/contract route."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "identifier_strip"
guarantee = "sanitizeIdentifier replaces every character outside [a-zA-Z0-9_$] with _ and de-conflicts reserved/leading-digit/empty (utils.ts:65-83), applied at every emitted identifier and at UDT type/import positions (utils.ts:196,256; types.ts:132-268; client.ts:100-138)"

[[sanitizer_guarantees]]
kind = "string_literal_escape"
guarantee = "escapeStringLiteral escapes backslash, double-quote, CR/LF and U+2028/U+2029 before union/error tags are interpolated into double-quoted literals (utils.ts:88-96; types.ts:170,172,221)"

[[sanitizer_guarantees]]
kind = "jsdoc_escape"
guarantee = "escapeJSDocContent rewrites the */ close sequence to '* /' so doc strings cannot break out of the JSDoc block (utils.ts:386-398)"

[[blockers]]
kind = "no_raw_attacker_string"
guarantee = "the only raw (unsanitized/unescaped) interpolations in the generator are numeric u32 enum values (types.ts:197,221) and entry.toXDR(base64) (client.ts:44), neither of which can carry TS-injectable characters"
```
