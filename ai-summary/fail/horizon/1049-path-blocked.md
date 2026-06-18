# F1049: Path blocked: Horizon submission serialization integrity

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/1049-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`submitTransaction -> toXDR` (and sibling `submitAsyncTransaction -> toXDR`)

## Blocker

Both submission siblings serialize the envelope with a single non-conditional
expression `transaction.toEnvelope().toXDR().toString("base64")` taken directly
from the caller-supplied, already-signed transaction object
(`server.ts:339-341`, `server.ts:570-572`). No remote Horizon response data and
no SDK-derived value flows into that serialization, so the submitted bytes are a
faithful copy of what the caller built and signed. The only pre-serialization
step, `checkMemoRequired` (`server.ts:849-909`), is strictly read-only: it reads
`transaction.memo` and `transaction.operations`, and for a `FeeBumpTransaction`
it only reassigns a local variable to `innerTransaction` (`server.ts:852-853`)
without mutating the caller object. Decoded `result_xdr`/`offerResults` and the
async `response.data` are leaf return values handed to the caller and never
re-read by the SDK for signing/fee/auth/sequence/resubmission, matching prior
high-confidence record js-sdk-5fb6f805af186b3710202761.

## Evidence

- `src/horizon/server.ts:339-341` - sync submit serializes the caller envelope directly with no injected/remote data.
- `src/horizon/server.ts:570-572` - async submit uses the identical faithful serialization expression.
- `src/horizon/server.ts:849-909` - checkMemoRequired only reads memo/operations and never mutates the transaction before serialization.

## Negative Scope

- Rules out: remote Horizon responses or the pre-serialization memo-required loads corrupting/mismatching the serialized caller envelope across sync and async submission siblings.
- Does not rule out: (a) the already-VIABLE transport/redirect issue on `httpClient.post` (route js-sdk-2a1428ac20bf568cf68ca936) which is a distinct transport sink, not serialization; (b) a caller-selected malicious Horizon suppressing the memo-required safety check (remote-response trust confusion, caller-selected/trusted server, documented caller responsibility, below severity floor).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "transaction serialization integrity"
record_kind = "area_seed"
path = ["submitTransaction", "toXDR"]
sink = "toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["submitTransaction", "submitAsyncTransaction", "toEnvelope", "toXDR", "checkMemoRequired"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["faithful_caller_state_serialization", "decode_output_is_leaf_return_value"]
rules_out = ["remote Horizon response or pre-serialization memo-required loads corrupting the serialized caller envelope on submitTransaction/submitAsyncTransaction"]
does_not_rule_out = ["transport/redirect SSRF on httpClient.post (route js-sdk-2a1428ac20bf568cf68ca936)", "caller-selected malicious Horizon suppressing the memo-required safety check (remote-response trust confusion, below severity floor)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Sync and async submission serialize the caller-signed transaction directly via toEnvelope().toXDR() with no remote or SDK-derived data injected; the only pre-serialization step (checkMemoRequired) is read-only and decoded responses are leaf return values."
why_failed_brief = "Serialization is a faithful, non-conditional copy of the caller-signed transaction; no remote response or memo-required load mutates it before submission."
confidence = "high"

[[sanitizer_guarantees]]
kind = "faithful_serialization"
guarantee = "submitTransaction/submitAsyncTransaction serialize the caller-supplied transaction object directly (server.ts:339-341, 570-572) with no injected remote or SDK-derived data"

[[sanitizer_guarantees]]
kind = "read_only_precheck"
guarantee = "checkMemoRequired only reads memo/operations and reassigns a local for FeeBump; it does not mutate the transaction before serialization (server.ts:849-909)"

[[blockers]]
kind = "leaf_return_value"
guarantee = "decoded result_xdr/offerResults and async response.data are returned to the caller and never re-read by the SDK for signing/fee/auth/sequence/resubmission"
```
