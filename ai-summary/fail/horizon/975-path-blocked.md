# F975: Path blocked: honest-server mis-classification of a non-NotFound error

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/975-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`submitAsyncTransaction -> post`
(material residual sink is the upstream `checkMemoRequired -> loadAccount` error
classifier that gates submission; `post` itself only forwards the envelope.)

## Blocker

The error classifier is a strict HTTP-status switch, so an honest server cannot
turn a non-NotFound error into a NotFound skip. `_handleNetworkError` maps only
`error.response.status === 404` to `NotFoundError`; every other status maps to a
base `NetworkError`, and a missing response maps to a generic `Error`
(`call_builder.ts:444-465`). `NotFoundError extends NetworkError`
(`errors/not_found.ts:10`), so a base `NetworkError` instance is NOT
`instanceof NotFoundError`. In `checkMemoRequired` the catch skips the memo gate
(`continue`) only when `e instanceof NotFoundError`; for anything else
(`AccountRequiresMemoError`, 5xx/429/timeout `NetworkError`, response-parse
`TypeError`, or an `AccountResponse` lacking `data_attr`) it re-throws and the
submission aborts fail-closed (`server.ts:896-907`). Thus the only fail-open
(skip) path is a genuine 404 = account-not-found, which is intended SEP-29
behavior; no non-NotFound honest-server error is mis-classified.

## Evidence

- `src/horizon/call_builder.ts:444-465` - `_handleNetworkError` returns `NotFoundError` only for `status === 404`; all other statuses return base `NetworkError`; no `error.response` returns a generic `Error`.
- `src/errors/not_found.ts:10` - `NotFoundError extends NetworkError`, so a base `NetworkError` (any non-404) is not `instanceof NotFoundError` and cannot match the skip branch.
- `src/horizon/server.ts:896-907` - `checkMemoRequired` catch re-throws every error except `NotFoundError`; only `NotFoundError` triggers `continue` (skip memo check).
- `src/horizon/server.ts:796-799` - `loadAccount` routes through `accounts().accountId().call()`, the only error source feeding the catch, with no intermediate error remapping.
- `src/horizon/horizon_axios_client.ts:47-79` - response interceptor handles only fulfilled responses (date-header capture); it does not transform rejected requests into NotFound-shaped errors.

## Negative Scope

- Rules out: an honest Horizon server returning a non-404 error (5xx, 429, timeout, network failure, parse error, or 200 with missing `data_attr`) being mis-classified as `NotFoundError` and causing `checkMemoRequired` to skip the memo gate (fail-open) on the `submitAsyncTransaction`/`submitTransaction` path.
- Does not rule out: the already-known adversarial-server case where a hostile Horizon deliberately answers a real destination lookup with 404 (no SDK-independent source of truth; covered by route `js-sdk-2c414395835c0e06dd693296` prior NOT_VIABLE) — that is a server-trust limitation of an advisory check, not an SDK mis-classification bug.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-2c414395835c0e06dd693296"
weakness = "network_request"
record_kind = "residual_escalation"
path = ["submitAsyncTransaction", "post"]
sink = "post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/server.ts:checkMemoRequired", "src/horizon/call_builder.ts:_handleNetworkError", "src/horizon/server.ts:submitAsyncTransaction"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["notfound_classification_is_strict_status_404", "non_notfound_errors_failclosed_rethrow"]
rules_out = ["honest-server non-404 error being mis-classified as NotFoundError and skipping the SEP-29 memo-required gate"]
does_not_rule_out = ["adversarial Horizon returning a deliberate 404 for a real destination (no SDK-independent source of truth, prior NOT_VIABLE)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "checkMemoRequired skips the memo gate only on NotFoundError, which _handleNetworkError emits solely for HTTP 404; NotFoundError extends NetworkError so every non-404 error re-throws fail-closed, leaving no honest-server mis-classification path."
why_failed_brief = "error classification is a strict status===404 switch; non-NotFound errors always re-throw and abort submission fail-closed."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_handleNetworkError emits NotFoundError only for error.response.status === 404; all other statuses produce base NetworkError and missing responses produce generic Error (call_builder.ts:444-465)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "checkMemoRequired re-throws every caught error except NotFoundError, so only a genuine 404 skips the memo gate (server.ts:896-907)"

[[blockers]]
kind = "type_invariant"
guarantee = "NotFoundError extends NetworkError (errors/not_found.ts:10); a base NetworkError instance is not instanceof NotFoundError, so non-404 errors cannot match the skip branch"
```
