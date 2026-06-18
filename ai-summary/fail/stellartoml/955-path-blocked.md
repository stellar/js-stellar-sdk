# F955: Path blocked: resolve -> httpCli.get remote stellar.toml fetch

**Subsystem**: stellartoml
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/stellartoml/955-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`resolve -> httpCli ...    .get`

## Blocker

Every distinct Medium+ network-integrity mechanism on this fetch is already a
reviewed VIABLE finding, and source re-derivation confirms no further distinct
mechanism survives. `resolve` builds one URL (`${protocol}://${domain}/...`) and
calls `httpClient.get` with `maxContentLength = STELLAR_TOML_MAX_SIZE` and
`maxRedirects = opts.allowedRedirects ?? 0`, routing to `boundedFetchAdapter`.
Re-checked from source: (1) unvalidated `domain` interpolation = VIABLE
js-sdk-a0a2d5; (2) manual redirect to a new scheme/host incl. HTTPS downgrade
(fetch-client.ts:406-412) = VIABLE js-sdk-3210675; (3) default `timeout = 0`
means no abort signal is created (fetch-client.ts:334), so body read is
time-unbounded = VIABLE js-sdk-6ed1a0df slowloris. Body bytes are streamed and
capped (readBodyBounded), so the size route is bounded. No new distinct
mechanism remains.

## Evidence

- `src/stellartoml/index.ts:54-67` - single GET with `maxContentLength`, `maxRedirects: allowedRedirects ?? 0`, and `timeout` from `Config` (default 0); protocol fixed https unless `allowHttp`.
- `src/http-client/fetch-client.ts:153-193` - `readBodyBounded` enforces `maxContentLength` via header check plus streamed running-total abort, bounding response bytes.
- `src/http-client/fetch-client.ts:406-412` - manual redirect resolves `Location` via `new URL(location, currentUrl)` to an arbitrary scheme/host: the exact reviewed VIABLE SSRF/HTTPS-downgrade mechanism, not re-reported.
- `src/http-client/fetch-client.ts:334-337` - timeout `AbortSignal` only created when `timeout > 0`; with `config.ts:19` default `timeout: 0`, no time bound exists (reviewed VIABLE slowloris).
- `src/http-client/fetch-client.ts:381-413` - redirect loop reads only the `Location` header on 3xx hops and never `readBodyBounded`s them, so there is no per-hop body-download amplification across the redirect chain.
- `src/http-client/fetch-client.ts:355-358` - browser path (`canInspectManualRedirects` false) uses `redirect: "error"` for 0 and native `"follow"` otherwise, delegating to browser redirect/CORS security and matching documented axios/XHR behavior; final response still passes through bounded reader.

## Negative Scope

- Rules out: a new distinct Medium+ network-integrity mechanism on `resolve -> httpClient.get` beyond the three reviewed VIABLE findings and the bounded/streamed body-size route.
- Does not rule out: CPU/parse cost of `smol-toml` `parse(response.data)` on the bounded ~100KB body (`src/stellartoml/index.ts:70`, a distinct downstream sink/material effect, not network_request); and browser `redirect: "follow"` not honoring the exact `N` hop count (`fetch-client.ts:357-358`), bounded by the browser's own redirect limit.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "stellartoml"
route_id = "js-sdk-5087e2e1586dd529943e74ec"
weakness = "network request integrity"
record_kind = "area_seed"
path = ["resolve", "httpCli ...    .get"]
sink = "httpCli ...    .get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:readBodyBounded"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["body_size_bounded_streamed", "exact_typed_duplicate_of_prior_viable_js-sdk-3210675ec7643a3184fe756f", "exact_typed_duplicate_of_prior_viable_js-sdk-a0a2d5acc9407b3ba398d119"]
rules_out = ["no new distinct Medium+ network-integrity mechanism on resolve->get beyond reviewed VIABLE redirect scheme/host SSRF, first-hop host confusion, and connection-hold slowloris; streamed maxContentLength bounds response bytes and 3xx hop bodies are not downloaded"]
does_not_rule_out = ["smol-toml parse cost on bounded ~100KB body at src/stellartoml/index.ts:70 (distinct parse sink/cpu effect)", "browser redirect:follow not honoring exact N hop count at fetch-client.ts:357-358 (bounded by browser redirect limit)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "resolve issues one bounded GET (maxContentLength streamed, maxRedirects default 0, timeout default 0); the redirect scheme/host SSRF, unvalidated-domain host confusion, and no-default-timeout slowloris are already reviewed VIABLE, and source re-derivation finds no further distinct network-integrity mechanism."
why_failed_brief = "all distinct Medium+ network-integrity mechanisms already reported VIABLE; residual body-size route is streamed/bounded; no new mechanism survived source re-derivation."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readBodyBounded (fetch-client.ts:153-193) enforces maxContentLength via content-length header check and streamed running-total abort, bounding response bytes for the resolve fetch."

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "redirect loop (fetch-client.ts:381-413) does not readBodyBounded 3xx hop bodies, so the redirect chain cannot amplify downloaded bytes."

[[blockers]]
kind = "duplicate_prior_viable"
guarantee = "redirect scheme/host SSRF incl. HTTPS downgrade (fetch-client.ts:406-412) is reviewed VIABLE js-sdk-3210675ec7643a3184fe756f; first-hop host/authority confusion via unvalidated domain interpolation is reviewed VIABLE js-sdk-a0a2d5acc9407b3ba398d119; connection-hold slowloris (default timeout 0, fetch-client.ts:334) is reviewed VIABLE js-sdk-6ed1a0df555f9d079b967630."
```
