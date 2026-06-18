# R001: HTTPS/allowHttp policy not enforced across redirect hops on stellar.toml fetch (downgrade + SSRF)

**Date**: 2026-06-17
**Subsystem**: stellartoml
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/stellartoml/001-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`Resolver.resolve(domain, opts)` (`src/stellartoml/index.ts:38-89`) computes
`protocol = allowHttp ? "http" : "https"` (`:52`) and, when `allowHttp=false`,
issues an `https://` request. It forwards the public, documented option
`allowedRedirects` as `maxRedirects: opts.allowedRedirects ?? 0` (`:56`;
interface at `src/stellartoml/index.ts:97`) and always sets
`maxContentLength: STELLAR_TOML_MAX_SIZE`, so the request always routes through
`boundedFetchAdapter` (`src/http-client/fetch-client.ts:482-490`).

In `boundedFetchAdapter` the Node manual-redirect chain (`fetch-client.ts:381-413`)
reads `location = response.headers.get("location")` (`:406`), computes
`nextUrl = new URL(location, currentUrl).toString()` (`:408`), applies method
semantics via `applyRedirectSemantics` and credential stripping via
`stripCrossOriginAuth` (`:409-410`), then sets `currentUrl = nextUrl` and loops
(`:411-412`). There is no comparison of `new URL(nextUrl).protocol` to the
original `https:` scheme and no host allowlist — any scheme (including `http:`)
and any host is followed. The redirected body is read (size-bounded only) and
returned to `resolve`, which parses it as the trusted stellar.toml (`index.ts:70`).

I confirmed the guards present do not block this path:
- `stripCrossOriginAuth` (`fetch-client.ts:276-294`) only deletes
  `authorization`/`proxy-authorization`/`cookie` on cross-origin hops; it does
  not refuse the request or constrain scheme/host.
- `readBodyBounded` (`fetch-client.ts:153-193`) enforces only `maxContentLength`
  (header + streamed running-total cap), not scheme or destination.
- The browser path forces `redirect: "follow"` when `maxRedirects > 0`
  (`fetch-client.ts:357-358`), so redirect downgrades there happen entirely
  outside the adapter's control.

Default `allowedRedirects` is `0`, which in Node yields `redirect: "manual"` with
`redirectsRemaining = 0`, so the first 3xx is refused (`:397-403`). The candidate
therefore requires the application to opt into `allowedRedirects > 0` — a
supported, documented option, not the disabling of a security control.

Expected-behavior check: the `allowHttp` contract is documented as "Allow
connecting to http servers. This must be set to false in production deployments!"
(`src/config.ts:5-9`, `src/stellartoml/index.ts:23`). With `allowHttp=false` the
SDK promises not to connect to plaintext http servers, yet a server-supplied
`Location: http://...` causes exactly that connection. The code genuinely
deviates from the documented invariant — this is a real bug, not
working-as-designed. Notably the authors explicitly designed the bounded adapter
against "redirect-based SSRF" (`fetch-client.ts:272-275, 322-327`) but only via
credential stripping, leaving scheme-downgrade and arbitrary-host targets open.

## Findings

Impact: HTTPS/allowHttp policy bypass and redirect SSRF on the stellar.toml
fetch. A malicious or compromised host for `domain` (a realistic remote server,
fully in scope as the attacker-controlled trust boundary) can return
`301/302 Location: http://evil.example/...` to downgrade the connection to
plaintext, or `Location: http://169.254.169.254/...` (or any internal host) to
make the SDK issue a request to an arbitrary attacker-chosen destination. The
fetched body is then accepted and parsed as the authoritative stellar.toml for
the original domain, which downstream federation/web-auth consumers treat as
trusted. This matches the objective's Medium floor: "HTTPS policy or allowHttp
gate bypass for ... stellar.toml" and "Parser ambiguity or unbounded ... handling"
is not the issue here — the integrity boundary (scheme/host of the fetched
config) is.

Exploitability is gated on the application enabling `allowedRedirects > 0`, which
caps confidence to medium but keeps the finding in scope because enabling
redirects is a documented, ordinary configuration, not a deliberate weakening of
a control. No fund loss or signing path is directly implicated, so severity is
Medium, not High.

## PoC Guidance

- **Test file**: append to an existing stellartoml fetch unit test under
  `test/unit/` that already mocks `httpClient`/fetch responses (the suite that
  asserts the `maxContentLength`/redirect messages against
  `src/stellartoml/index.ts`).
- **Setup**: mock the fetch layer so the first response to
  `https://<domain>/.well-known/stellar.toml` returns `302` with
  `Location: http://evil.example/.well-known/stellar.toml`, and the second
  (plaintext `http://evil.example/...`) returns a benign TOML body. Call
  `Resolver.resolve(domain, { allowHttp: false, allowedRedirects: 1 })`.
- **Steps**: drive the two-hop redirect through `boundedFetchAdapter` in the Node
  (`canInspectManualRedirects`) path.
- **Assertion**: assert that the second request URL observed by the mock has
  protocol `http:` (i.e., the SDK followed a downgrade despite `allowHttp=false`),
  and that `resolve` returns the attacker's TOML object. A passing assertion
  demonstrates the policy bypass; the eventual fix should make `resolve` reject
  on a scheme downgrade.
- Run with `yarn build:node` then a targeted `yarn test:node -- <path>`; do not
  contact public infrastructure.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "stellartoml"
route_id = "js-sdk-3210675ec7643a3184fe756f"
weakness = "HTTPS/allowHttp policy not enforced across redirect hops on the stellar.toml fetch"
record_kind = "single_path"
path = ["<anonymous>", "get"]
sink = "get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:boundedFetchAdapter"]
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
rules_out = ["source trace of the boundedFetchAdapter redirect loop (fetch-client.ts:406-412) confirms no scheme-preservation or host-allowlist guard blocks following a server-supplied http:// or arbitrary-host Location; stripCrossOriginAuth and readBodyBounded constrain only credentials and size, not scheme or destination"]
does_not_rule_out = ["domain string injected unvalidated into the initial request URL in resolve (separate route)", "no request timeout when Config.timeout is zero default", "redirect-follow behavior in non-Node runtimes beyond the manually traced Node manual-redirect chain"]
assumptions = ["application sets allowedRedirects > 0 for the resolve call (supported, documented option) with allowHttp=false", "attacker controls the HTTP response for the resolved domain, a realistic remote server"]
mechanism_brief = "With allowedRedirects>0 and allowHttp=false, boundedFetchAdapter follows a server-supplied 3xx Location to an http:// or arbitrary-host target with no per-hop scheme or host check, downgrading the HTTPS stellar.toml fetch and enabling redirect SSRF; the browser path forces redirect:follow."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "maxContentLength is enforced on redirected responses but constrains only size, not scheme or destination host"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:stripCrossOriginAuth"
guarantee = "stripCrossOriginAuth removes auth/cookie headers cross-origin but does not block the downgraded/redirected request or enforce scheme/host"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:boundedFetchAdapter"
guarantee = "no source-proven scheme-preservation or host-allowlist guard exists in the boundedFetchAdapter redirect loop for this path"
```
