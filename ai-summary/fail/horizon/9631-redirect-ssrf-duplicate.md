# F9631: Horizon redirect-follow SSRF / HTTPS downgrade on httpClient.post

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/963-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed mechanism is source-confirmed in current source:

- `src/http-client/fetch-client.ts:482-490` — the default-client adapter routes
  to `boundedFetchAdapter` only when `config.maxRedirects !== undefined ||
  config.maxContentLength !== undefined`; otherwise it calls
  `instance.request(config)` (feaxios → native `fetch`).
- `boundedFetchAdapter` with an undefined `maxRedirects` would itself use
  `redirect: "follow"` (`fetch-client.ts:348-359`), but the Horizon default
  path never reaches it.
- No `maxRedirects`/`maxContentLength` is set anywhere under `src/horizon/`
  (scoped grep: only `src/stellartoml/index.ts:56-57` and
  `src/federation/server.ts:226` set them). `createHttpClient`
  (`src/horizon/horizon_axios_client.ts:38-45`) sets neither.
- `submitTransaction` (`server.ts:349-353`) passes only `timeout` +
  content-type; `submitAsyncTransaction` (`server.ts:580-583`) passes only
  content-type; `_sendNormalRequest` (`call_builder.ts:395-396`) passes no
  config.
- The HTTPS gate (`server.ts:120-122`) validates only the construction-time
  `serverURL` and is never re-evaluated on redirect targets.

So the bare redirect-following SSRF / HTTPS-downgrade mechanism is real on
current source.

## Why It Failed

This candidate is an exact typed duplicate / true subsumption of prior record
[2] (route `js-sdk-2a1428ac20bf568cf68ca936`, reviewed=VIABLE). Prior [2]
already established, on the identical typed route, the same mechanism:
`submitTransaction → this.httpClient.post → boundedFetchAdapter bypassed →
native fetch follows Location`, with the same scope tuple
(`remote_horizon_server / horizon_request_response_and_submission /
server_selected_by_caller / remote_response_and_caller_supplied_transaction /
json_or_xdr_decoded`). Prior [2]'s `rules_out` explicitly records that the
constructor HTTPS gate (`server.ts:120`) checks only the construction-time
`serverURL` and does not re-check redirect targets — which is exactly C1's
HTTPS-downgrade claim. The "confirm or refute" residual is therefore answered
by the already-VIABLE prior record; re-confirming the same typed route does not
produce a new finding.

The two distinct material effects on the same root-cause bypass that the bare
SSRF prior does NOT cover — cross-origin credential leakage and unbounded
response-body exhaustion — are reviewed separately (C2, C3) and are not
disposed of by this duplicate determination.

## What This Rules Out

The bare redirect-following SSRF / HTTPS-downgrade transport mechanism on the
Horizon `httpClient.post`/`.get` path as a *new* finding: it is the exact typed
route already recorded VIABLE in prior [2].

## What This Does Not Rule Out

- Cross-origin credential leakage on the same bypassed redirect path (C2).
- Unbounded response-body memory exhaustion on the same bypassed path (C3).
- Any future change that re-checks the HTTPS gate but still leaves the other
  two effects unaddressed.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "redirect_following_ssrf_and_https_downgrade"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post"]
sink = "httpClient.post"
sink_role = "http_transport"
impact_class = "https_policy_bypass_ssrf"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/server.ts:submitTransaction", "src/http-client/fetch-client.ts:createFetchClient"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "duplicate_of_prior_record"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_prior_viable_route"]
rules_out = ["bare redirect-following SSRF / HTTPS-downgrade on the Horizon httpClient.post/get path as a new finding: identical typed route already recorded VIABLE in prior [2] (js-sdk-2a1428ac20bf568cf68ca936), including the HTTPS-gate-not-rechecked-on-redirect claim"]
does_not_rule_out = ["cross_origin_credential_leak_on_redirect", "unbounded_response_body_exhaustion"]
assumptions = ["prior [2] scope tuple matches this candidate exactly per the injected prior-investigations brief", "current source confirms the redirect-follow mechanism is still present (fetch-client.ts:482-490)"]
mechanism_brief = "Horizon traffic never sets maxRedirects, so the default adapter uses native fetch with redirect:follow; the redirect-follow SSRF / https-downgrade mechanism is real but is the exact typed route already recorded VIABLE in prior [2]."
why_failed_brief = "exact typed duplicate / subsumption of prior VIABLE record [2] for the same path, scope, and weakness including the HTTPS-gate-not-rechecked claim"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/server.ts:constructor"
guarantee = "construction-time HTTPS gate (server.ts:120-122) checks only the original serverURL and is not re-evaluated on redirect targets; this exact gap is already recorded in prior [2]"

[[blockers]]
kind = "duplicate"
source = "src/http-client/fetch-client.ts:createFetchClient"
guarantee = "no new boundary differs from prior [2]; same bypass, same path, same scope, so this candidate is subsumed by the existing VIABLE record"
```
