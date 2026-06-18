# F995: Path blocked: Horizon transaction XDR decode of remote/caller-supplied envelope

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/995-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> xdr.Tra ... fromXDR`

The seed is an `area_seed` over two targets (`<anonymous>`, `xdr.Tra ... fromXDR`).
A scoped grep of `src/horizon` for `fromXDR` returns exactly one decode site,
`server.ts:359`, so both targets resolve to the single sink
`xdr.TransactionResult.fromXDR` on the `submitTransaction` result path.

## Blocker

The sole XDR decode in horizon is `xdr.TransactionResult.fromXDR(response.data.result_xdr)`
(server.ts:359-362). Its decoded value is walked only to derive an informational
`offerResults` summary (server.ts:365-521) that is spread into `response.data` and
returned to the caller (server.ts:524-527). It is a leaf return value: never re-read
by the SDK for signing, fee derivation, auth, sequence, or resubmission, so a
malicious server's `result_xdr` cannot redirect a transaction. Any decode or
union-arm access error throws synchronously inside `.then()` and is caught and
converted to a rejected `BadResponseError` (server.ts:529-539), so the path is
fail-closed. `submitAsyncTransaction` returns `response.data` undecoded
(server.ts:584). The seed premise of decoding an inbound envelope into a trusted
`Transaction` does not exist: horizon only serializes the caller's already-built
envelope outbound via `toXDR` (server.ts:340, 571).

## Evidence

- `src/horizon/server.ts:359-362` - the only `fromXDR` call (grep-confirmed sole site); decodes the caller-selected server's `result_xdr`.
- `src/horizon/server.ts:524-527` - decoded-derived `offerResults` spread into untrusted `response.data` and returned; leaf value, not fed back into any signing/submission decision.
- `src/horizon/server.ts:529-539` - decode/union-access throws caught and rejected as `BadResponseError`; fail-closed and caller-catchable.
- `src/horizon/server.ts:584` - `submitAsyncTransaction` returns `response.data` with no XDR decode.
- `src/horizon/server.ts:340,571` - inbound-path premise absent: envelope XDR is only produced outbound (`toEnvelope().toXDR()`), never decoded into a trusted `Transaction`.

## Negative Scope

- Rules out: `xdr.TransactionResult.fromXDR` on `submitTransaction.result_xdr` (and the derived `offerResults`) as a parse-integrity, trust-confusion, numeric-domain, or resource-exhaustion finding — the decoded value is a fail-closed leaf return value with linear, caller-paced cost and no accumulating sink.
- Does not rule out: callers (outside `src/horizon`) decoding `envelope_xdr`/`result_meta_xdr` response strings via stellar-base `TransactionBuilder.fromXDR`; and unbounded HTTP response body size at the axios client layer (no `maxContentLength` observed) as a separate transport-level concern.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-5f3e8285bdb0d1bde50ff0fd"
weakness = "deserialization / parse integrity"
record_kind = "area_seed"
path = ["<anonymous>", "xdr.Tra ... fromXDR"]
sink = "xdr.Tra ... fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/horizon/server.ts:submitTransaction", "src/horizon/server.ts:submitAsyncTransaction", "xdr.TransactionResult.fromXDR"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["decode_output_is_leaf_return_value", "catchable_throw_fail_closed", "linear_cost_no_src_amplification"]
rules_out = ["xdr.TransactionResult.fromXDR on submitTransaction result_xdr and derived offerResults as parse-integrity/trust-confusion/numeric-domain/resource-exhaustion: leaf return value (server.ts:524-527), fail-closed throw (server.ts:529-539), no re-read for signing/fee/auth/sequence/resubmission"]
does_not_rule_out = ["caller-side TransactionBuilder.fromXDR decode of envelope_xdr/result_meta_xdr outside src/horizon", "unbounded axios response body size (no maxContentLength) as a transport-level concern"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Only horizon XDR decode is xdr.TransactionResult.fromXDR on submitTransaction result_xdr; decoded value derives an informational offerResults leaf return value, is fail-closed on parse error, and is never re-read for signing/submission; submitAsyncTransaction does not decode."
why_failed_brief = "Decoded result is a fail-closed leaf return value (server.ts:359,524-539); never influences signing/fee/auth/sequence/resubmission and no inbound envelope is decoded into a trusted Transaction."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "decode and union-arm access run inside .then(); any throw is caught at server.ts:529-539 and rejected as BadResponseError (fail-closed, caller-catchable)"

[[blockers]]
kind = "leaf_return_value"
guarantee = "decoded TransactionResult/offerResults are spread into response.data and returned to the caller (server.ts:524-527); never re-read by the SDK for signing, fee, auth, sequence, or resubmission"
```
