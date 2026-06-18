# F942: Path blocked: residual fromWasmHash content-hash escalation yields no distinct new vuln

**Subsystem**: cli
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/cli/942-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`runCli -> parse` (escalated to the residual material route:
`runCli -> generate action -> createGenerator -> BindingGenerator.fromWasmHash -> fetchFromWasmHash -> getRemoteWasmFromHash -> specFromWasm -> Spec(buffer) -> processSpecEntryStream / TypeGenerator / ClientGenerator -> writeBindings`)

## Blocker

The residual lead (content-hash absence on `fromWasmHash`) is already recorded
VIABLE under route `js-sdk-f7107932d67c6535c2ca097a` and re-reporting is
suppressed by the duplicate rule. The escalated budget was spent hunting a
DISTINCT vulnerability on the same downstream path, and every distinct angle is
source-proven blocked: (1) codegen identifier/string/JSDoc injection is
prevented by `sanitizeIdentifier`, `escapeStringLiteral`, and
`escapeJSDocContent`; (2) the WASM custom-section parser is bounds-checked with a
strictly-advancing offset and a 32-bit-bounded LEB128 reader; (3) XDR
spec-entry decoding bounds variable-length arrays via `remainingBytes()` and
nesting via `maxDepth`. Remaining cost is linear in attacker-supplied bytes
(attacker pays its own cost), below the asymmetric-exhaustion floor.

## Evidence

- `src/bindings/wasm_fetcher.ts:118-141` (`fetchFromWasmHash`) / `:29-61`
  (`getRemoteWasmFromHash`) - no sha256-vs-requested-hash check; integrity gap
  is the already-VIABLE finding, not a new distinct vuln.
- `src/bindings/utils.ts:65-83` (`sanitizeIdentifier`) - strips all chars
  outside `[a-zA-Z0-9_$]`, so spec names cannot break out of TS identifier
  position.
- `src/bindings/utils.ts:88-96` (`escapeStringLiteral`) and `:386-416`
  (`escapeJSDocContent`/`formatJSDocComment`) - escape `"` `\` newlines and
  collapse every `*/` to `* /`, blocking string-literal and comment breakout.
- `src/bindings/types.ts:131-280` and `src/bindings/client.ts:99-149` - all
  spec-derived names/types/docs routed through the sanitizers above; spec
  entries emitted as base64 XDR.
- `src/contract/utils.ts:98-175` (`parseWasmCustomSections`) - `read()` bounds
  every access, `readVarUint32` caps at 32 bits, and `offset` advances >=2 bytes
  per loop iteration, so no infinite loop or amplification.
- `node_modules/@stellar/js-xdr/src/var-array.js:18-41` (`VarArray.read`) -
  rejects `length > reader.remainingBytes()` and enforces `maxDepth`, bounding
  XDR array allocation to the buffer size.

## Negative Scope

- Rules out: a new distinct reportable vulnerability (codegen injection,
  unbounded WASM/XDR spec parse, or parser infinite loop) on the
  `runCli -> ... -> fromWasmHash -> codegen` residual path beyond the
  already-VIABLE content-hash-absence finding.
- Does not rule out: the already-VIABLE content-hash absence itself
  (`js-sdk-f7107932d67c6535c2ca097a`); SAC-vs-wasm executable-type confusion on
  the sibling `fromContractId` path where a malicious RPC misreports the
  executable kind (integrity-verification family, not re-traced here).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "cli"
route_id = "js-sdk-4389ebdef686c89728f9ae21"
weakness = "json_deserialization"
record_kind = "residual_escalation"
path = ["runCli", "parse"]
sink = "parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["runCli", "parse", "fetchFromWasmHash", "specFromWasm", "parseWasmCustomSections", "processSpecEntryStream", "TypeGenerator.generate", "ClientGenerator.generate"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "wasm_fetched_and_spec_decoded"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["cli_fromwasmhash_codegen_injection_blocked_by_sanitizers", "cli_wasm_spec_parse_bounded_no_amplification"]
rules_out = ["new distinct reportable vulnerability on the runCli->fromWasmHash->codegen residual path beyond the already-VIABLE content-hash absence"]
does_not_rule_out = ["already-VIABLE content-hash absence js-sdk-f7107932d67c6535c2ca097a", "SAC-vs-wasm executable-type confusion on sibling fromContractId path"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "residual fromWasmHash content-hash lead is already VIABLE; distinct codegen-injection and unbounded-parse angles on the same path are source-proven blocked by sanitizers, bounds-checked section reads, and XDR remainingBytes/maxDepth limits"
why_failed_brief = "duplicate of already-VIABLE finding plus source-proven sanitization and bounded parsing leave no distinct new vulnerability"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "input_sanitizer"
guarantee = "sanitizeIdentifier strips chars outside [a-zA-Z0-9_$]; escapeStringLiteral escapes quote/backslash/newlines; escapeJSDocContent collapses */ so spec names/docs cannot break out of generated TS (src/bindings/utils.ts:65-96,386-416)"

[[sanitizer_guarantees]]
kind = "bounds_check"
guarantee = "parseWasmCustomSections read() bounds every access and offset advances >=2 bytes/iteration; XdrReader VarArray rejects length > remainingBytes and enforces maxDepth (src/contract/utils.ts:98-175; node_modules/@stellar/js-xdr/src/var-array.js:18-41)"

[[blockers]]
kind = "duplicate_finding"
guarantee = "content-hash absence on fromWasmHash already recorded VIABLE under route js-sdk-f7107932d67c6535c2ca097a; re-report suppressed by duplicate rule"
```
