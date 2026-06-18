# F955: Path blocked: spec-derived identifiers into generated TypeScript client source

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/955-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> sanitizeIdentifier`

Area seed with two targets (`<anonymous>` spec-driven generator entrypoints and
`sanitizeIdentifier`). Both the `TypeGenerator` family (`src/bindings/types.ts`)
and the `ClientGenerator` family (`src/bindings/client.ts`) were traced for any
spec-derived value reaching emitted TypeScript source without neutralization.

## Blocker

Every spec-derived *name* (func, input, field, struct, union, enum, error,
UDT type) is passed through `sanitizeIdentifier` which strips to
`[a-zA-Z0-9_$]` (utils.ts:65-83), so no TS-injectable character survives in an
identifier position. Every spec-derived *type* resolves through
`parseTypeFromTypeDef` to a fixed vocabulary plus sanitized UDT names
(utils.ts:101-201). Every spec-derived *doc* passes through `formatJSDocComment`
→ `escapeJSDocContent`, which rewrites the comment-close `*/`→`* /` and escapes
stray `@` tags (utils.ts:386-416). Spec names emitted inside double-quoted
string literals (union tags, error messages) are run through
`escapeStringLiteral` (utils.ts:88-96, types.ts:170-172,221). The only raw
interpolations are numeric u32 enum/error values (types.ts:197,221), which are
codec-typed `uint32` Numbers, and `entry.toXDR("base64")` (client.ts:44), a
base64 string wrapped in quotes — neither can carry TS-injectable characters.

## Evidence

- `src/bindings/utils.ts:65-83` - `sanitizeIdentifier` replaces all chars outside `[a-zA-Z0-9_$]` with `_`, leading-digit and reserved-word safe.
- `src/bindings/utils.ts:386-398` - `escapeJSDocContent` rewrites `*/`→`* /`, neutralizing JSDoc-block-break injection from `doc()` fields.
- `src/bindings/utils.ts:88-96` - `escapeStringLiteral` escapes `\`, `"`, newlines and U+2028/U+2029 for names emitted in double-quoted literals.
- `src/bindings/utils.ts:101-201` - `parseTypeFromTypeDef` returns only a fixed type vocabulary or `sanitizeIdentifier(udt name)`; raw `c.types.join` is therefore safe.
- `src/bindings/types.ts:184-203,209-227` - the only unescaped interpolations (`${caseValue}`, `${c.value}`) are XDR `uint32` Numbers from `enumCase.value()` (types.ts:194,263).
- `src/bindings/client.ts:43-44,99-122,154-190` - method/param/deploy emission interpolates only sanitized names, fixed-vocab types, base64 spec entries, and escaped docs.

## Negative Scope

- Rules out: attacker-controlled spec names, types, funcs, fields, tags, docs, enum values, or serialized spec entries injecting executable TypeScript into generated `types.ts`/`client.ts` output via the TypeGenerator/ClientGenerator family.
- Does not rule out: runtime value/result decoding in `src/contract/spec.ts` (ScVal↔native type confusion) and the runtime `this[sanitizeIdentifier(method)]` property-assignment path in `src/contract/client.ts:131` — different sinks, not code-generation integrity.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-a7b32e6177a6e7a129c7468b"
weakness = "generated-code integrity from spec-derived identifiers"
record_kind = "area_seed"
path = ["<anonymous>", "sanitizeIdentifier"]
sink = "sanitizeIdentifier"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "code_generation"
target_functions = ["src/bindings/utils.ts:sanitizeIdentifier", "src/bindings/utils.ts:formatJSDocComment", "src/bindings/utils.ts:escapeJSDocContent", "src/bindings/utils.ts:escapeStringLiteral", "src/bindings/utils.ts:parseTypeFromTypeDef", "src/bindings/types.ts:TypeGenerator", "src/bindings/client.ts:ClientGenerator"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["identifiers_stripped_to_ascii_ident_set", "jsdoc_close_sequence_rewritten", "string_literal_names_escaped", "types_fixed_vocab_or_sanitized_udt", "raw_interpolations_numeric_u32_or_base64_only"]
rules_out = ["attacker spec names/types/funcs/fields/tags/docs/enum-values/spec-entries injecting executable TypeScript into generated types.ts or client.ts via the TypeGenerator/ClientGenerator family"]
does_not_rule_out = ["runtime ScVal/native value-and-result decoding type confusion in src/contract/spec.ts", "runtime property assignment this[sanitizeIdentifier(method)] in src/contract/client.ts:131"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "All spec-derived names go through sanitizeIdentifier ([a-zA-Z0-9_$]); types resolve to fixed vocabulary or sanitized UDT names; docs are escaped by escapeJSDocContent (*/ -> * /); string-literal names by escapeStringLiteral; the only raw interpolations are uint32 numeric values and base64 spec entries, neither TS-injectable."
why_failed_brief = "Identifier, type, doc, and string-literal neutralization on every spec-derived emission leaves only numeric/base64 raw interpolations, so no code injection into generated source is reachable."
confidence = "high"

[[sanitizer_guarantees]]
kind = "input_sanitizer"
guarantee = "sanitizeIdentifier (utils.ts:65-83) strips all chars outside [a-zA-Z0-9_$] from every emitted identifier"

[[sanitizer_guarantees]]
kind = "comment_escaper"
guarantee = "escapeJSDocContent (utils.ts:386-398) rewrites comment-close */ to * / and escapes stray @ tags before docs reach JSDoc blocks"

[[sanitizer_guarantees]]
kind = "string_literal_escaper"
guarantee = "escapeStringLiteral (utils.ts:88-96) escapes backslash, double-quote, newlines and line/paragraph separators for names emitted in double-quoted literals"

[[blockers]]
kind = "type_constraint"
guarantee = "the only unescaped interpolations are uint32 enum/error values (types.ts:197,221) and base64 spec entries (client.ts:44), which cannot carry TS-injectable characters"
```
