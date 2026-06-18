# F002: Path blocked: Host-value conversion of caller input through contract spec helpers

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/002-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> nativeToScVal`

Sibling target set traced: `nativeToScVal`, `scValToNative`, `addSacTransferOperation`, `extractEvent`, `authorizeEntry`.

## Blocker

The two spec-class conversion weaknesses in this cluster (declared-type-vs-tag decode confusion and the BytesN/enum encode/decode gaps in `src/contract/spec.ts`) are already recorded VIABLE under routes `js-sdk-26a2c419baf9cb084b019288`, `js-sdk-a7b32e6177a6e7a129c7468b`, and `js-sdk-3d586da60823b3f0f83266b1`; this seed must hunt distinct mechanisms, not restate them. The remaining distinct targets fail for separate, source-confirmed reasons: the standalone `scValToNative` (`src/base/scval.ts`) decodes purely by ScVal tag with no declared type to deviate from, and its `scvMap` decode uses `Object.fromEntries`, which writes `__proto__` as an own property (verified: no prototype pollution, global unaffected) — only Low map-key collision remains. `addSacTransferOperation` and `authorizeEntry` consume only caller-configured values (validated bounds, source-account credentials, callback signature verified against the payload at `auth.ts:193`), so no remote/attacker trust boundary is crossed and the Medium floor is not met.

## Evidence

- `src/base/scval.ts:403-409` - standalone `scValToNative` scvMap decode uses `Object.fromEntries`; verified empirically that `__proto__` becomes an own property (no prototype pollution), so the remote-event decode is faithful-by-tag.
- `src/base/events.ts:14-33,48-60` - `extractEvent`/`humanizeEvents` are app-invoked utilities over remote events that simply forward to the faithful standalone `scValToNative`; `src/rpc/parsers.ts:96-119` returns event topic/value as raw `xdr.ScVal`, so the SDK never auto-decodes remote events to native.
- `src/base/transaction_builder.ts:719-796` - `addSacTransferOperation` validates amount (`>0`, `<= i64 max`), destination strkey, and source-account auth credentials entirely from caller-supplied arguments; no remote or attacker input.
- `src/base/auth.ts:134-195` - `authorizeEntry` no-ops source-account creds and verifies the signature against the signed payload (`Keypair...verify`, line 193) before attaching; signer/publicKey are caller-controlled.

## Negative Scope

- Rules out: prototype pollution or non-tag decode confusion in the standalone `scValToNative`/`extractEvent` remote-event path; cross-boundary tampering of SAC transfer args or auth-entry signatures from non-caller input.
- Does not rule out: (1) the already-VIABLE spec-class `Spec.scValToNative`/`Spec.nativeToScVal` declared-type/BytesN/enum weaknesses (tracked separately, not this seed); (2) Low-severity scvMap key-collision/non-string-key coercion in standalone `scValToNative` (below Medium floor); (3) `authorizeEntry` deprecated-callback public_key labeling on nested CAP-71 delegate nodes under a caller-supplied signer (caller-responsibility, network-rejected on mismatch).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-63809a71507c05b9211d309d"
weakness = "contract_spec_conversion"
record_kind = "area_seed"
path = ["<anonymous>", "nativeToScVal"]
sink = "nativeToScVal"
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
defense_tags = []
negative_claim.rules_out_codes = ["standalone_scvaltonative_faithful_tag_decode", "objectfromentries_no_proto_pollution", "sac_transfer_and_authorizeentry_caller_configured_only"]
rules_out = ["prototype pollution or non-tag decode confusion in standalone scValToNative/extractEvent remote-event decode", "cross-boundary tampering of SAC transfer args or auth-entry signatures from non-caller input"]
does_not_rule_out = ["already-VIABLE spec-class Spec.scValToNative/Spec.nativeToScVal declared-type, BytesN, and enum weaknesses (separate routes)", "Low scvMap key-collision/non-string-key coercion in standalone scValToNative", "authorizeEntry deprecated-callback public_key labeling on nested CAP-71 delegate nodes under caller-supplied signer"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Standalone scValToNative decodes remote events faithfully by ScVal tag (scvMap via Object.fromEntries, no proto pollution); addSacTransferOperation and authorizeEntry only consume caller-configured, bounds-validated input with source-account credentials and payload-verified signatures, so no attacker-crossing Medium+ conversion mechanism remains distinct from the already-VIABLE spec.ts findings."
why_failed_brief = "distinct targets are faithful tag decodes or caller-configured-only; spec-class weaknesses already VIABLE and out of scope to restate"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "Object.fromEntries in scValToNative scvMap decode (src/base/scval.ts:403-409) writes __proto__ as an own property; verified no prototype pollution of the global Object.prototype"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "authorizeEntry verifies the signer signature against the signed preimage payload (src/base/auth.ts:193) before attaching and no-ops source-account credentials"

[[blockers]]
kind = "trust_boundary"
guarantee = "addSacTransferOperation (src/base/transaction_builder.ts:719-796) and authorizeEntry consume only caller-configured arguments with validated bounds and source-account credentials; no remote/attacker input crosses into the conversion sink"
```
