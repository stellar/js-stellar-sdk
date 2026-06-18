# F905: Path blocked: Horizon XDR decode of remote transaction-result blobs

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/905-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> (submitTransaction .then handler) -> xdr.TransactionResult.fromXDR`

Area seed target set (`<anonymous>`, `xdr.Tra ... fromXDR`). The only
`xdr.Tra*.fromXDR` decode site in `src/horizon` is
`xdr.TransactionResult.fromXDR` at `server.ts:359`. No `TransactionEnvelope`,
`TransactionMeta`, or other transaction-XDR decode exists on the horizon
request/response path (`grep` over `src/horizon`).

## Blocker

The decoded value is a leaf return value. `xdr.TransactionResult.fromXDR`
decodes the caller-selected server's own `result_xdr`; the only thing derived
from it is the `offerResults` summary, which is merged back into the same
untrusted `response.data` object and returned to the caller
(`server.ts:524-527`). It is never fed into signing, fee derivation, auth-entry
construction, sequence handling, or resubmission. Every throw site on the
decode path (union-arm access at 365/375/386, the `Invalid offer result type`
default at 413) yields a catchable `Error`/`TypeError` that the `.catch`
re-rejects unchanged (529-539), i.e. fail-closed availability only, below the
Medium floor. The sibling `submitAsyncTransaction` (584) returns
`response.data` with no XDR decode at all.

## Evidence

- `src/horizon/server.ts:355-362` - decode is gated on `response.data.result_xdr` and produces a local `responseXDR`; nothing else in the SDK re-reads it.
- `src/horizon/server.ts:370-521` - all attacker-XDR-derived work (`results.map`, `offersClaimed.map`, BigNumber `amountBought/amountSold`, `price().n()/d()`) feeds only the returned `offerResults`; loops are linear in the already-received response body (no small-input/large-work amplification in `src/`; deep-decode recursion is internal to js-xdr, out of scope).
- `src/horizon/server.ts:524-539` - decoded data spread into the return object and `.catch` re-rejects any thrown error verbatim; no signing/submission decision consumes it.
- `src/horizon/server.ts:584` - `submitAsyncTransaction` returns raw `response.data`, confirming no second transaction-XDR decode sink on this path.

## Negative Scope

- Rules out: `xdr.TransactionResult.fromXDR` on `submitTransaction` `result_xdr` (and its derived `offerResults`/asset/price/amount computation) as a parse-integrity, trust-confusion, resource-exhaustion, or numeric-domain finding — output is a leaf return value and all throws are catchable.
- Does not rule out: `checkMemoRequired` account-loading/memo-decision path (different sink, account-load not result-XDR decode); a malicious server lying about submission status remains the caller's own-server trust assumption, not an SDK decode bug.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-5f3e8285bdb0d1bde50ff0fd"
weakness = "untrusted XDR decode / parse integrity"
record_kind = "area_seed"
path = ["<anonymous>", "xdr.Tra ... fromXDR"]
sink = "xdr.Tra ... fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/horizon/server.ts:submitTransaction", "xdr.TransactionResult.fromXDR"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["decode_output_is_leaf_return_value", "catchable_throw_fail_closed", "linear_cost_no_src_amplification"]
rules_out = ["xdr.TransactionResult.fromXDR on submitTransaction result_xdr and derived offerResults as a parse-integrity/trust-confusion/resource-exhaustion/numeric-domain finding: decoded value is a leaf return value (server.ts:524-527) never consumed by signing/fee/auth/resubmission, and every decode-path throw is a catchable error re-rejected unchanged (server.ts:529-539)"]
does_not_rule_out = ["checkMemoRequired account-load/memo-decision path", "malicious caller-selected server returning semantically-misleading result fields (own-server trust assumption, not an SDK decode bug)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Remote Horizon result_xdr is decoded via xdr.TransactionResult.fromXDR; the only derived value (offerResults) is merged into the returned response object and never reused for any SDK security decision."
why_failed_brief = "Decode output is a leaf return value not fed into signing/submission/fee/auth, and all decode-path throws are catchable fail-closed errors below the Medium severity floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "decode is gated on response.data.result_xdr and its product (offerResults) is only spread into the returned object at server.ts:524-527, not consumed by any signing/submission path"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "all decode-path throws (union-arm access 365/375/386, default 413) propagate to .catch at server.ts:529-539 which re-rejects unchanged, yielding catchable availability-only failure"

[[blockers]]
kind = "leaf_return_value"
guarantee = "decoded TransactionResult and derived offerResults are returned to the caller and never re-read by the SDK for signing, fee, auth, sequence, or resubmission decisions"
```
