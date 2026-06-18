# F972: Redirect-following allowHttp/HTTPS policy bypass on Horizon submit POST

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/972-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate is fully source-confirmed as a *mechanism*:

- `Server.submitTransaction` posts the encoded envelope with only `timeout`
  and a `Content-Type` header — no `maxRedirects`, no `maxContentLength`
  (`src/horizon/server.ts:349-353`). `submitAsyncTransaction` is identical and
  also sets no redirect/length bound (`src/horizon/server.ts:580-583`).
- The default adapter selects `boundedFetchAdapter` only when
  `config.maxRedirects !== undefined || config.maxContentLength !== undefined`
  (`src/http-client/fetch-client.ts:483-489`). The submit POST sets neither, so
  the request goes through `instance.request(config)` — the feaxios/native-fetch
  path.
- That path follows redirects unbounded; the in-source comment names this
  "redirect-based SSRF and unbounded-response DoS"
  (`src/http-client/fetch-client.ts:322-327`). Even inside the bounded adapter,
  `maxRedirects === undefined` yields `redirect = "follow"`
  (`src/http-client/fetch-client.ts:348-359`).
- The `allowHttp` gate is a one-time construction check against
  `this.serverURL.protocol` only (`src/horizon/server.ts:120-122`); redirect
  `Location` targets are never re-validated.

So the redirect-following / allowHttp-not-re-checked behavior is real and
re-confirmed in current source.

## Why It Failed

This is an **exact typed duplicate** of an already-confirmed VIABLE reviewed
record in the injected prior-investigations brief (record [2], stage=reviewed,
verdict=VIABLE, route_id `js-sdk-2a1428ac20bf568cf68ca936`). That record's typed
route is the same sink and the same mechanism on the same path:
`submitTransaction; this.httpClient.post; boundedFetchAdapter bypassed; native
fetch follows Location`, with identical scope
(`remote_horizon_server / horizon_request_response_and_submission /
server_selected_by_caller / remote_response_and_caller_supplied_transaction /
json_or_xdr_decoded`) and the same negative-scope basis
(`candidate_not_blocked_after_source_trace`). Its `rules_out` is precisely C1's
claim: "constructor https gate (server.ts:120) checks only the construction-time
serverURL and does not re-check redirect targets."

C1 re-states that finding under a different `route_id`
(`js-sdk-e959ab04215fdeb636bbc4e0`, the residual-escalation route) but adds no
new sink, no new guard analysis, and no new material effect beyond what record
[2] already captured as VIABLE. Re-confirming it would duplicate the existing
finding. Per duplicate/subsumption handling, C1 is therefore NOT_VIABLE as a
typed duplicate, not because the underlying transport gap is unreal.

## What This Rules Out

The `https_allowhttp_policy_bypass` mechanism via redirect-following on the
Horizon submit POST is already represented by VIABLE record
`js-sdk-2a1428ac20bf568cf68ca936`; C1 adds no novel typed route.

## What This Does Not Rule Out

- The distinct credential-exposure mechanism (C2: `X-Auth-Token` forwarded to a
  cross-origin redirect target), which has a different impact class and material
  effect and is not adjudicated by record [2].
- The unbounded-response-length DoS on the same submit POST
  (`maxContentLength` also unset), a separate sink behavior not covered here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-e959ab04215fdeb636bbc4e0"
weakness = "https_policy_bypass_via_redirect"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post"]
sink = "httpClient.post"
sink_role = "transport_redirect_following"
impact_class = "https_allowhttp_policy_bypass"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/server.ts:submitTransaction", "src/horizon/server.ts:submitAsyncTransaction", "src/http-client/fetch-client.ts:createFetchClient"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_prior_viable_record"]
rules_out = ["redirect-following allowHttp/HTTPS policy bypass on the Horizon submit POST is already captured by VIABLE reviewed record js-sdk-2a1428ac20bf568cf68ca936 with identical path, sink, scope, and mechanism"]
does_not_rule_out = ["the distinct X-Auth-Token credential-leak mechanism (C2) with a different impact class", "unbounded-response-length DoS on the same submit POST where maxContentLength is also unset"]
assumptions = ["prior-investigations brief record [2] (stage=reviewed, VIABLE) accurately represents the existing typed route for this mechanism", "current source still sets no maxRedirects on submitTransaction/submitAsyncTransaction as cited"]
mechanism_brief = "submit POST sets no maxRedirects so feaxios follows 3xx unbounded and the one-time allowHttp gate is never re-applied to redirect targets; this exact typed route is already a confirmed VIABLE finding"
why_failed_brief = "exact typed duplicate of prior VIABLE reviewed record js-sdk-2a1428ac20bf568cf68ca936 (same path/sink/scope/mechanism); re-confirming would duplicate an existing finding"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/server.ts:constructor"
guarantee = "allowHttp gate at server.ts:120-122 validates only the initial serverURL protocol, not redirect Location targets — same gap already recorded VIABLE under js-sdk-2a1428ac20bf568cf68ca936"

[[blockers]]
kind = "duplicate"
source = "src/http-client/fetch-client.ts:createFetchClient"
guarantee = "the unbounded-redirect submit path and its allowHttp non-re-check are already represented by prior VIABLE reviewed record js-sdk-2a1428ac20bf568cf68ca936"
```
