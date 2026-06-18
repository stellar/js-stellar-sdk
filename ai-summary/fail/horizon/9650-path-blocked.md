# F9650: Path blocked: submitTransaction envelope serialization cluster

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/9650-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`submitTransaction -> transaction.toEnvelope().toXDR() (serialization)`

## Blocker

Across both submission paths the caller-supplied transaction is serialized
synchronously (`transaction.toEnvelope().toXDR().toString("base64")`) and
`encodeURIComponent`-wrapped into the `tx=` form body *before* `httpClient.post`
is ever called, so no remote Horizon response can interleave to mutate or
substitute the serialized envelope. The decoded `result_xdr`/`offerResults`
(server.ts:354-365) and async `response.data` (server.ts:584) are leaf return
values handed back to the caller and never re-read by the SDK for signing, fee,
auth, sequence, or resubmission. `checkMemoRequired` runs before serialization,
performs no transaction mutation, and fails closed by throwing. The serialized
bytes are a faithful encoding of the caller's own transaction object.

## Per-Target Disposition

- `submitTransaction` / `submitAsyncTransaction`: serialize-before-POST; no
  response feedback into the envelope. Blocked.
- `toEnvelope` / `toXDR` / `transac...nvelope` / `transac...).toXDR`: faithful
  caller-state serialization; deterministic, no attacker remote input reaches
  them. Blocked.
- `<anonymous>` (response `.then` decoder): output is a leaf return value;
  never re-read for signing/fee/auth/resubmission. Blocked.

## Evidence

- `src/horizon/server.ts:339-341` - envelope serialized + URI-encoded before any network call (sync submit).
- `src/horizon/server.ts:570-572,580-584` - async path serializes before POST; returns raw `response.data`.
- `src/horizon/server.ts:354-365` - decoded `result_xdr`/`offerResults` returned to caller, not fed back into any envelope.
- `src/horizon/server.ts:335-337,566-568` - `checkMemoRequired` precedes serialization and does not mutate the transaction.

## Negative Scope

- Rules out: remote Horizon response or pre-serialization memo-required load corrupting/substituting the serialized caller envelope on `submitTransaction`/`submitAsyncTransaction`, and decoded result XDR being re-read by the SDK for signing/fee/auth/sequence/resubmission.
- Does not rule out: redirect-following on `httpClient.post` for Horizon traffic (distinct sink, already tracked as VIABLE under route_id js-sdk-2a1428ac20bf568cf68ca936).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-e959ab04215fdeb636bbc4e0"
weakness = "transaction serialization integrity"
record_kind = "area_seed"
path = ["submitTransaction", "transac ... nvelope"]
sink = "transac ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["submitAsyncTransaction", "toXDR", "toEnvelope", "<anonymous>", "transac ... nvelope", "transac ... ).toXDR", "submitTransaction"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["decode_output_is_leaf_return_value", "faithful_caller_state_serialization", "serialize_before_network_io"]
rules_out = ["remote Horizon response or pre-serialization memo-required load corrupting or substituting the serialized caller envelope on submitTransaction/submitAsyncTransaction", "decoded result_xdr/offerResults being re-read by the SDK for signing/fee/auth/sequence/resubmission"]
does_not_rule_out = ["redirect-following on httpClient.post for Horizon traffic (distinct sink, VIABLE under route_id js-sdk-2a1428ac20bf568cf68ca936)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Caller transaction is serialized via toEnvelope().toXDR() and URI-encoded into the tx= body before httpClient.post; no remote response interleaves into serialization, and decoded results are leaf return values."
why_failed_brief = "Serialization completes before any network I/O and decoded responses are never re-read by the SDK, so remote data cannot corrupt the serialized caller envelope."
confidence = "high"

[[sanitizer_guarantees]]
kind = "ordering_invariant"
guarantee = "envelope serialization and encodeURIComponent occur before httpClient.post, so no remote response can interleave into the serialized bytes"

[[sanitizer_guarantees]]
kind = "leaf_return_value"
guarantee = "decoded result_xdr/offerResults and async response.data are returned to the caller and never re-read for signing, fee, auth, sequence, or resubmission"

[[blockers]]
kind = "faithful_serialization"
guarantee = "serialized bytes are a deterministic faithful encoding of the caller's own transaction object with no attacker remote input reaching toEnvelope/toXDR"
```
