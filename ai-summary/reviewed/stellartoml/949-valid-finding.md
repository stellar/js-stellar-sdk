# R949: allowHttp=false transport policy bypassed by unchecked redirect-hop scheme downgrade in Resolver.resolve

**Date**: 2026-06-18
**Subsystem**: stellartoml
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/stellartoml/949-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full path in current source.

- `src/stellartoml/index.ts:38-67` — `Resolver.resolve` computes `protocol = allowHttp ? "http" : "https"` (`index.ts:52`) and uses it ONLY to build the initial URL `${protocol}://${domain}/.well-known/stellar.toml` (`index.ts:55`). `allowedRedirects` is a public, documented option (`StellarTomlResolveOptions.allowedRedirects?: number`, `index.ts:97`) passed straight through as `maxRedirects: opts.allowedRedirects ?? 0` (`index.ts:56`). The `protocol`/`allowHttp` decision is never threaded into the redirect handling.
- Because `maxRedirects` and `maxContentLength` are set, the request is served by `boundedFetchAdapter` (`fetch-client.ts:328-453`).
- Redirect loop `fetch-client.ts:381-413`: on a Node manual-redirect response it reads `location` (`:406`), computes `nextUrl = new URL(location, currentUrl).toString()` (`:408`), applies `applyRedirectSemantics` (`:409`) and `stripCrossOriginAuth` (`:410`), then sets `currentUrl = nextUrl` (`:411`) and continues. **There is no check that `nextUrl` keeps the `https:` scheme and no re-consultation of `allowHttp`.** A server-supplied `Location: http://...` is accepted verbatim — `new URL("http://...", currentUrl)` yields an `http:` URL and `fetch` follows it.
- `applyRedirectSemantics` (`fetch-client.ts:257-269`) only adjusts method/body for 301/302/303 vs 307/308. It does not touch scheme/host.
- `stripCrossOriginAuth` (`fetch-client.ts:276-294`) only deletes `authorization`/`proxy-authorization`/`cookie` on cross-origin hops. It performs no scheme or host-policy enforcement.

So an `allowHttp=false` (https) request started by `resolve` is silently downgraded to plain `http://` (or redirected to an arbitrary/internal host) on any attacker-controlled redirect hop, defeating the documented transport-security control ("This must be set to false in production deployments!", `index.ts:23`).

### Expected Behavior validation

The hypothesis's Expected Behavior is correct and source-backed: `allowHttp=false` is documented as a hard transport-security control. A resolver invoked with `allowHttp=false` should keep every hop on https or refuse a downgrading hop. The actual code deviates — it re-applies the scheme decision only to the first URL, never to redirect targets. This is a genuine deviation from the documented contract, i.e. a real bug.

### Default-config safety confirmed (precondition)

- Default `allowedRedirects` is `0` (`index.ts:56`). In Node, `maxRedirects===0` → `redirect: "manual"` and the first 3xx is refused at `fetch-client.ts:397-404` (`redirectsRemaining <= 0`). In browsers, `maxRedirects===0` → `redirect: "error"` (`fetch-client.ts:355-356`). So the default configuration is NOT affected — the bug requires the caller to opt into `allowedRedirects > 0`.
- Browser with `allowedRedirects > 0` → `redirect: "follow"` (`fetch-client.ts:357-358`), where the browser's native mixed-content policy blocks https→http. The bypass is therefore strongest/realistic in Node (server-side SDK usage), where the manual loop has no mixed-content guard.

## Findings

Security impact: HTTPS/`allowHttp` policy bypass for a stellar.toml fetch, with SSRF-to-attacker/internal-host as a co-effect. Per the objective impact table, an `allowHttp` gate bypass for stellar.toml requests has a Medium severity floor, so this is **Medium**.

Exploitability: an application calls `Resolver.resolve(domain, { allowHttp: false, allowedRedirects: 1 })` in Node. The attacker controls `domain` and answers the initial https request with `302 Location: http://attacker-or-internal/.well-known/stellar.toml`. The adapter follows over plain http and returns the http-fetched TOML as if the app's https policy held. The TOML body then feeds downstream SDK consumers (federation server URLs, web-auth endpoints), so a downgraded/SSRF'd response can carry attacker-chosen endpoint data while the caller believes https was enforced end-to-end.

Realistic but conditional: requires caller opt-in to redirects (`allowedRedirects > 0`) and the Node runtime. This is an SDK-side policy bug, not caller misuse — enabling redirects does not waive the documented `allowHttp=false` guarantee.

Novelty: the same `boundedFetchAdapter` redirect-loop scheme/host defect was already found VIABLE on the sibling federation route `js-sdk-3210675ec7643a3184fe756f`. That is a different route_id / trust boundary (federation `createForDomain`, domain gated by `validateDomain`) and is treated as anti-evidence only, not route closure. On THIS route (`js-sdk-a0a2d5acc9407b3ba398d119`, the direct public `Resolver.resolve` API) the only prior VIABLE findings are the `timeout=0` body read and the initial-`domain` normalization; neither covers redirect-hop scheme downgrade. The material additions here are the `allowHttp` documented-policy-bypass framing and the direct public-API trust path.

## PoC Guidance

- **Test file**: append to an existing stellartoml unit test (e.g. `test/unit/stellar_toml_test.js`), reusing its existing HTTP-mock pattern; do not contact public infrastructure.
- **Setup**: mock the Node fetch/HTTP layer so the initial `https://domain/.well-known/stellar.toml` returns `302` with `Location: http://internal.example/.well-known/stellar.toml`, and the http URL returns a valid TOML body.
- **Steps**: call `StellarToml.Resolver.resolve("domain", { allowHttp: false, allowedRedirects: 1 })`.
- **Assertion**: the second (followed) request was made over `http://` and the resolved TOML is the http-served body — proving an `allowHttp=false` resolve completed a plain-http hop. Optionally assert the redirect can target a different (internal) host. Contrast with `allowedRedirects: 0`, which rejects the first 3xx.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "stellartoml"
route_id = "js-sdk-a0a2d5acc9407b3ba398d119"
weakness = "network request integrity"
record_kind = "single_path"
path = ["resolve", "get"]
sink = "get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:applyRedirectSemantics", "src/http-client/fetch-client.ts:stripCrossOriginAuth"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace of the boundedFetchAdapter redirect loop (fetch-client.ts:406-412) confirms no scheme-preservation/allowHttp re-check blocks following a server-supplied http:// Location on this direct Resolver.resolve route", "stripCrossOriginAuth (fetch-client.ts:276-294) and applyRedirectSemantics (fetch-client.ts:257-269) do not enforce scheme/host, so neither blocks the downgrade", "default allowedRedirects=0 refuses the first 3xx (fetch-client.ts:397-404), so this candidate is independent of the size cap and the timeout=0 prior finding on the same route_id"]
does_not_rule_out = ["the same redirect-loop defect reached via the sibling federation route_id js-sdk-3210675e (separate trust boundary)", "ssrf_to_internal_host_via_same_redirect", "browser_native_redirect_follow_cap_widened_to_20"]
assumptions = ["caller opts into redirects (allowedRedirects > 0) so the Node manual-redirect loop is entered; default 0 refuses the first 3xx", "Node runtime (canInspectManualRedirects true); browser native mixed-content policy mitigates the https->http case"]
mechanism_brief = "redirect loop follows a server Location and downgrades https->http (or to an arbitrary host) with no allowHttp/scheme re-check, bypassing the documented allowHttp=false transport policy on a public Resolver.resolve fetch"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:stripCrossOriginAuth"
guarantee = "removes authorization/proxy-authorization/cookie on cross-origin hops but does not validate scheme or host, so it does not block this downgrade"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:boundedFetchAdapter"
guarantee = "maxContentLength is streamed-enforced and default maxRedirects=0 refuses all redirects; this candidate requires allowedRedirects>0 and is independent of the size cap"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:boundedFetchAdapter"
guarantee = "no scheme-preservation or allowHttp re-check exists in the redirect loop (fetch-client.ts:406-412) for the direct Resolver.resolve route"
```
