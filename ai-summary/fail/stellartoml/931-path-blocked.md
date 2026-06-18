# F931: Path blocked: remote stellar.toml fetch network request (area seed)

**Subsystem**: stellartoml
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/stellartoml/931-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`resolve -> httpCli ...    .get`

Area seed target set: `<anonymous>`, `get`, `resolve`, `httpCli ...    .get`.

## Blocker

After source-tracing all four sibling targets, every material network-integrity
mechanism on `resolve -> get` reduces to an already-reported finding or an
already-blocked route, and no distinct unreported Medium+ mechanism survives.
`resolve` (index.ts:54-67) interpolates the raw `domain` into the URL and sets
`maxRedirects = allowedRedirects ?? 0`, `maxContentLength = STELLAR_TOML_MAX_SIZE`,
and `timeout`; the bounded adapter (fetch-client.ts:483-490) then enforces those.
The four shape dimensions of this sink are each accounted for: host/authority
confusion via domain interpolation = reviewed VIABLE `js-sdk-a0a2d5acc9407b3ba398d119`;
redirect scheme/host SSRF at the un-scheme-validated redirect loop
(fetch-client.ts:406-412), including the HTTPS->HTTP downgrade variant on the
same lines/mechanism = reviewed VIABLE `js-sdk-3210675ec7643a3184fe756f`;
single-response body-size exhaustion = blocked by streamed `maxContentLength`
(fetch-client.ts:157-184); and no-default-time-bound body read when `timeout=0`
= reviewed VIABLE [4]. `get` (623-632) only delegates and adds no gate.

## Per-Target Disposition

- `resolve` (index.ts:38-89): orchestrator; its only material outputs are the
  raw-domain URL, `maxRedirects`, `maxContentLength`, `timeout`/cancelToken —
  each mapped to a known finding/blocker above.
- `get` (fetch-client.ts:623-632): thin wrapper, `mergeWithDefaults` + `makeRequest`;
  no independent validation; cannot host a new mechanism.
- `<anonymous>`: resolve's inline `.then`/cancelToken/`setTimeout` closures
  (index.ts:58-79) and adapter closures; no new gate or sink beyond the above.
- `httpCli ...    .get` (boundedFetchAdapter, fetch-client.ts:328-453): redirect,
  size, and timeout enforcement all map to known findings/blockers.

## Checked, Non-Material

- JSON.parse clobber of `response.data` (fetch-client.ts:439-444) feeding
  `smol-toml.parse(response.data)` (index.ts:70): when the attacker body is valid
  JSON, `data` becomes a non-string value; smol-toml then throws and resolve
  rejects as "stellar.toml is invalid" — identical to any invalid-toml outcome,
  no integrity gain. Below Medium.
- boundedFetchAdapter ignores `config.signal`/`cancelToken` (uses only
  `AbortSignal.timeout`, fetch-client.ts:334-337): masked by its own timeout
  signal when `timeout>0`; when `timeout=0` it reduces to known VIABLE [4].

## Evidence

- `src/stellartoml/index.ts:54-67` - resolve issues the get with raw-domain URL, `maxRedirects=allowedRedirects??0`, `maxContentLength`, and `timeout`/cancelToken.
- `src/http-client/fetch-client.ts:483-490` - adapter routes to boundedFetchAdapter whenever maxRedirects/maxContentLength is set, so resolve always uses bounded enforcement.
- `src/http-client/fetch-client.ts:406-412` - redirect loop follows `location` with no scheme/host re-validation (reviewed VIABLE scheme/host SSRF, incl. HTTPS downgrade).
- `src/http-client/fetch-client.ts:157-184` - streamed `maxContentLength` cap aborts the body read past the bound (blocks body-size exhaustion).
- `src/http-client/fetch-client.ts:334-337` - timeout AbortSignal added only when `timeout>0` (no-time-bound body read when timeout=0, reviewed VIABLE).
- `src/http-client/fetch-client.ts:623-632` - `get` only merges defaults and delegates to makeRequest, adding no gate.

## Negative Scope

- Rules out: any new distinct Medium+ network-integrity mechanism on
  `resolve -> get` beyond the already-reported VIABLE findings and the blocked
  body-size route.
- Does not rule out: the known VIABLE routes themselves (host/authority
  confusion, redirect scheme/host SSRF, no-timeout body read) which remain live
  but already reported; algorithmic-complexity of smol-toml parsing within the
  100KB cap (resides in the dependency, not evaluated here).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "stellartoml"
route_id = "js-sdk-5087e2e1586dd529943e74ec"
weakness = "Network request integrity"
record_kind = "area_seed"
path = ["resolve", "httpCli ...    .get"]
sink = "httpCli ...    .get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["<anonymous>", "get", "resolve", "httpCli ...    .get"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["body_size_bounded_streamed", "exact_typed_duplicate_of_prior_viable_js-sdk-3210675ec7643a3184fe756f", "exact_typed_duplicate_of_prior_viable_js-sdk-a0a2d5acc9407b3ba398d119"]
rules_out = ["no new distinct Medium+ network-integrity mechanism on resolve->get beyond the already-reported VIABLE findings and the blocked streamed body-size route"]
does_not_rule_out = ["known VIABLE host/authority confusion js-sdk-a0a2d5acc9407b3ba398d119 (already reported)", "known VIABLE redirect scheme/host SSRF incl. HTTPS downgrade js-sdk-3210675ec7643a3184fe756f at fetch-client.ts:406-412 (already reported)", "known VIABLE no-default-time-bound body read when timeout=0 (already reported)", "smol-toml algorithmic complexity within the 100KB cap (dependency, not evaluated)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "resolve interpolates raw domain into the URL and sets maxRedirects/maxContentLength/timeout; the bounded adapter enforces them. Every material mechanism on resolve->get maps to an already-reported VIABLE finding (host confusion, redirect scheme/host SSRF, no-timeout body read) or the blocked streamed body-size route; the JSON.parse->smol-toml type confusion and the adapter ignoring cancelToken are checked and non-material at Medium."
why_failed_brief = "no distinct unreported Medium+ mechanism remains across the four sibling targets after source tracing; remaining live routes are exact typed duplicates of reviewed VIABLE findings and are suppressed by the no-re-report rule"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "size_cap"
guarantee = "boundedFetchAdapter streams the response body and aborts once the running total exceeds maxContentLength (STELLAR_TOML_MAX_SIZE=100KB), enforced because resolve always sets maxContentLength (fetch-client.ts:157-184, index.ts:57)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "get is a thin wrapper (mergeWithDefaults + makeRequest, fetch-client.ts:623-632) and adds no validation, so the sibling targets share resolve's single gate set"

[[blockers]]
kind = "duplicate_of_reviewed_viable"
guarantee = "redirect scheme/host SSRF (incl. HTTPS downgrade) at fetch-client.ts:406-412 is the exact mechanism of reviewed VIABLE js-sdk-3210675ec7643a3184fe756f; first-hop host/authority confusion is reviewed VIABLE js-sdk-a0a2d5acc9407b3ba398d119; re-reporting suppressed by the no-re-report rule"

[[blockers]]
kind = "size_cap"
guarantee = "single-response body-size exhaustion is blocked by the streamed maxContentLength cap for this exact route"
```
