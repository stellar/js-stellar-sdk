# R001: Federation resolution GET follows server-controlled redirects (SSRF)

**Date**: 2026-06-17
**Subsystem**: federation
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/federation/001-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full path in current source.

1. `FederationServer.resolveAddress` / `resolveAccountId` / `resolveTransactionId`
   (`src/federation/server.ts:166-219`) build a query URL from `this.serverURL`
   and call `this._sendRequest(url)`.
2. `_sendRequest` (`src/federation/server.ts:221-228`) calls
   `httpClient.get(url, { maxContentLength: FEDERATION_RESPONSE_MAX_SIZE, timeout })`.
   It passes **no `maxRedirects`** — confirmed at lines 224-228.
3. The default adapter (`src/http-client/fetch-client.ts:482-490`) selects
   `boundedFetchAdapter` whenever `maxRedirects !== undefined || maxContentLength
   !== undefined`. Because `maxContentLength` is set, the bounded adapter is used.
4. In `boundedFetchAdapter`, `managedRedirects = maxRedirects !== undefined`
   (`fetch-client.ts:348`) is **false**, so the redirect policy resolves to
   `redirect = "follow"` (`fetch-client.ts:351-352`).
5. The request loop runs `fetch(currentUrl, currentInit)` with `redirect:
   "follow"` (`fetch-client.ts:383`). The manual hop-enforcement block —
   `isManualRedirectResponse = redirect === "manual" && 3xx`
   (`fetch-client.ts:393-394`) — is `false`, so the loop `break`s at line 395.
   The hop cap, `applyRedirectSemantics`, `stripCrossOriginAuth`, and the
   `new URL(location, currentUrl)` host/scheme handling (`fetch-client.ts:397-412`)
   are all skipped.
6. Native fetch therefore follows the server-supplied `3xx Location` itself,
   with no host allowlist, no same-origin restriction, and no SDK hop cap. The
   redirected body is read by `readBodyBounded` and returned to the application
   as `response.data` (the federation `Record`) via `_sendRequest`'s `.then`
   (`server.ts:229-237`).

The `boundedFetchAdapter` header comment (`fetch-client.ts:322-327`) states the
adapter exists precisely so these controls "are not silently a no-op, allowing
redirect-based SSRF and unbounded-response DoS." The federation request never
engages that protection.

## Findings

A malicious or compromised federation server (the domain owner controls
`FEDERATION_SERVER` in its own `stellar.toml`, or a server is compromised) can
answer the resolution GET with `302 Location: http://169.254.169.254/...`,
`http://localhost:.../`, or any internal host. Native fetch follows the redirect
from the SDK's own network position — which is the SSRF asset, since the attacker
cannot reach those internal targets directly but the SDK (e.g. a server-side
wallet/backend embedding the SDK) can. The internal target's response body is
JSON/text-decoded and returned to the calling application as the federation
record, enabling read-SSRF / internal data exfiltration and request forgery
against internal services.

This is `maxContentLength`-bounded (final body capped by streamed
`readBodyBounded`, `fetch-client.ts:153-193,437`), so it is not the unbounded-DoS
variant; it is the redirect-target-control (SSRF) variant. The constructor HTTPS
gate (`server.ts:154-156`) validates only the pre-redirect `serverURL` and does
not re-run on the redirected target, so it does not block this path.

Severity Medium under the impact category "remote-response trust confusion /
network request integrity" — a remote response steers an outbound SDK request to
an attacker-chosen internal host with no SDK-level redirect control.

This is distinct from prior [1] (VIABLE, `route_id
js-sdk-3210675ec7643a3184fe756f`, scope `stellar_toml_resolution`), which covers
the **manual** redirect loop (`fetch-client.ts:406-412`) on the stellar.toml
fetch where `maxRedirects > 0`. This candidate is on the federation GET
(`route_id js-sdk-cda4d93790ffd066b1523001`) and the `redirect = "follow"`
branch, where the manual loop never executes.

## PoC Guidance

- **Test file**: append to an existing federation unit test under
  `test/unit/federation_server_test.js` (or the TS equivalent), mirroring the
  existing mocked-response pattern.
- **Setup**: construct `new FederationServer("https://acme.com/federation",
  "acme.com")` (default `allowHttp = false`). Mock the global `fetch` so the
  first request to the federation URL returns `302` with `Location:
  http://169.254.169.254/latest/meta-data/`, and the redirected URL returns a
  JSON body (e.g. `{ "account_id": "G...", "secret": "internal" }`).
- **Steps**: call `resolveAddress("bob*acme.com")`.
- **Assertion**: assert that fetch was invoked against the internal redirect
  target (or that the returned record contains the internal body), demonstrating
  the SDK followed the server-controlled redirect with no host restriction. A
  fix should instead cap/refuse the redirect (pass `maxRedirects` or restrict
  targets) so the resolution does not reach the internal host.

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
impact_class = "network_integrity"
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
rules_out = ["source trace of _sendRequest (server.ts:221-228) and boundedFetchAdapter (fetch-client.ts:348-413) confirms no maxRedirects is passed, redirect resolves to follow, and the manual hop loop with host/scheme/allowlist handling is skipped, so no guard blocks following a server-supplied 3xx Location to an internal host"]
does_not_rule_out = ["scheme-downgrade-specific allowHttp bypass on the same branch, tracked separately as C2", "the manual-loop stellar.toml route covered by prior js-sdk-3210675ec7643a3184fe756f"]
assumptions = ["the SDK runs in a network position (e.g. server-side backend) where internal targets are reachable while the attacker is not, which is the standard SSRF precondition", "native fetch follows a single server-supplied 3xx Location under redirect=follow, source-confirmed to be unguarded by the SDK"]
mechanism_brief = "Federation _sendRequest sets maxContentLength but not maxRedirects, so boundedFetchAdapter uses redirect=follow and native fetch follows a server-supplied 3xx Location to an arbitrary/internal host with no host allowlist or hop enforcement; the redirected body is returned as the federation record."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "maxContentLength bounds the final body but does not constrain redirect targets; constructor https gate (server.ts:154-156) validates only the pre-redirect serverURL and does not re-run on the redirected host"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:boundedFetchAdapter"
guarantee = "no host allowlist, same-origin, or hop-cap guard runs on the redirect=follow branch for the federation get path"
```
