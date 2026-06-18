# F049: Path blocked: Federation _sendRequest outbound HTTP GET (area seed)

**Subsystem**: federation
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/federation/049-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`_sendRequest -> httpCli ...    .get`

Sibling target set: `_sendRequest`, `httpClient.get`, `boundedFetchAdapter`/`get`,
the redirect-follow `<anonymous>` body reader.

## Blocker

The only material network-integrity weakness on this exact path is the
redirect=follow SSRF: `_sendRequest` (server.ts:221-228) calls `httpClient.get`
with `maxContentLength` and `timeout` but **no `maxRedirects`**, so
`boundedFetchAdapter` sets `managedRedirects=false` and `redirect="follow"`
(fetch-client.ts:348-358), leaving no scheme/host/hop guard on followed hops.
That mechanism is the already-reviewed VIABLE finding
`js-sdk-cda4d93790ffd066b1523001`; the no-re-report rule suppresses it.
The remaining shape dimensions on this path are each source-disposed: the
federation response-size cap is enforced by `readBodyBounded` (both the
`content-length` header check and a streamed running-total check that cancels
mid-stream), so the bounded-response DoS is closed; and the response-trust gap
(only `memo` is type-checked, `account_id`/`memo_type` unvalidated) reduces to
the documented federation trust model where the TOML-discovered server is the
protocol authority. No distinct new vulnerability survives.

## Evidence

- `src/federation/server.ts:221-228` - `_sendRequest` passes only `maxContentLength`/`timeout`, never `maxRedirects`, to `httpClient.get`.
- `src/http-client/fetch-client.ts:348-358` - undefined `maxRedirects` ⇒ `redirect="follow"`; this follow branch is the prior reviewed VIABLE SSRF, not a new finding.
- `src/http-client/fetch-client.ts:153-193` - `readBodyBounded` enforces the 100 KiB cap via header check (158-160) and streamed total with `reader.cancel()` (176-181) — size DoS bounded.
- `src/federation/server.ts:230-236` - response validation only rejects a non-string `memo`; `account_id`/`memo_type` returned raw, but the resolved server is the federation authority (documented trust model).

## Negative Scope

- Rules out: bounded-response DoS on the federation GET path (size cap is source-enforced), and re-reporting the redirect=follow scheme/host SSRF (exact typed duplicate of reviewed VIABLE `js-sdk-cda4d93790ffd066b1523001`).
- Does not rule out: the existing VIABLE redirect SSRF itself; the documented `timeout=0` default permitting a single hung request against a slow server (generic to all SDK HTTP, Low); application-level trust in unvalidated `account_id`/`memo_type` returned by a malicious/redirected federation server.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "federation"
route_id = "js-sdk-b9a6d6c3f02dabc691adcde3"
weakness = "Network request integrity"
record_kind = "area_seed"
path = ["_sendRequest", "httpCli ...    .get"]
sink = "httpCli ...    .get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["<anonymous>", "httpCli ...    .get", "_sendRequest", "get"]
scope.trust_boundary = "remote_federation_server"
scope.protocol_phase = "federation_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_address_and_remote_response"
scope.parser_state = "json_decoded"
scope.size_class = "bounded_by_federation_response_limit"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["federation_response_size_enforced", "exact_typed_duplicate_of_prior_viable_js-sdk-cda4d93790ffd066b1523001"]
rules_out = ["bounded-response DoS on _sendRequest GET path (readBodyBounded enforces 100KiB cap via header and streamed-total checks)", "re-report of redirect=follow scheme/host SSRF (exact typed duplicate of reviewed VIABLE js-sdk-cda4d93790ffd066b1523001)"]
does_not_rule_out = ["existing VIABLE redirect=follow SSRF js-sdk-cda4d93790ffd066b1523001", "documented timeout=0 default permitting a single hung request against a slow server", "application trust in unvalidated account_id/memo_type from a malicious or redirected federation server"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Federation _sendRequest issues an outbound GET with redirect=follow (no maxRedirects); the only material network-integrity weakness is the redirect-follow SSRF already covered by reviewed VIABLE js-sdk-cda4d93790ffd066b1523001, the response-size cap is source-enforced by readBodyBounded, and the unvalidated account_id/memo_type reduces to the documented federation trust model."
why_failed_brief = "No distinct new vulnerability: redirect SSRF is a known VIABLE duplicate (suppressed), size cap source-enforced, response-trust gap is documented caller responsibility."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "size_bound"
guarantee = "readBodyBounded (fetch-client.ts:153-193) enforces maxContentLength via content-length header check and a streamed running-total check that cancels the reader once total exceeds 100 KiB"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_sendRequest rejects a federation response whose memo is present and not a string (server.ts:230-235)"

[[blockers]]
kind = "duplicate_prior_viable"
guarantee = "redirect=follow scheme/host SSRF on the federation GET path is the exact mechanism of reviewed VIABLE js-sdk-cda4d93790ffd066b1523001; re-reporting is suppressed by the no-re-report rule"
```
