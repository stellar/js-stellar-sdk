# R904-1: Unvalidated `domain` interpolated raw into stellar.toml fetch URL enables host/path confusion

**Date**: 2026-06-17
**Subsystem**: stellartoml
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/stellartoml/904-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`Resolver.resolve` (`src/stellartoml/index.ts:38-89`) computes
`protocol = allowHttp ? "http" : "https"` and calls:

```
httpClient.get(`${protocol}://${domain}/.well-known/stellar.toml`, {
  maxRedirects: opts.allowedRedirects ?? 0,
  maxContentLength: STELLAR_TOML_MAX_SIZE,
  ...
})
```

(`src/stellartoml/index.ts:54-67`). `domain` is the raw caller-supplied string —
no `new URL()` parse, no host validation, no percent-encoding, no rejection of
`@`, `/`, `?`, `#`, `\`, or whitespace is performed anywhere in `resolve`.

Because `maxContentLength` is always set, the request is dispatched through
`boundedFetchAdapter` (`src/http-client/fetch-client.ts:482-490` route the
adapter whenever `maxContentLength !== undefined || maxRedirects !== undefined`).
Inside the adapter, the URL is produced by `buildBoundedUrl`
(`fetch-client.ts:105-117`): for an absolute URL the guard
`!/^https?:\/\//i.test(url)` is false, so the `baseURL` rewrite is skipped, no
`params` are present, and the function returns `config.url` **unchanged**. That
string becomes `currentUrl` and is handed directly to `fetch(currentUrl, ...)`
(`fetch-client.ts:377-383`).

The WHATWG URL parser that `fetch` applies then reinterprets the structure:
`https://good.com@evil.com/.well-known/stellar.toml` parses with userinfo
`good.com` and **host `evil.com`**, so the SDK contacts `evil.com` while the
caller-facing `domain` string "looks like" `good.com`. Likewise `/`, `?`, `#`,
or `\` in `domain` redirect the path/query the request actually targets.

## Findings

**Security impact**: request-target / remote-response trust confusion. The
returned TOML (its `FEDERATION_SERVER`, `WEB_AUTH_ENDPOINT`, `SIGNING_KEY`) is
attributed by callers to the nominal `domain`, but the bytes can come from a
different host than the `domain` string visually denotes. This maps to the
objective's "Remote-response trust confusion" impact category (Medium floor).

**Exploitability / precondition**: materiality requires `domain` to be
*partially* trusted — e.g. a domain segment derived from a federation address,
an anchor domain pulled from config/user input, or any string the application
later attributes back to a specific origin for a security decision. If the
attacker controls the *entire* `domain` string outright, contacting an arbitrary
host is not an escalation (garbage-in), which is why this is Medium, not High.
The defect is a genuine SDK-level missing-normalization gap: the documented API
contract (`@param domain - Domain to get stellar.toml file for`) implies a bare
host, but the implementation silently accepts and dispatches arbitrary URL
syntax.

**Novelty**: distinct from prior VIABLE redirect-follow SSRF
(`js-sdk-3210675ec7643a3184fe756f`, prior [1]) — that mechanism needs
`allowedRedirects > 0` and a malicious 3xx `Location`; this confusion happens at
URL construction *before the first hop* and is live at the default
`allowedRedirects = 0`. Not subsumed by federation redirect SSRF (prior [2]) or
parse-side findings (priors [3]/[4]).

## PoC Guidance

- **Test file**: append to `test/unit/stellar_toml_test.js` (existing
  stellartoml resolver unit tests with mocked HTTP).
- **Setup**: stub the HTTP layer / intercept the outgoing fetch URL. Use the
  existing mocking style in that file (axios-mock-adapter or fetch mock).
- **Steps**: call `StellarToml.Resolver.resolve("good.com@evil.com", {})` and
  capture the URL the transport actually requests (or the host the mock matches).
- **Assertion**: assert the contacted host is `evil.com` (the userinfo form
  diverts the host) even though the caller passed a `domain` string beginning
  with `good.com`. A complementary assertion: `resolve("good.com/evil")` or
  `resolve("good.com?x")` changes the request path/query away from
  `https://good.com/.well-known/stellar.toml`. This demonstrates the absence of
  host/path normalization for the `domain` argument.

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
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:buildBoundedUrl"]
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
rules_out = ["source trace of resolve (index.ts:54-67) and buildBoundedUrl (fetch-client.ts:105-117) confirms no new URL() normalization, host validation, or encoding runs on domain before fetch(currentUrl); the absolute-URL branch returns config.url unchanged so userinfo@host/path/query/backslash in domain change the host or path fetch contacts"]
does_not_rule_out = ["redirect-follow SSRF on same get path (prior VIABLE route js-sdk-3210675ec7643a3184fe756f)", "flows where the caller fully controls the domain string (no attribution gap, not an escalation)"]
assumptions = ["materiality requires domain to be partially trusted and later attributed to a nominal origin; resolve always passes maxContentLength so boundedFetchAdapter is the live path"]
mechanism_brief = "resolve interpolates domain raw into the fetch URL with no validation/encoding; buildBoundedUrl returns the absolute URL unchanged so userinfo@host, path, query, or backslash in domain change the host/path fetch contacts while callers attribute the toml to the nominal domain."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:buildBoundedUrl"
guarantee = "buildBoundedUrl leaves absolute https URLs unchanged (regex ^https?:// matches, no baseURL rewrite, no params); no domain validation/encoding in resolve"

[[blockers]]
kind = "not_found"
source = "src/stellartoml/index.ts:resolve"
guarantee = "no source-proven host/scheme normalization runs on domain before fetch for this path"
```
