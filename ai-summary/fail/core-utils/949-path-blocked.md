# F949: Path blocked: contract event/auth ScVal conversion to native

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/949-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`extractEvent -> scValToNative`

Area seed sibling targets also adjudicated: `authorizeEntry`, `nativeToScVal`,
`addSacTransferOperation`, `scValToNative`, `<anonymous>`.

## Blocker

The one genuinely viable weakness on `scValToNative` — decode-by-ScVal-tag with
no declared spec-type comparison — is already recorded VIABLE under route
`js-sdk-26a2c419baf9cb084b019288`. Re-entering it through `extractEvent` is a
typed duplicate; moreover events carry no declared spec type, so there is no
type contract for an event ScVal to violate (`events.ts:24-31`). The remaining
event-specific angle (scvMap key collapse) is already NOT_VIABLE because the
malicious contract/RPC server injecting the colliding keys already fully
controls the decoded value (priors [3]/[4], below Medium). `extractEvent`'s
contractId sink (`StrKey.encodeContract` → `encodeCheck`, no length guard) is
bounded by the XDR `Hash` type (fixed 32 bytes) and only re-encodes a
server-controlled value. `authorizeEntry` verifies the signature against the
preimage hash (`auth.ts:193-195`) and signs a caller-supplied entry/invocation
(caller responsibility). `nativeToScVal`/`addSacTransferOperation` consume only
caller-configured, bounds-validated arguments (`transaction_builder.ts:725-768`).

## Per-Target Disposition

- `extractEvent` (`events.ts:14-33`): sinks are `scValToNative` (topics/data) and
  `StrKey.encodeContract` (contractId). No distinct Medium+ mechanism — see
  blocker.
- `scValToNative`: decode-by-tag confusion already VIABLE under
  `js-sdk-26a2c419baf9cb084b019288`; do not re-report. Event decode has no
  declared type to deviate from.
- `authorizeEntry` (`auth.ts:134-239`): signature verified at 193-195; entry and
  invocation tree are caller-supplied input (doc line 279). Signing caller-chosen
  data is caller responsibility (cf. js-sdk-0c7fd0f9cb24e9cff64db9ee).
- `nativeToScVal`: caller-configured (prior js-sdk-63809a71507c05b9211d309d).
- `addSacTransferOperation` (`transaction_builder.ts:719-796`): caller args with
  positive/bounds/address validation; no remote attacker input.

## Evidence

- `src/base/events.ts:24-31` - topics/data pass to `scValToNative` with no
  declared spec type; only event-specific risk is the already-NOT_VIABLE map-key collapse.
- `src/base/strkey.ts:438-458` - `encodeCheck` has no length guard, but contractId
  is an XDR `Hash` (32 bytes) and the value is server-controlled, granting no new capability.
- `src/base/auth.ts:193-195` - signature is verified against the payload hash before being written into the entry.
- `src/base/transaction_builder.ts:725-768` - SAC transfer amount/fee/destination are caller args with explicit bounds and address validation.

## Negative Scope

- Rules out: a DISTINCT Medium+ finding on the `extractEvent -> scValToNative`
  event-decode path, and on the caller-configured `nativeToScVal` /
  `addSacTransferOperation` / `authorizeEntry` builders.
- Does not rule out: the already-recorded VIABLE `scValToNative` decode-by-tag
  weakness (route js-sdk-26a2c419baf9cb084b019288), nor remote-RPC trust
  confusion on other entry paths into `scValToNative`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-7a324b916fb2b6eeb0a7caca"
weakness = "contract spec conversion / contract interface integrity"
record_kind = "area_seed"
path = ["extractEvent", "scValToNative"]
sink = "scValToNative"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["authorizeEntry", "nativeToScVal", "addSacTransferOperation", "extractEvent", "scValToNative"]
scope.trust_boundary = "application_configuration"
scope.protocol_phase = "sdk_configuration"
scope.auth_state = "caller_configured"
scope.attacker_control = "configuration_values"
scope.parser_state = "configuration_loaded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = ["contract_spec_typing"]
negative_claim.rules_out_codes = ["scvaltonative_decode_confusion_already_viable_subsumed", "event_decode_has_no_declared_spec_type", "auth_entry_signing_is_caller_responsibility_signature_verified", "builder_inputs_caller_configured_bounds_validated"]
rules_out = ["distinct Medium+ finding on extractEvent->scValToNative event decode and on caller-configured nativeToScVal/addSacTransferOperation/authorizeEntry builders"]
does_not_rule_out = ["scValToNative decode-by-tag weakness already VIABLE under js-sdk-26a2c419baf9cb084b019288", "remote-RPC trust confusion on other scValToNative entry paths"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "extractEvent feeds event topics/data to scValToNative (no declared spec type, so no type contract to violate) and re-encodes an XDR-fixed 32-byte contractId; authorizeEntry verifies the signature and signs caller-supplied entries; nativeToScVal/addSacTransferOperation take caller-configured bounds-validated args."
why_failed_brief = "the only viable scValToNative weakness is already recorded VIABLE (route js-sdk-26a2c419baf9cb084b019288); event decode has no declared type to deviate from; map-key collapse is below-Medium injector-controls-value; auth/builder targets are caller-configured."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "authorizeEntry verifies signer signature against the preimage hash before writing it into the entry (auth.ts:193-195)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "addSacTransferOperation validates amount positivity, i64/u32 bounds, and destination strkey before building (transaction_builder.ts:725-768)"

[[blockers]]
kind = "duplicate_finding"
guarantee = "scValToNative decode-by-ScVal-tag confusion already recorded VIABLE under route js-sdk-26a2c419baf9cb084b019288; new entry via extractEvent is a typed duplicate"

[[blockers]]
kind = "value_already_controlled"
guarantee = "event scvMap key collapse and contractId re-encoding only reshape a value the malicious contract/RPC server already fully controls (XDR Hash fixed 32 bytes), granting no new capability; below Medium"
```
