# F984: Path blocked: Configuration-driven code generation surface

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/984-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> generate`

Area seed targets adjudicated: `generate`, `constructor`, `<anonymous>` over the
`src/bindings/` binding generator (the same generator whose spec-entry emission
was previously dismissed at `client.ts:43-44`).

## Blocker

The seed's primary hypothesis — caller/attacker configuration (network
passphrase, RPC URL, contract address) flowing into the `generate` sink without
downstream validation — does not hold: those values never reach generated code.
`BindingGenerator.generate` (src/bindings/generator.ts:226-254) validates and
forwards only `contractName`; the embedded `ConfigGenerator.generate`
(src/bindings/config.ts:27-37) destructures `contractName` alone, and the
generated client `constructor` embeds only base64 spec entries
(src/bindings/client.ts:43-44, 60-65) with `rpcUrl`/`networkPassphrase`/
`contractId` supplied by the consumer at runtime. The only attacker-controlled
input is the remote contract spec, and every spec-derived string is sanitized
before interpolation: identifiers via `sanitizeIdentifier`
(src/bindings/utils.ts:65-83, strips to `[a-zA-Z0-9_$]`), string literals via
`escapeStringLiteral` (utils.ts:88-96), doc comments via `escapeJSDocContent`
(utils.ts:386-398, neutralizes `*/`), enum/error values emitted as integers
(types.ts:194-197, 221), and spec entries as base64. No raw spec string crosses
into executable generated code.

## Evidence

- `src/bindings/generator.ts:226-254` - `generate` only consumes `contractName`; config values are never embedded in emitted code.
- `src/bindings/config.ts:27-63,120-165` - config files interpolate `contractName` into JSON (`JSON.stringify` escaped) and README markdown (non-executed text) only.
- `src/bindings/client.ts:43-44,60-65` - generated `constructor` embeds base64 spec entries; runtime options passed by caller, not baked in.
- `src/bindings/types.ts:131-228` - all struct/union/enum/error names sanitized, case tags `escapeStringLiteral`-escaped, enum values integer.
- `src/bindings/utils.ts:65-83,88-96,386-398` - identifier, string-literal, and JSDoc escapers cover the injection-relevant character classes.

## Negative Scope

- Rules out: attacker-controlled SDK configuration values (network passphrase, RPC URL, contract address) flowing into `BindingGenerator.generate`/`ConfigGenerator`/generated constructor and producing code-integrity divergence on this scope.
- Does not rule out: `sanitizeIdentifier` collision between distinct spec names mapping to one TS identifier (potential generated-interface misrepresentation / duplicate `fromJSON` key); untraced for runtime dispatch impact and likely caller-visible at compile time.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-04ce42a44c26c2e20e582d55"
weakness = "Generated Code Integrity"
record_kind = "area_seed"
path = ["<anonymous>", "generate"]
sink = "generate"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "code_generation"
target_functions = ["src/bindings/generator.ts:generate", "src/bindings/config.ts:generate", "src/bindings/client.ts:generate", "src/bindings/types.ts:generate"]
scope.trust_boundary = "application_configuration"
scope.protocol_phase = "sdk_configuration"
scope.auth_state = "caller_configured"
scope.attacker_control = "configuration_values"
scope.parser_state = "configuration_loaded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["config_values_not_embedded_in_generated_code", "spec_strings_sanitized_before_codegen_no_injection"]
rules_out = ["caller/attacker SDK configuration values reaching generate and diverging generated code integrity"]
does_not_rule_out = ["sanitizeIdentifier collision causing generated-interface misrepresentation or duplicate fromJSON key on the same generator"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "generate consumes only contractName; config values are not embedded and all remote spec strings pass identifier/string-literal/JSDoc escapers or are base64/integer encoded before interpolation."
why_failed_brief = "Config values never flow into generated code and every attacker-controlled spec string is sanitized before code emission on this route."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "input_sanitizer"
guarantee = "spec identifiers stripped to [a-zA-Z0-9_$] (utils.ts:65-83); string literals escaped (utils.ts:88-96); JSDoc */ neutralized (utils.ts:386-398); spec entries base64 and enum values integer"

[[blockers]]
kind = "data_flow"
guarantee = "generate/ConfigGenerator embed only contractName; rpcUrl/networkPassphrase/contractId are not written into generated code (generator.ts:226-254, config.ts:27-63, client.ts:60-65)"
```
