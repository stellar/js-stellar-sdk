# F924: Path blocked: redirect-loop scheme/host SSRF on resolve -> get (duplicate of VIABLE)

**Subsystem**: stellartoml
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/stellartoml/924-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`resolve -> httpCli ...    .get`

## Blocker

The residual lead resolves to YES in source — the `boundedFetchAdapter` redirect
loop follows a server-supplied `Location` via `new URL(location, currentUrl)`
with no scheme-preservation or host-allowlist guard (`fetch-client.ts:406-412`),
so a `30x` with `Location: http://internal-host/` is followed when an
application opts in via `allowedRedirects > 0` (`index.ts:56`). But this is the
*exact* mechanism already captured by reviewed VIABLE record
`js-sdk-3210675ec7643a3184fe756f`, whose negative scope is verbatim "no
scheme-preservation or host-allowlist guard ... following a server-supplied
`http://` or arbitrary-host Location." Per the no-re-report rule, the lead is a
typed duplicate, not a new candidate. The hunt for a *distinct* failure mode on
the same loop is source-blocked: redirect-hop bodies are never read (the loop
only reads the `location` header before continuing) and the final body is capped
by streamed `readBodyBounded` (153-193); cross-origin credential headers are
stripped by `stripCrossOriginAuth` (276-294) and `resolve` sends no auth headers
anyway; method/body downgrade follows the fetch spec via `applyRedirectSemantics`
(257-270); and the hop count is bounded by `redirectsRemaining`.

## Evidence

- `src/http-client/fetch-client.ts:406-412` - redirect loop builds `nextUrl` from raw `Location` with no scheme/host validation; this is the named VIABLE mechanism, not a new one.
- `src/stellartoml/index.ts:56` - `maxRedirects: opts.allowedRedirects ?? 0`; the loop is inert by default and only active when the app opts into redirects.
- `src/http-client/fetch-client.ts:153-193` - `readBodyBounded` streams with content-length precheck and per-chunk cap; redirect-hop bodies are not read at all, so no per-hop exhaustion sink exists.
- `src/http-client/fetch-client.ts:276-294` - `stripCrossOriginAuth` deletes authorization/proxy-authorization/cookie on origin mismatch (malformed URL => treated cross-origin), closing the credential-leak variant.
- `src/http-client/fetch-client.ts:257-270` - `applyRedirectSemantics` forces GET and drops body/body-headers on 301/302/303 per spec, closing method/body-confusion variants.

## Negative Scope

- Rules out: redirect-loop scheme/host SSRF on `resolve -> get` as a *new* finding — it is an exact typed duplicate of reviewed VIABLE `js-sdk-3210675ec7643a3184fe756f`; and the distinct per-hop body-exhaustion, cross-origin credential-leak, and method/body-confusion variants on this loop (all source-blocked).
- Does not rule out: redirect SSRF impact on *other* http-client consumers that DO attach `Authorization`/`Cookie` headers and set `maxRedirects > 0` (federation, web-auth, RPC) where the same loop is reached with credential-bearing requests — a different route identity, not this `resolve` path.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "stellartoml"
route_id = "js-sdk-6ed1a0df555f9d079b967630"
weakness = "network_request"
record_kind = "residual_escalation"
path = ["resolve", "httpCli ...    .get"]
sink = "httpCli ...    .get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "re-investigate residual lead"
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:boundedFetchAdapter"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_prior_viable_js-sdk-3210675ec7643a3184fe756f", "redirect_hop_bodies_never_read", "cross_origin_auth_stripped", "redirect_method_body_spec_compliant"]
rules_out = ["redirect-loop scheme/host SSRF on resolve->get as a new finding (exact typed duplicate of reviewed VIABLE js-sdk-3210675ec7643a3184fe756f)", "per-hop body-size exhaustion on the redirect loop (hop bodies are not read; final body is streamed-capped by readBodyBounded)", "cross-origin credential leak via redirect (stripCrossOriginAuth deletes authorization/cookie; resolve sends no auth headers)", "redirect method/body confusion (applyRedirectSemantics enforces fetch-spec GET downgrade on 301/302/303)"]
does_not_rule_out = ["redirect SSRF on http-client consumers that attach Authorization/Cookie and set maxRedirects>0 (federation/web-auth/RPC) - distinct route identity, not this resolve path"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "redirect loop follows raw Location with no scheme/host guard (fetch-client.ts:406-412), but this is the exact mechanism already captured by reviewed VIABLE js-sdk-3210675ec7643a3184fe756f; distinct per-hop body, credential-leak, and method-confusion variants are source-blocked"
why_failed_brief = "lead resolves YES in source but is an exact typed duplicate of an existing reviewed VIABLE finding; no distinct new vulnerability remains on the redirect loop within budget"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readBodyBounded (fetch-client.ts:153-193) caps the final response body via content-length precheck and per-chunk streamed total; redirect-hop bodies are never read"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "stripCrossOriginAuth (fetch-client.ts:276-294) deletes authorization/proxy-authorization/cookie on origin mismatch, and resolve attaches no such headers"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "applyRedirectSemantics (fetch-client.ts:257-270) forces GET and drops body on 301/302/303 per fetch spec"

[[blockers]]
kind = "duplicate_of_prior_viable"
guarantee = "redirect-loop scheme/host SSRF on resolve->get (fetch-client.ts:406-412) is the exact mechanism of reviewed VIABLE js-sdk-3210675ec7643a3184fe756f; reporting again is suppressed by the no-re-report rule"
```
