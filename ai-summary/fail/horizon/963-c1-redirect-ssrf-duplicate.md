# F963: Redirect-following SSRF / HTTPS downgrade on Horizon submit/read (duplicate)

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/963-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed mechanism is **source-confirmed and correct**:

- `src/http-client/fetch-client.ts:482-490` — the default adapter routes to
  `boundedFetchAdapter` only when `maxRedirects`/`maxContentLength` is set;
  otherwise `instance.request` → native fetch.
- `src/http-client/fetch-client.ts:348-359` — with `maxRedirects` undefined,
  `redirect = "follow"`, so native fetch follows `Location` automatically; the
  default Horizon path never even reaches this code.
- `src/horizon/horizon_axios_client.ts:38-45` and scoped grep — no Horizon code
  sets `maxRedirects`; only `stellartoml`/`federation` do.
- `src/horizon/server.ts:120-122` — the HTTPS gate validates only the
  construction-time `serverURL` and is never re-evaluated on redirect targets.

So a malicious/compromised Horizon endpoint can 3xx-redirect submit/read traffic
to an arbitrary host (http downgrade, internal/metadata SSRF) with no hop
bounding or host re-validation. The mechanism is real.

## Why It Failed

This candidate is an **exact typed duplicate** of the already-VIABLE prior
record (route `js-sdk-2a1428ac20bf568cf68ca936`, prior [2], reviewed=VIABLE),
which the hypothesis batch itself acknowledges "already established the
redirect-follow mechanism." The two share the identical typed route:

- same path: `submitTransaction` → `httpClient.post` → `boundedFetchAdapter`
  bypassed → native fetch follows `Location`;
- same scope tuple (`remote_horizon_server` / `horizon_request_response_and_submission`
  / `server_selected_by_caller` / `remote_response_and_caller_supplied_transaction`
  / `json_or_xdr_decoded`);
- same blocker analysis (no `maxRedirects` set for Horizon traffic);
- same `rules_out` (construction-time HTTPS gate not re-checked on redirects);
- same material effect (redirect-following SSRF + HTTPS downgrade).

Per the reviewer dedup rule, an exact typed duplicate / true typed subsumption
of an existing finding is NOT_VIABLE for this candidate. The redirect-SSRF
material effect is already captured by prior [2]; re-emitting it under a
different `route_id` would create a redundant finding. The distinct material
effects on the same root-cause bypass are tracked separately (C3 — unbounded
response body — is reviewed VIABLE; C2 — credential leak — is reviewed
NOT_VIABLE on its own merits).

## What This Rules Out

Re-emitting the redirect-following SSRF / HTTPS-downgrade mechanism on the
Horizon submit/read post/get path as a new finding: it is already recorded as
VIABLE under route `js-sdk-2a1428ac20bf568cf68ca936`.

## What This Does Not Rule Out

The underlying redirect-follow weakness remains real (prior [2] is VIABLE). The
sibling material effects on the same bypass are assessed independently:
unbounded response-body exhaustion (C3, VIABLE) and cross-origin credential leak
(C2). This duplicate disposition does not retract prior [2].

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "redirect_following_ssrf_and_https_downgrade"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post", "createFetchClient.adapter", "native_fetch_follow_location"]
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
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_prior_viable_redirect_ssrf"]
rules_out = ["re-emitting redirect-following SSRF / HTTPS downgrade on the Horizon submit/read path as a new finding; it is an exact typed duplicate of prior [2] route js-sdk-2a1428ac20bf568cf68ca936 (reviewed VIABLE)"]
does_not_rule_out = ["the redirect-follow weakness itself remains real per prior [2]; sibling material effects C2 (credential leak) and C3 (unbounded body) are assessed separately"]
assumptions = ["prior [2] in the injected memory brief covers the identical typed redirect-follow route, scope, blocker, and material effect"]
mechanism_brief = "Source confirms Horizon traffic never sets maxRedirects, so the default adapter uses native fetch with redirect:follow and a malicious 3xx redirects submit/read to an arbitrary host without re-checking the construction-time HTTPS gate; this is the identical mechanism already recorded VIABLE as prior [2]."
why_failed_brief = "exact typed duplicate of already-VIABLE redirect-SSRF prior [2]; mechanism is real but not a new finding"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/server.ts:120"
guarantee = "construction-time HTTPS gate (server.ts:120-122) checks only the original serverURL and is not re-evaluated on redirect targets; this is the same gap recorded by prior [2]"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:createFetchClient"
guarantee = "no maxRedirects/host re-validation is applied to Horizon redirect targets; the only blocker to this candidate is dedup against prior [2], not a source guard"
```
