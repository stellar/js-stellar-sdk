# F971: Path blocked: remote-RPC trust confusion on other scValToNative entry paths

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/971-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`extractEvent -> scValToNative`

Residual escalation of D971: confirm or refute remote-RPC trust confusion on
*other* `scValToNative` entry paths (events, invocation tree, SAC balance),
distinct from the already-VIABLE decode-by-tag-confusion finding and the
already-dismissed map-key-collision finding.

## Blocker

The standalone `scValToNative` (`src/base/scval.ts:375`) is a pure ScVal→native
decoder. Every remote-fed entry path — `extractEvent`/`humanizeEvents` (event
display), `buildInvocationTree` (auth-invocation display), and `getSACBalance`
(balance display) — consumes its output only as informational data shown to the
application; none feeds an SDK signing, auth, fee, network, or submission
decision. On each path the party able to inject the ScVal (a malicious contract
for events, a malicious RPC server for ledger entries) already fully controls
the decoded value, so decoding adds no trust the injector lacks. The one true
decode ambiguity (decode-by-ScVal-tag confusion) is already recorded VIABLE
under route `js-sdk-26a2c419baf9cb084b019288`; map-key collision is already
NOT_VIABLE. Remaining branches are exact (bigint conversions) or
prototype-safe (`Object.fromEntries`), leaving no distinct Medium+ mechanism.

## Evidence

- `src/base/scval.ts:375-479` - tag-switch decoder; numeric branches are exact bigint conversions, `scvMap` uses `Object.fromEntries` (no prototype pollution), no security consumer inside the decoder.
- `src/base/events.ts:14-59` - `extractEvent`/`humanizeEvents` only build a display `SorobanEvent`; `contractId` comes from `event.contractId()`, not from `scValToNative`.
- `src/base/invocation.ts:120-188` - `buildInvocationTree` maps args via `scValToNative` purely for a human-readable invocation tree.
- `src/rpc/server.ts:1469-1490` - `getSACBalance` decodes a remote ledger entry whose values the same RPC server already controls; output is only returned to the caller as balance display.

## Negative Scope

- Rules out: a distinct Medium+ remote-RPC trust-confusion finding on the
  non-tag-confusion `scValToNative` entry paths (event topics/data, invocation
  tree args, SAC balance), where the decoded native value is informational and
  fully controlled by the injecting remote party.
- Does not rule out: the already-VIABLE decode-by-ScVal-tag confusion under
  route `js-sdk-26a2c419baf9cb084b019288`; and the type-directed
  `Spec.scValToNative` in `src/contract/spec.ts` (a different method) when its
  decoded contract return value is consumed by application signing logic.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-7a324b916fb2b6eeb0a7caca"
weakness = "contract_spec_conversion"
record_kind = "residual_escalation"
path = ["extractEvent", "scValToNative"]
sink = "scValToNative"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/scval.ts:scValToNative", "src/base/events.ts:extractEvent", "src/base/invocation.ts:buildInvocationTree", "src/rpc/server.ts:getSACBalance"]
scope.trust_boundary = "remote_rpc_or_contract_response"
scope.protocol_phase = "response_decode"
scope.auth_state = "unauthenticated_remote"
scope.attacker_control = "remote_scval_values"
scope.parser_state = "scval_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["scvaltonative_decoded_value_not_consumed_by_sdk_security_decision", "remote_injector_already_controls_decoded_value"]
rules_out = ["distinct Medium+ remote-RPC trust-confusion finding on non-tag-confusion scValToNative entry paths (extractEvent/humanizeEvents events, buildInvocationTree args, getSACBalance) where decoded value is informational and fully controlled by the injecting remote party"]
does_not_rule_out = ["decode-by-ScVal-tag confusion already VIABLE under route js-sdk-26a2c419baf9cb084b019288", "type-directed Spec.scValToNative in src/contract/spec.ts when its decoded return value drives application signing"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "standalone scValToNative is a pure decoder; on every remote entry path the decoded value is informational and fully controlled by the same remote party, and no SDK signing/auth/fee/submission decision consumes it, so no distinct trust confusion arises beyond the already-recorded tag-confusion route"
why_failed_brief = "no SDK security decision consumes the decoded native value on the other entry paths; the only genuine decode ambiguity is already VIABLE elsewhere and map-key collision already NOT_VIABLE"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "scvMap decode uses Object.fromEntries which creates own data properties (no __proto__ setter invocation), so no prototype pollution; numeric branches are exact bigint conversions"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "extractEvent/humanizeEvents, buildInvocationTree, and getSACBalance use scValToNative output only as informational display data, not as input to any signing/auth/fee/submission decision"

[[blockers]]
kind = "no_security_consumer"
guarantee = "decoded native value on the remote entry paths is not consumed by any SDK trust/signing/auth decision; injecting remote party already controls the value"
```
