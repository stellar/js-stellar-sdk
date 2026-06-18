# F963: Cross-origin credential-header leak on Horizon redirect (non-viable)

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/963-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The structural claim is source-confirmed: `stripCrossOriginAuth`
(`src/http-client/fetch-client.ts:276-294`) is called only from inside
`boundedFetchAdapter` (line 410), and the default Horizon adapter
(`fetch-client.ts:482-490`) never invokes `boundedFetchAdapter` because no
Horizon request sets `maxRedirects`/`maxContentLength`. Caller credentials are
attached at `src/horizon/server.ts:103-118` (`X-Auth-Token` from
`opts.authToken`) and via the documented
`server.httpClient.defaults.headers['Authorization']` (server.ts:85). So on a
redirect, the SDK does not run its own credential-stripping helper.

However, tracing the actual exposure under the objective threat model shows the
claimed High-severity credential exfiltration does not hold.

## Why It Failed

Two independent reasons, each sufficient:

1. **No new exposure under the defined trust boundary.** The objective fixes
   `scope.trust_boundary = remote_horizon_server`: the caller-selected Horizon
   server *is* the attacker. Both `Authorization` and `X-Auth-Token` are sent
   directly to that Horizon server on **every** normal request. The attacker
   therefore already possesses these credentials before any redirect. A redirect
   that forwards the same headers to another attacker-chosen host delivers the
   credential to the *same* adversary — it is not a new exposure. The only way
   the redirect target is a different party than the credential's intended
   recipient is a network MITM injecting the redirect, which requires either
   plaintext `allowHttp` (where the credential is already exposed on the wire)
   or TLS interception — explicitly OUT_OF_SCOPE ("TLS interception without an
   SDK validation bug"). There is no honest third party in this model to leak to.

2. **The cited defense would not change the outcome, and native fetch already
   covers the one header it targets.** `stripCrossOriginAuth` deletes only
   `authorization`, `proxy-authorization`, and `cookie` (fetch-client.ts:290-292).
   It does **not** strip the custom `X-Auth-Token` header, so wiring it in would
   not protect the SDK's own auth-token header — the candidate's central
   credential. Meanwhile, for the `Authorization` header it does target, the
   Fetch standard requires native fetch (undici in supported Node, and modern
   browsers) to drop `Authorization` on cross-origin redirects automatically;
   origin includes scheme and port, so https→http downgrade and host/port
   changes are all cross-origin and trigger that built-in stripping. The
   candidate's own Anti-Evidence concedes this is "environment-dependent."

Together: the credential the SDK manages itself (`X-Auth-Token`) is not covered
by the named defense at all, and the `Authorization` header is already protected
by the runtime — and in either case the trust-boundary attacker already holds
the credential. This does not meet the High floor (or any floor) for credential
exfiltration.

## What This Rules Out

The specific claim that the missing `stripCrossOriginAuth` wiring causes a
High-severity, in-scope credential exfiltration of `Authorization`/`X-Auth-Token`
to an attacker via Horizon redirect.

## What This Does Not Rule Out

- The redirect-follow weakness itself (transport SSRF / HTTPS downgrade) remains
  real — covered by prior [2] (VIABLE) and re-confirmed as C1 (duplicate).
- Unbounded response-body exhaustion on the same bypass (C3, reviewed VIABLE).
- A credential-leak finding under a *different* trust model where an honest
  Horizon server is distinct from the redirect target (not this objective's
  scope) is not assessed here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "cross_origin_credential_leak_on_redirect"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post", "createFetchClient.adapter", "native_fetch_follow_location"]
sink = "httpClient.post"
sink_role = "http_transport"
impact_class = "credential_exfiltration"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:stripCrossOriginAuth", "src/http-client/fetch-client.ts:createFetchClient", "src/horizon/server.ts:constructor"]
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
negative_claim.rules_out_codes = ["credential_already_held_by_trust_boundary_attacker", "defense_does_not_cover_named_header"]
rules_out = ["High-severity credential exfiltration via missing stripCrossOriginAuth: under trust_boundary=remote_horizon_server the attacker already receives Authorization/X-Auth-Token on every direct request, so redirecting them to another attacker host is not a new exposure; additionally stripCrossOriginAuth does not strip X-Auth-Token, and native fetch already strips Authorization on cross-origin redirects"]
does_not_rule_out = ["the redirect-follow transport weakness itself (C1/prior [2] VIABLE)", "unbounded response-body exhaustion (C3 VIABLE)", "a credential-leak finding under a different trust model with an honest Horizon distinct from the redirect target"]
assumptions = ["objective fixes the Horizon server as the trust-boundary attacker that already receives caller credentials on direct requests", "supported runtimes (undici/Node 20+, modern browsers) implement the Fetch-spec cross-origin Authorization stripping", "MITM-injected redirects require allowHttp plaintext or out-of-scope TLS interception"]
mechanism_brief = "stripCrossOriginAuth is unreachable on the Horizon path, but it only strips authorization/proxy-authorization/cookie (not the SDK's X-Auth-Token), native fetch already strips Authorization cross-origin, and under the objective trust model the attacker Horizon server already holds these credentials, so the redirect forwards nothing the adversary lacks."
why_failed_brief = "no new credential exposure under the defined trust boundary; named defense does not cover X-Auth-Token and native fetch already covers Authorization"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:stripCrossOriginAuth"
guarantee = "stripCrossOriginAuth (fetch-client.ts:276-294) deletes only authorization/proxy-authorization/cookie on cross-origin redirect; it does not cover X-Auth-Token and is unreachable on the Horizon path, while native fetch independently strips Authorization on cross-origin redirects in supported runtimes"

[[blockers]]
kind = "out_of_scope"
source = "src/horizon/server.ts:103-118"
guarantee = "under trust_boundary=remote_horizon_server the attacker already receives Authorization/X-Auth-Token on the direct request; a non-redundant leak requires an honest third party reachable only via out-of-scope TLS interception or allowHttp plaintext where the credential is already exposed"
```
