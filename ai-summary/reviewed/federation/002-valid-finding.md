# R002: Federation resolution GET follows HTTPS->HTTP downgrade redirect (allowHttp bypass)

**Date**: 2026-06-17
**Subsystem**: federation
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/federation/001-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full path in current source.

1. The constructor (`src/federation/server.ts:137-157`) enforces HTTPS unless
   `allowHttp` is set: `if (this.serverURL.protocol !== "https:" && !allowHttp)
   throw new Error("Cannot connect to insecure federation server")`
   (`server.ts:154-156`). This check runs **only against the constructor
   `serverURL`** (`server.ts:142`). With default `allowHttp = false`, the initial
   federation server must be `https://`.
2. `resolveAddress` / `resolveAccountId` / `resolveTransactionId` build the
   query URL from `this.serverURL` and call `_sendRequest`
   (`server.ts:166-219`).
3. `_sendRequest` (`server.ts:221-228`) calls `httpClient.get` with
   `maxContentLength` and `timeout` only — **no `maxRedirects`** (lines 224-228).
4. `boundedFetchAdapter` is selected (`fetch-client.ts:482-490`) and resolves the
   redirect policy to `redirect = "follow"` because `managedRedirects =
   maxRedirects !== undefined` is `false` (`fetch-client.ts:348,351-352`).
5. In the request loop, `fetch(currentUrl, { ..., redirect: "follow" })` is
   issued (`fetch-client.ts:383`). The manual branch is skipped
   (`isManualRedirectResponse` requires `redirect === "manual"`,
   `fetch-client.ts:393-395`), so there is **no scheme-preservation check** — the
   `new URL(location, currentUrl)` resolution and any per-hop handling at
   `fetch-client.ts:406-412` never run.
6. Native fetch follows a `Location: http://...` redirect, so the actual
   federation lookup completes over cleartext HTTP and the http body is decoded
   and returned as the federation `Record`.

## Findings

A caller with default `allowHttp = false` requires the federation lookup to use
HTTPS. The constructor enforces this only on the pre-redirect URL. An
attacker-controlled or compromised HTTPS federation server can respond `302
Location: http://<host>/federation`; because the federation GET uses
`redirect = "follow"` with no scheme-preservation guard, native fetch follows the
HTTPS->HTTP downgrade and the lookup is completed over cleartext. The caller's
`allowHttp = false` policy is bypassed: the federation record (account id, memo
type, memo used to direct payments) is fetched over an unauthenticated cleartext
channel that an on-path attacker can read and tamper with.

This maps directly to the impact category "HTTPS policy or allowHttp gate bypass
for federation, stellar.toml, RPC, Horizon, or Friendbot requests" with severity
floor Medium. The deviation from expected behavior is concrete: the constructor's
`server.ts:154-156` policy intends "no insecure federation connection without
opt-in," but the resolution GET silently downgrades via redirect.

This is distinct in impact from C1 (arbitrary-host SSRF / network integrity);
C2 is specifically the cleartext-downgrade policy bypass, and distinct from prior
[1] (`route_id js-sdk-3210675ec7643a3184fe756f`, scope `stellar_toml_resolution`,
the manual `maxRedirects > 0` loop). C2 is on the federation GET
(`route_id js-sdk-cda4d93790ffd066b1523001`), `redirect = "follow"` branch.

## PoC Guidance

- **Test file**: append to an existing federation unit test under
  `test/unit/federation_server_test.js` (or TS equivalent), reusing the mocked
  fetch/response pattern.
- **Setup**: `new FederationServer("https://acme.com/federation", "acme.com")`
  with default `allowHttp = false`. Mock global `fetch` so the request to the
  `https://` federation URL returns `302` with `Location:
  http://acme.com/federation`, and the `http://` URL returns a valid federation
  JSON body.
- **Steps**: call `resolveAddress("bob*acme.com")`.
- **Assertion**: assert that fetch was invoked against the `http://` (cleartext)
  URL and that the record resolved, demonstrating the lookup completed over HTTP
  despite `allowHttp = false`. A fix should reject a scheme-downgrade redirect
  (or pass `maxRedirects` with scheme preservation) so the resolution fails
  closed rather than downgrading.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "federation"
route_id = "js-sdk-cda4d93790ffd066b1523001"
weakness = "Network Request Integrity"
record_kind = "single_path"
path = ["<anonymous>", "get"]
sink = "get"
sink_role = "network_request"
impact_class = "https_policy_bypass"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/federation/server.ts:_sendRequest", "src/http-client/fetch-client.ts:boundedFetchAdapter"]
scope.trust_boundary = "remote_federation_server"
scope.protocol_phase = "federation_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_address_and_remote_response"
scope.parser_state = "json_decoded"
scope.size_class = "bounded_by_federation_response_limit"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms the constructor https gate (server.ts:154-156) runs only on the pre-redirect serverURL, _sendRequest passes no maxRedirects, redirect resolves to follow, and the follow branch has no scheme-preservation check, so a https->http redirect is followed and completes the lookup over cleartext"]
does_not_rule_out = ["arbitrary-host SSRF impact on the same branch, tracked as C1", "the manual-loop stellar.toml route covered by prior js-sdk-3210675ec7643a3184fe756f"]
assumptions = ["native fetch follows a server-supplied https->http 3xx Location under redirect=follow (source-confirmed unguarded by the SDK)", "caller uses default allowHttp=false so the https policy is in effect"]
mechanism_brief = "Constructor enforces https unless allowHttp on the initial federation URL only; the resolution GET sets no maxRedirects so redirect=follow lets native fetch follow a server-supplied https->http redirect, completing the federation lookup over cleartext despite allowHttp=false."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/federation/server.ts:constructor"
guarantee = "server.ts:154-156 https gate only validates the constructor serverURL, not redirected hops"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:boundedFetchAdapter"
guarantee = "no scheme-preservation guard runs on the redirect=follow branch for the federation get path"
```
