# F937: Unvalidated domain interpolated into stellar.toml request URL (host/path confusion)

**Date**: 2026-06-18
**Subsystem**: stellartoml
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/stellartoml/937-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The structural claim is source-confirmed: `Resolver.resolve`
(src/stellartoml/index.ts:38-67) builds the request URL by raw template
interpolation `` `${protocol}://${domain}/.well-known/stellar.toml` ``
(index.ts:54-55) with no bare-hostname validation or WHATWG `URL` host-component
normalization anywhere in the function. `buildBoundedUrl`
(src/http-client/fetch-client.ts:105-117) forwards `config.url` verbatim
(the `baseURL` branch is skipped for an absolute `https?://` URL, and no `params`
are supplied), and `boundedFetchAdapter` passes the string straight to
`fetch(currentUrl, currentInit)` (fetch-client.ts:377, 383). A `domain` value
such as `trusted.com@evil.com` or `trusted.com/evil#` would therefore make the
WHATWG parser resolve to a host/path other than the nominal domain.

The decisive precondition — `domain` being attacker/remote-influenced rather
than a trusted application constant — was the open dependency the hypothesis
itself flagged as unverified. I traced every flow by which an untrusted domain
reaches `Resolver.resolve` inside the SDK:

- The only SDK-internal caller is `FederationServer.createForDomain`
  (src/federation/server.ts:123-135), reached from the public
  `FederationServer.resolve(value)` (server.ts:72-96), which splits a
  user/remote-supplied federation address on `*` and takes the `domain` part
  (server.ts:84-85). This is the concrete remote-influenced path the dispatch
  seed threat model contemplates.
- `createForDomain` calls `validateDomain(domain)` (server.ts:127) **before**
  `Resolver.resolve(domain, opts)` (server.ts:128).
- `validateDomain` (src/federation/utils.ts:1-14) enforces an RFC 1035 regex
  `^(?:[A-Za-z](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)*[A-Za-z](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?::\d+)?$`
  that admits only dot-separated alphanumeric/hyphen labels with an optional
  numeric port. Every character the C1 mechanism depends on — `@`, `/`, `?`,
  `#`, and whitespace — is rejected, so `bob*trusted.com@evil.com`,
  `bob*trusted.com/evil`, etc. throw before any fetch.

The only entry point left unguarded is the public
`StellarToml.Resolver.resolve(domain)` API (exported at src/index.ts:7) when an
application passes attacker-controlled input directly as the `domain` argument
without validating it first.

## Why It Failed

For the realistic, source-traced remote-influenced flow (federation address →
domain → resolution), the candidate is blocked by a concrete guard:
`validateDomain` (federation/utils.ts:6) rejects the `@`, `/`, `?`, `#`, and
whitespace characters that the host/path-confusion mechanism requires, and it
runs unconditionally before `Resolver.resolve`. No attacker-shaped domain can
traverse this path.

The remaining flow — calling the low-level public `Resolver.resolve` API
directly with attacker-controlled input — is out of scope. `Resolver.resolve`
is a low-level primitive documented to accept a "Domain to get stellar.toml file
for" (index.ts:21); exploiting it requires the application developer to feed
untrusted data straight into the host argument with no SDK-level unsafe default
in play (the hardcoded `https` scheme is preserved; the HTTPS/allowHttp gate is
not bypassed). That matches the objective's OUT_OF_SCOPE clause for behavior
that is caller responsibility with no SDK-level unsafe default, and the
SDK-internal consumer (federation) demonstrates the intended guarded usage.

With no SDK-internal unguarded untrusted-domain flow and the direct-API misuse
out of scope, the candidate does not meet the Medium severity floor.

## What This Rules Out

A >=Medium host/path-confusion finding on
`Resolver.resolve -> get -> boundedFetchAdapter` arising from the *initial*
request URL built from an attacker-influenced `domain` argument: the only
SDK-internal remote-influenced path (federation address) is gated by
`validateDomain`, which rejects the required injection characters.

## What This Does Not Rule Out

- The three prior already-VIABLE mechanisms on this route (redirect
  scheme/host downgrade in the boundedFetchAdapter redirect loop; no default
  time bound on the streamed body read when `timeout=0`) — those concern
  server-driven redirect Location handling and read timeouts, not the initial
  URL, and are unaffected by this trace.
- Same-host path/query/fragment redirection driven by a server-supplied
  `Location` header (the redirect loop at fetch-client.ts:406-412), which is a
  different trust boundary than the caller-side `domain` argument.
- Any future or third-party caller that invokes `Resolver.resolve` with
  untrusted input while bypassing `validateDomain`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "stellartoml"
route_id = "js-sdk-3210675ec7643a3184fe756f"
weakness = "request URL built from unvalidated domain string enables host/path confusion of the stellar.toml fetch"
record_kind = "single_path"
path = ["resolve", "get"]
sink = "get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/stellartoml/index.ts:resolve", "src/federation/server.ts:createForDomain", "src/federation/utils.ts:validateDomain", "src/http-client/fetch-client.ts:buildBoundedUrl", "src/http-client/fetch-client.ts:boundedFetchAdapter"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["untrusted_domain_flow_gated_by_validatedomain", "direct_resolver_api_caller_responsibility_out_of_scope"]
rules_out = ["the only SDK-internal remote-influenced domain flow (federation address -> FederationServer.createForDomain -> Resolver.resolve) calls validateDomain (federation/utils.ts:6) first, whose RFC 1035 regex rejects @, /, ?, #, and whitespace, blocking every host/path-confusion injection the C1 mechanism requires"]
does_not_rule_out = ["server-driven redirect Location host/path/scheme handling in the boundedFetchAdapter redirect loop (fetch-client.ts:406-412)", "the three prior already-VIABLE redirect-downgrade and timeout=0 streamed-read mechanisms on this route", "an application calling the public Resolver.resolve with untrusted input while bypassing validateDomain"]
assumptions = ["FederationServer.resolve/createForDomain is the only SDK-internal caller of Resolver.resolve (grep over src confirms federation/server.ts:128 is the sole call site)", "Resolver.resolve is documented as a low-level domain-resolution primitive (index.ts:21) and its direct-API misuse with untrusted input is caller responsibility per the objective scope", "hardcoded https scheme (index.ts:52) preserves the transport gate so this is not an allowHttp/HTTPS bypass"]
mechanism_brief = "resolve interpolates domain into the request URL with no bare-hostname validation, but the only SDK-internal untrusted-domain path (federation address) is gated by validateDomain (RFC 1035 regex) which rejects @, /, ?, #, and whitespace before resolve runs; the remaining direct public-API misuse is caller responsibility and below the Medium floor."
why_failed_brief = "untrusted-domain flow blocked by validateDomain RFC 1035 regex; direct-API misuse is out-of-scope caller responsibility with no SDK-level unsafe default"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/federation/utils.ts:validateDomain"
guarantee = "RFC 1035 regex (federation/utils.ts:6) admits only dot-separated alphanumeric/hyphen labels with an optional numeric port and rejects @, /, ?, #, and whitespace; runs unconditionally at server.ts:127 before Resolver.resolve, blocking host/path-confusion injection on the federation flow"

[[blockers]]
kind = "checked_guard"
source = "src/federation/server.ts:createForDomain"
guarantee = "createForDomain (server.ts:123-128) is the sole SDK-internal caller of Resolver.resolve and gates the untrusted domain through validateDomain before resolution"
```
