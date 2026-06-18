# F943: Path blocked: CLI WASM binding generation sanitizes attacker spec strings

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/943-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`createGenerator -> Binding ... fromWasm`

## Blocker

The area seed's distinct material mechanism — attacker-controlled WASM contract
spec data injecting code or misrepresenting the interface in emitted TypeScript
— is source-proven blocked by per-string sanitizers in the generators. Every
spec-derived identifier (function, struct, union, enum, field, UDT reference)
passes through `sanitizeIdentifier`, which strips everything outside
`[a-zA-Z0-9_$]` and prefixes leading digits, so no name can break the emitted
syntax. Every doc comment passes through `formatJSDocComment`/`escapeJSDocContent`,
which rewrites `*/` to `* /`, preventing JSDoc-block breakout. Union/enum tag
text passes through `escapeStringLiteral` inside double-quoted literals. Spec
entries are embedded as base64. The WASM custom-section and XDR-entry parsers
are O(n) with a monotonically advancing offset and a 32-bit LEB128 cap, so no
amplification. Bypass attempts (cross-replacement `*/`, template-literal `${}`
in double-quoted strings, UDT reference names) all fail.

## Evidence

- `src/bindings/utils.ts:65-83` - `sanitizeIdentifier` replaces `/[^a-zA-Z0-9_$]/g` with `_`, blocking syntax breakout via names.
- `src/bindings/utils.ts:386-397` - `escapeJSDocContent` rewrites `*/`→`* /`, blocking comment-block breakout.
- `src/bindings/utils.ts:88-96,196` - `escapeStringLiteral` escapes `\ " \n \r U+2028/9`; UDT type references re-sanitized.
- `src/bindings/types.ts:132,141,170,184,193,221,268` and `src/bindings/client.ts:44,100,102,116` - all spec strings reach output only via the above sanitizers or base64.
- `src/contract/utils.ts:128-175,181-189` - O(n) custom-section + XDR-stream parse, monotonic offset, 32-bit LEB128 cap.

## Per-Target Disposition

- `createGenerator` (src/cli/util.ts:61) - source-selection factory; forwards to fromWasm/fromWasmHash/fromContractId; no distinct sink of its own.
- `fromWasm` / `Binding ... fromWasm` (src/bindings/generator.ts:125) - spec parse bounded; codegen sanitized.
- `<anonymous>` - the action/fetch callback; its content-hash gap is already VIABLE under js-sdk-f7107932d67c6535c2ca097a (re-report suppressed per duplicate rule).

## Negative Scope

- Rules out: raw injection of attacker-controlled WASM-spec identifiers, doc comments, or union/enum tag strings into generated TypeScript on `createGenerator -> fromWasm -> generate`.
- Does not rule out: content-hash absence on the wasm-hash/contract-id fetch path (already VIABLE); `sanitizeIdentifier` collision collapsing distinct contract identifiers (likely surfaces as a visible duplicate-key compile error, below severity floor); stack-depth recursion on deeply nested `ScSpecTypeDef` (local-only generation crash, below floor).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-015da0dba1205e17ca885978"
weakness = "Untrusted contract WASM / interface parsing integrity"
record_kind = "area_seed"
path = ["createGenerator", "Binding ... romWasm"]
sink = "Binding ... romWasm"
sink_role = "contract_wasm_parse"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "contract_wasm_parse"
target_functions = ["createGenerator", "Binding ... romWasm", "<anonymous>", "fromWasm"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "wasm_fetched_and_spec_decoded"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["cli_wasm_spec_codegen_injection_blocked_by_sanitizers"]
rules_out = ["raw injection of attacker-controlled WASM-spec identifiers, doc comments, or union/enum tag strings into generated TypeScript on createGenerator->fromWasm->generate"]
does_not_rule_out = ["content-hash absence on wasm-hash/contract-id fetch (already VIABLE js-sdk-f7107932d67c6535c2ca097a)", "sanitizeIdentifier collision collapsing distinct contract identifiers (likely visible duplicate-key compile error)", "stack-depth recursion on deeply nested ScSpecTypeDef (local-only generation crash)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "CLI binding generation derives a contract spec from a supplied WASM module and emits TypeScript; the distinct injection/misrepresentation mechanism is blocked because all spec-derived strings pass through identifier, JSDoc, and string-literal sanitizers, and the parse is O(n)."
why_failed_brief = "all attacker-controlled WASM-spec strings reach generated code only via sanitizeIdentifier, escapeJSDocContent, escapeStringLiteral, or base64; spec parse is O(n) with a 32-bit LEB128 cap; the only open gap (content-hash) is already VIABLE."
confidence = "high"

[[sanitizer_guarantees]]
kind = "identifier_filter"
guarantee = "sanitizeIdentifier (src/bindings/utils.ts:65-83) strips all chars outside [a-zA-Z0-9_$] and prefixes leading digits, blocking syntax breakout via spec names"

[[sanitizer_guarantees]]
kind = "comment_escape"
guarantee = "escapeJSDocContent (src/bindings/utils.ts:386-397) rewrites */ to * /, blocking JSDoc-block breakout from spec doc strings"

[[sanitizer_guarantees]]
kind = "string_escape"
guarantee = "escapeStringLiteral (src/bindings/utils.ts:88-96) escapes backslash, quote, newline and line/paragraph separators for union/enum tag literals"

[[blockers]]
kind = "bounded_parse"
guarantee = "parseWasmCustomSections and processSpecEntryStream (src/contract/utils.ts:128-189) are O(n) with monotonic offset and a 32-bit LEB128 cap; no amplification"
```
