# F916: Unvalidated domain interpolation enabling host/authority confusion at stellar.toml request URL

**Date**: 2026-06-18
**Subsystem**: stellartoml
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/stellartoml/916-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's claimed source mechanism is accurate and current:

- `src/stellartoml/index.ts:54-67` — `Resolver.resolve` builds the request URL
  by raw template interpolation:
  `` `${protocol}://${domain}/.well-known/stellar.toml` ``. The whole function
  (38-89) contains no validation, canonicalization, or encoding of `domain`.
- `src/http-client/fetch-client.ts:105-117` — `buildBoundedUrl` returns the
  string verbatim. For this call there is no `params` (skips the query branch)
  and the url already carries an `https?://` prefix, so the `baseURL` branch at
  line 107 is skipped and no `new URL()` normalization runs.
- `src/http-client/fetch-client.ts:377,383` — `currentUrl = buildBoundedUrl(config)`
  is passed directly to `fetch(currentUrl, currentInit)`. WHATWG URL parsing
  applies, so authority syntax inside `domain` (e.g. `legit@attacker.tld`,
  or values containing `/ ? # @ \`) reshapes the connected host/path while the
  hardcoded `https://` scheme is nominally preserved.

The trace is sound: there is genuinely no bare-host validation on `domain`
before the first hop.

## Why It Failed

This is an **exact typed duplicate** of an already-VIABLE prior finding on the
same route family.

Prior VIABLE record (prior-investigations id=34,
`ai-summary/reviewed/stellartoml/904-c1-valid-finding.md`, route_id
`js-sdk-a0a2d5acc9407b3ba398d119`) records the identical typed mechanism:

> "resolve interpolates domain raw into the fetch URL with no validation/encoding;
> buildBoundedUrl returns the absolute URL unchanged so userinfo@host, path,
> query, or backslash in domain change the host/path fetch contacts while
> callers attribute the toml to the nominal domain."

Every typed facet matches C1: `sink = get`, `impact_class = network_integrity`,
`trust_boundary = remote_domain_well_known_file`,
`protocol_phase = stellar_toml_resolution`,
`auth_state = https_required_unless_opted_out`,
`attacker_control = domain_and_toml_body`, `parser_state = toml_decoded`,
`size_class = bounded_by_stellar_toml_max_size`. The prior record even names the
same `userinfo@host` / path / backslash vectors and the same caller-attribution
gap that C1 relies on for material impact.

The hypothesis batch distinguished C1 only from the redirect-loop route
(`js-sdk-3210675ec7643a3184fe756f`, prior VIABLE [2]/[4]) and did not account
for prior VIABLE `js-sdk-a0a2d5acc9407b3ba398d119` / `904-c1`, which is the
first-hop domain-interpolation host-confusion finding C1 re-proposes. C1 carries
a different `route_id` (`js-sdk-6ed1a0df555f9d079b967630`), but route identity is
typed by mechanism + sink + scope, all of which are identical. Per reviewer
policy, an exact typed duplicate of an already-reported VIABLE finding is
NOT_VIABLE for this candidate.

## What This Rules Out

Re-reporting first-hop host/authority confusion via unvalidated `domain`
interpolation into the stellar.toml request URL (`resolve` -> `buildBoundedUrl`
-> `fetch`) as a new finding. It is already captured by VIABLE record
`js-sdk-a0a2d5acc9407b3ba398d119` (`904-c1-valid-finding.md`).

## What This Does Not Rule Out

- The redirect-loop scheme/host SSRF on the same `get` sink (separate prior
  VIABLE `js-sdk-3210675ec7643a3184fe756f`), which needs a server-supplied
  `Location` and is a distinct hop.
- The `timeout=0` unbounded streamed-read hang (separate prior VIABLE
  `js-sdk-a0a2d5acc9407b3ba398d119` / `904-c2`).
- Downstream consumers (federation `SIGNING_KEY`, web-auth endpoints) that apply
  partial-string `domain` validation or attribute the resolved toml to a
  legitimate-looking prefix — those caller-side gaps live outside this subsystem
  and were not traced here; they remain open as separate, non-stellartoml routes.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "stellartoml"
route_id = "js-sdk-6ed1a0df555f9d079b967630"
weakness = "Unvalidated domain interpolation at request-URL construction enabling host/authority confusion"
record_kind = "single_path"
path = ["resolve", "httpCli ...    .get"]
sink = "httpCli ...    .get"
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
negative_claim.claim_kind = "duplicate_of_prior_viable"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_prior_viable_js-sdk-a0a2d5acc9407b3ba398d119"]
rules_out = ["first-hop host/authority confusion via unvalidated domain interpolation (resolve -> buildBoundedUrl -> fetch) is an exact typed duplicate of prior VIABLE record js-sdk-a0a2d5acc9407b3ba398d119 / 904-c1-valid-finding.md (same sink, impact_class, and all scope facets, same userinfo@host/path/backslash mechanism and caller-attribution gap)"]
does_not_rule_out = ["redirect-loop scheme/host SSRF on the same get sink (prior VIABLE js-sdk-3210675ec7643a3184fe756f)", "timeout=0 unbounded streamed-read hang (prior VIABLE js-sdk-a0a2d5acc9407b3ba398d119 / 904-c2)", "downstream federation/web-auth partial-domain-validation or attribution gaps outside this subsystem"]
assumptions = ["route identity is typed by mechanism+sink+scope; the differing candidate route_id js-sdk-6ed1a0df555f9d079b967630 does not create a distinct route when mechanism, sink, impact_class, and every scope facet equal prior VIABLE js-sdk-a0a2d5acc9407b3ba398d119"]
mechanism_brief = "resolve interpolates caller domain into https://<domain>/.well-known/stellar.toml with no bare-host validation; buildBoundedUrl forwards it verbatim to fetch so userinfo/path/authority syntax in domain redirects the connected host at the first hop while https is nominally preserved."
why_failed_brief = "exact typed duplicate of already-VIABLE prior finding js-sdk-a0a2d5acc9407b3ba398d119 (904-c1); same mechanism, sink, impact, and scope."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:buildBoundedUrl"
guarantee = "no new URL() normalization or host validation runs on the absolute interpolated url before fetch (baseURL/params branches skipped); confirms the mechanism but does not make it a new route"

[[blockers]]
kind = "prior_record"
source = "ai-summary/reviewed/stellartoml/904-c1-valid-finding.md:js-sdk-a0a2d5acc9407b3ba398d119"
guarantee = "prior VIABLE record already covers first-hop unvalidated-domain host/authority confusion on resolve->get with identical sink, impact_class, and scope facets"
```
