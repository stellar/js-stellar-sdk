# F904: Path blocked: unchecked union-arm access on submitTransaction result_xdr throws catchable TypeError (below Medium floor)

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/904-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> (Server.submitTransaction .then) -> fromXDR (xdr.TransactionResult.fromXDR + union-arm access at server.ts:365/370/375/386)`

## Residual Question Resolved

Concrete yes/no on the escalated lead: **YES, the unchecked union-arm accesses do
throw a TypeError on a crafted HTTP-200 `result_xdr`** — but the throw is a
catchable, fail-closed exception with no security material effect, so it remains
Low robustness, below the Medium floor.

Three confirmed throw sites, all reachable when a malicious/compromised
caller-selected Horizon server returns HTTP-200 with a crafted `result_xdr`:
- `server.ts:365,370`: `responseXDR.result().value()` returns `undefined` for the
  `default`/void `TransactionResultResult` arms (e.g. `txTOO_EARLY`, `txBAD_SEQ`,
  `txMALFORMED`); `results.length` then throws `TypeError`.
- `server.ts:375`: for an operation result whose `OperationResultCode` is not
  `opINNER` (e.g. `opBAD_AUTH`, `opNO_ACCOUNT`), `result.value()` is `undefined`
  and `.switch()` throws `TypeError`.
- `server.ts:386`: for a `manageBuyOffer`/`manageSellOffer` result with a
  non-success code, `result.value().value().success()` accesses an inactive
  js-xdr union arm and throws.

## Blocker

Every throw site produces a catchable `TypeError`/`Error` that the trailing
`.catch` (server.ts:529-531) re-rejects unchanged via `Promise.reject(response)`,
so `submitTransaction` rejects loudly rather than returning a valid-looking-but-
wrong result. The decoded value is a leaf return value (merged into the returned
object at server.ts:524-527) and is never fed into signing, fee derivation, auth,
or resubmission. The only attacker is the caller-selected Horizon server, which
already fully controls the HTTP-200 body and outcome; throwing a TypeError grants
it no trust confusion, no unsafe-result decode, and no resource amplification
(single synchronous O(1) throw). Impact is therefore robustness/availability only
— Low, below the Medium floor — confirming and extending prior NOT_VIABLE
js-sdk-d87c484129de8eb8cd54070c.

## Evidence

- `src/horizon/server.ts:359-365` - `xdr.TransactionResult.fromXDR` decodes remote `result_xdr`; `.result().value()` yields `undefined` for void union arms.
- `src/horizon/server.ts:370,375,386` - unchecked union-arm accesses (`results.length`, `result.value().switch()`, `result.value().value().success()`) throw on non-matching arms.
- `src/horizon/server.ts:524-527` - decoded data is a leaf return value merged back into the response object; no signing/fee/auth/resubmission consumer.
- `src/horizon/server.ts:529-531` - `.catch` re-rejects any `instanceof Error` unchanged, so the TypeError fails closed and is not converted into a misleading result.

## Negative Scope

- Rules out: `xdr.TransactionResult.fromXDR` union-arm access on `submitTransaction`'s `result_xdr` as a parse-integrity / trust-confusion / unsafe-result finding — the worst observable effect is a catchable, fail-closed TypeError on the caller's own selected server.
- Does not rule out: a sibling sink where a remote-decoded value is consumed for a security decision (signing, fee, auth, resubmission) rather than returned as a leaf — that would be a distinct route, not this one.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-d87c484129de8eb8cd54070c"
weakness = "xdr_decode"
record_kind = "residual_escalation"
path = ["<anonymous>", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/server.ts:submitTransaction", "fromXDR"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["decode_output_is_leaf_return_value", "catchable_throw_fail_closed"]
rules_out = ["unchecked union-arm access on submitTransaction result_xdr (server.ts:365/370/375/386) as a parse-integrity or trust-confusion finding: every throw site yields a catchable TypeError that the .catch re-rejects unchanged, and the decoded value is a leaf return value never consumed for signing/fee/auth/resubmission"]
does_not_rule_out = ["a distinct route where a remote-decoded XDR value is consumed for a security decision rather than returned as a leaf"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "crafted HTTP-200 result_xdr with a void/default TransactionResultResult arm or non-opINNER/non-success operation result makes server.ts:370/375/386 access an inactive js-xdr union arm and throw a TypeError"
why_failed_brief = "throw is a catchable fail-closed TypeError on a leaf return value from the caller-selected server; no trust confusion, unsafe-result decode, or amplification, so Low robustness below the Medium floor"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "server.ts:529-531 .catch re-rejects any thrown Error unchanged via Promise.reject, so the TypeError fails closed instead of producing a misleading result"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "decoded result is a leaf return value (server.ts:524-527) not fed into signing, fee derivation, auth, or resubmission"

[[blockers]]
kind = "severity_floor"
guarantee = "worst observable effect is a catchable TypeError (Low robustness/availability) against the caller-selected server, below the Medium severity floor"
```
