# F906: Redirect-target scheme not re-validated against allowHttp (duplicate of confirmed findings)

**Date**: 2026-06-17
**Subsystem**: http-client
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/http-client/906-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's source mechanism is real and confirmed:

- `src/http-client/fetch-client.ts:406-412` — inside `boundedFetchAdapter`'s
  manual hop loop, a 3xx `Location` is resolved via
  `new URL(location, currentUrl)` and then passed through
  `applyRedirectSemantics` (method/body per spec) and `stripCrossOriginAuth`
  (drops `authorization`/`proxy-authorization`/`cookie` cross-origin). There is
  no scheme/`allowHttp` comparison anywhere in this block. Confirmed.
- The only guards in the loop are the hop cap (`redirectsRemaining`,
  `fetch-client.ts:378,397,412`), method/body normalization
  (`applyRedirectSemantics`, `fetch-client.ts:257-270`), and credential
  stripping (`stripCrossOriginAuth`, `fetch-client.ts:276-294`). None re-applies
  the https/`allowHttp` transport policy to the redirect target. Confirmed.
- `src/http-client/fetch-client.ts:348-359` — when `maxRedirects` is undefined
  the policy resolves to `redirect = "follow"` and native fetch follows hops with
  zero SDK re-validation; the manual loop is skipped (`fetch-client.ts:393-395`).
  Confirmed.
- `src/stellartoml/index.ts:52` — `protocol = allowHttp ? "http" : "https"` is
  decided once for the initial URL; `maxContentLength: STELLAR_TOML_MAX_SIZE` is
  always set (`index.ts:57`), so the bounded adapter is always selected
  (`fetch-client.ts:483-487`). Confirmed.

So the code defect the candidate describes (no redirect-target scheme
re-validation → `http://` `Location` downgrades the request to cleartext despite
`allowHttp=false`) is present in source exactly as stated.

## Why It Failed

This exact typed defect is already recorded as a **confirmed VIABLE** finding in
prior structured memory, at the same sink and the same single fix point:

- Prior record [4] (`route_id js-sdk-3210675ec7643a3184fe756f`, stage=reviewed,
  VIABLE), scope `stellar_toml_resolution`: "source trace of the
  boundedFetchAdapter redirect loop (fetch-client.ts:406-412) confirms no
  scheme-preservation or host-allowlist guard blocks following a server-supplied
  `http://` or arbitrary-host Location; stripCrossOrigin[Auth]…". This is the
  stellar.toml caller path C1 cites, with the identical sink lines, identical
  weakness (no scheme/allowHttp guard on the redirect target), and identical
  impact (following a server-supplied `http://` Location).
- Prior record [3] (`route_id js-sdk-cda4d93790ffd066b1523001`, stage=reviewed,
  VIABLE), scope `federation_resolution`: "no host allowlist, same-origin, or
  hop-cap guard runs on the redirect=follow branch for the federation get path".
  This is the federation caller path C1 cites.

C1 is the generalized restatement of records [3] and [4]: same sink
(`boundedFetchAdapter` redirect loop, `fetch-client.ts:406-412` plus the
`redirect:"follow"` branch `fetch-client.ts:351-359`), same weakness (redirect
target scheme never re-validated against `allowHttp`/https policy), same impact
class (HTTPS/`allowHttp` transport-downgrade), and the same fix location (add a
scheme/policy check in the redirect loop). The two concrete in-scope callers
(stellar.toml, federation) are each already covered VIABLE; C1's only additional
caller mention is Horizon, which is asserted but not traced, and which would be
remediated by the identical single guard at the same sink. This is true typed
subsumption.

Per the duplicate/subsumption disposition rule, an exact typed duplicate /
true typed subsumption of an existing confirmed finding is NOT_VIABLE for this
candidate — not because the mechanism is wrong, but because re-emitting it would
duplicate records [3]/[4]. The candidate's broader stated trust boundary
(`remote_http_server` vs the recorded `remote_domain_well_known_file` /
`remote_federation_server`) is a generalization of the same code defect, not a
new protocol phase, parser state, or input shape that would make it a distinct
route.

## What This Rules Out

Re-emitting the redirect-target scheme/`allowHttp` non-revalidation defect in
`boundedFetchAdapter` (`fetch-client.ts:406-412` and the `redirect:"follow"`
branch `351-359`) for the stellar.toml and federation callers as a new finding:
it is subsumed by confirmed VIABLE records [4]
(`js-sdk-3210675ec7643a3184fe756f`) and [3] (`js-sdk-cda4d93790ffd066b1523001`),
which already capture the same sink, weakness, and HTTPS-downgrade impact.

## What This Does Not Rule Out

- A genuinely distinct Horizon-specific route, if a future trace shows Horizon
  reaches the bounded adapter with `maxRedirects > 0` (Node manual loop) or only
  `maxContentLength` set (`redirect:"follow"`) and the downgrade produces a
  materially different, not-yet-recorded impact at a different trust boundary.
- Cross-origin redirect following to a different **https** host without
  re-checking domain identity (host-confusion rather than scheme downgrade),
  which is a different weakness than the scheme-downgrade captured by [3]/[4].
- The browser-mode hop-count behavior (`maxRedirects > 0` ignored, bounded only
  by the user-agent's ~20 cap), which the batch itself already resolved as below
  the Medium floor.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "http-client"
route_id = "js-sdk-0f3de652e21d6be98b52f804"
weakness = "network_request"
record_kind = "single_path"
path = ["<anonymous>", "fetch"]
sink = "fetch"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:boundedFetchAdapter", "src/stellartoml/index.ts:resolve"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["duplicate_of_confirmed_viable_redirect_scheme_downgrade"]
rules_out = ["redirect-target scheme/allowHttp non-revalidation in boundedFetchAdapter (fetch-client.ts:406-412 and the redirect:follow branch 351-359) for the stellar.toml and federation callers as a new finding: it is an exact typed duplicate/subsumption of confirmed VIABLE prior records js-sdk-3210675ec7643a3184fe756f (stellar.toml) and js-sdk-cda4d93790ffd066b1523001 (federation), same sink/weakness/HTTPS-downgrade impact and same single fix point"]
does_not_rule_out = ["a Horizon-specific route at a distinct trust boundary if future source trace shows a materially different not-yet-recorded impact", "cross-origin redirect following to a different https host without domain-identity re-check (host confusion, not scheme downgrade)"]
assumptions = ["records [3] and [4] in the injected prior-investigations brief describe the same boundedFetchAdapter redirect loop and the same http:// Location scheme-downgrade weakness as candidate C1, as quoted in their rules_out/blocked_by fields"]
mechanism_brief = "redirect target scheme is never re-validated against allowHttp/https policy at fetch-client.ts:406-412 (and the redirect:follow branch), so an http Location on a 3xx downgrades to cleartext despite allowHttp=false"
why_failed_brief = "source-confirmed defect but an exact typed duplicate/subsumption of already-confirmed VIABLE findings js-sdk-3210675ec7643a3184fe756f and js-sdk-cda4d93790ffd066b1523001 at the same sink and fix point"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:stripCrossOriginAuth"
guarantee = "stripCrossOriginAuth removes authorization/proxy-authorization/cookie on cross-origin hops but does not re-apply the https/allowHttp scheme policy to the redirect target"

[[blockers]]
kind = "duplicate"
source = "src/http-client/fetch-client.ts:boundedFetchAdapter"
guarantee = "the redirect-scheme non-revalidation defect at fetch-client.ts:406-412 is already recorded VIABLE for the stellar.toml (js-sdk-3210675ec7643a3184fe756f) and federation (js-sdk-cda4d93790ffd066b1523001) callers; C1 is the generalized restatement of the same single sink and fix point"
```
