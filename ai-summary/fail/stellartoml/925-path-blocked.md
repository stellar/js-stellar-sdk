# F925: Path blocked: no additional distinct vuln on remote stellar.toml fetch

**Subsystem**: stellartoml
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/stellartoml/925-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> get`

Area seed targets `<anonymous>`, `get`, `resolve`, `httpCli ... .get` all collapse
to a single concrete path: `Resolver.resolve` -> `httpClient.get` ->
`boundedFetchAdapter` (the bounded adapter is selected because `resolve` always
sets `maxContentLength = STELLAR_TOML_MAX_SIZE`).

## Blocker

The three materially distinct >=Medium network-integrity mechanisms on this exact
route are already confirmed VIABLE in prior memory and must not be re-reported:
redirect scheme/host non-validation in the manual loop (route
`js-sdk-3210675ec7643a3184fe756f`), `domain` injected into the URL without
host/scheme normalization (route `js-sdk-a0a2d5acc9407b3ba398d119`), and the
`timeout=0` unbounded body read (same route). Independent source tracing of the
remaining mechanisms on this path found no new >=Medium issue: `maxContentLength`
is streamed-enforced in `readBodyBounded` (chunk total cancels and throws at
`fetch-client.ts:176-181`, plus an early `content-length` check at 158-161), so
the size bound holds; `config.cancelToken` is ignored by the adapter but a
`timeout` AbortSignal is composed whenever `timeout>0` (`fetch-client.ts:334-337`),
so cancellation is redundant rather than missing; and the browser `redirect:"follow"`
hop-count divergence (`fetch-client.ts:358`) is documented and browser-mitigated
(mixed-content blocks https->http downgrade, native cross-origin Authorization
strip, native ~20-hop cap), leaving it below the Medium floor.

## Evidence

- `src/stellartoml/index.ts:54-67` - `resolve` issues `httpClient.get` with `maxContentLength=STELLAR_TOML_MAX_SIZE`, `maxRedirects=opts.allowedRedirects ?? 0`, and a `cancelToken`/`timeout` pair.
- `src/http-client/fetch-client.ts:171-184` - `readBodyBounded` streams chunks and cancels+throws once running total exceeds `maxContentLength`; memory stays bounded to ~cap + one network chunk.
- `src/http-client/fetch-client.ts:334-337` - the bounded adapter composes an AbortSignal only from `timeout`; it never reads `config.cancelToken`, but `resolve` always passes an equal `timeout`, so the time bound is intact when `timeout>0`.
- `src/http-client/fetch-client.ts:355-358,393-413` - manual-loop guards (hop counter, `applyRedirectSemantics`, `stripCrossOriginAuth`) run only when `redirect==="manual"` (Node); the browser `"follow"` branch skips them but the browser enforces equivalent native protections.

## Negative Scope

- Rules out: a new >=Medium network-integrity vulnerability on the
  `Resolver.resolve -> httpClient.get -> boundedFetchAdapter` path beyond the
  three already-VIABLE mechanisms (redirect scheme/host, domain injection,
  timeout=0 body) and the source-confirmed size cap.
- Does not rule out: the browser `redirect:"follow"` hop-count divergence as a
  sub-Medium robustness gap; sibling routes that reuse `boundedFetchAdapter`
  under different identities (federation `js-sdk-cda4d93790ffd066b1523001`, RPC,
  Horizon) where credential-bearing headers and follow-mode defaults differ.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "stellartoml"
route_id = "js-sdk-3210675ec7643a3184fe756f"
weakness = "Network request integrity"
record_kind = "area_seed"
path = ["<anonymous>", "get"]
sink = "get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:readBodyBounded", "src/http-client/fetch-client.ts:buildBoundedUrl"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["maxcontentlength_streamed_enforced", "timeout_signal_composed_when_positive"]
rules_out = ["new >=Medium network-integrity vuln on resolve->get->boundedFetchAdapter beyond the three already-VIABLE mechanisms", "maxContentLength bypass: readBodyBounded streams and cancels at the cap"]
does_not_rule_out = ["browser redirect:follow hop-count divergence (sub-Medium)", "federation/RPC/Horizon siblings reusing boundedFetchAdapter under different route_ids and credential defaults"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "resolve->httpClient.get->boundedFetchAdapter; size cap streamed-enforced in readBodyBounded, timeout signal composed when timeout>0, browser follow-branch divergence documented and browser-mitigated."
why_failed_brief = "three distinct >=Medium mechanisms already VIABLE in prior memory; remaining traced mechanisms are defended or below the Medium severity floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "size_bound"
guarantee = "readBodyBounded (fetch-client.ts:171-184) streams body and cancels+throws once running total exceeds maxContentLength, with an early content-length header check at 158-161."

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "boundedFetchAdapter composes an AbortSignal from timeout when timeout>0 (fetch-client.ts:334-337); resolve always passes an equal timeout, so the time bound is intact for timeout>0."

[[blockers]]
kind = "severity_floor"
guarantee = "browser redirect:follow hop-count divergence (fetch-client.ts:358) is documented and browser-mitigated (mixed-content downgrade block, native cross-origin auth strip, native hop cap), leaving it below the Medium floor."
```
