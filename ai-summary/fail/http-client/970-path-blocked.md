# F970: Path blocked: bounded fetch adapter JSON deserialization semantics

**Subsystem**: http-client
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/http-client/970-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`boundedFetchAdapter -> parse`

This record disposes of the JSON-**deserialization-semantics** dimension of the
sink (content-type confusion, type confusion, prototype pollution, per-event
parse cost). It deliberately does NOT cover the size/count dimension — the
unbounded-read variant on this same adapter is separately tracked as VIABLE
(`js-sdk-21d3e5bacc2e1ae0938706bc`) and is not re-reported here.

## Blocker

`boundedFetchAdapter` is selected only when `maxRedirects` or `maxContentLength`
is set (`fetch-client.ts:483-487`); the only in-source callers are stellartoml
(`stellartoml/index.ts:56-57`, both bounds set) and federation
(`federation/server.ts:226`, `maxContentLength` set), so the JSON.parse at
`fetch-client.ts:441` runs on a body already capped by `readBodyBounded`
(`:157-161,:176-181`). The adapter is content-type-blind (always tries
`JSON.parse`, falls back to the raw string on failure, `:439-444`), but neither
caller is harmed: stellartoml feeds `response.data` to smol-toml `parse`, which
expects a string and throws a caught "stellar.toml is invalid" error on an
object (`stellartoml/index.ts:70-78`); federation only guards `memo` type
(`server.ts:231-236`) and treats the server as the trusted payment-address
authority. `JSON.parse` creates an own `__proto__` property only (no
`Object.prototype` pollution), and no caller recursively merges the parsed
object, so there is no pollution sink. No Medium+ deserialization-semantics
mechanism survives.

## Evidence

- `fetch-client.ts:437-444` - content-type-blind `JSON.parse(text)` with raw-string fallback; this is the sink.
- `fetch-client.ts:483-487` - bounded adapter chosen only when `maxRedirects`/`maxContentLength` set; all other callers use `instance.request`.
- `stellartoml/index.ts:56-57,70-78` - both bounds set; `response.data` passed to smol-toml `parse` (string-expected; object → caught parse error).
- `federation/server.ts:226,231-236` - `maxContentLength` set; only `memo` type validated; record used as trusted-server address resolution.

## Negative Scope

- Rules out: attacker remote response reaching `JSON.parse` in `boundedFetchAdapter` causing content-type confusion, primitive/array type confusion, prototype pollution, or per-event parse-cost exhaustion for the in-source stellartoml/federation callers.
- Does not rule out: unbounded read / unbounded parse cost when an external caller sets `maxRedirects` without `maxContentLength` (size dimension, tracked separately as VIABLE `js-sdk-21d3e5bacc2e1ae0938706bc`).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "http-client"
route_id = "js-sdk-2667d1608bbbc484f42b2544"
weakness = "json_deserialization"
record_kind = "area_seed"
path = ["boundedFetchAdapter", "parse"]
sink = "parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["fetch-client.ts:boundedFetchAdapter", "fetch-client.ts:JSON.parse", "stellartoml/index.ts:resolve", "federation/server.ts:_sendRequest"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["bounded_json_parse_no_typeconfusion_no_protopollution_for_reachable_boundedadapter_callers"]
rules_out = ["content-type confusion, primitive/array type confusion, prototype pollution, and per-event parse-cost exhaustion at JSON.parse in boundedFetchAdapter for in-source stellartoml/federation callers"]
does_not_rule_out = ["unbounded read/parse cost when an external caller sets maxRedirects without maxContentLength (size dimension, VIABLE route js-sdk-21d3e5bacc2e1ae0938706bc)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "boundedFetchAdapter always JSON.parses the bounded response body, but the only in-source callers (stellartoml, federation) cap the body via maxContentLength and either feed it to smol-toml (string-expected, caught error on object) or guard memo type under a trusted-server model; JSON.parse yields no prototype pollution and no merge sink downstream."
why_failed_brief = "deserialization-semantics mechanisms blocked for reachable callers; size dimension excluded and tracked separately as VIABLE."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "size_cap"
guarantee = "readBodyBounded enforces maxContentLength via content-length pre-check (fetch-client.ts:157-161) and streamed total abort (:176-181); both in-source callers set maxContentLength."

[[sanitizer_guarantees]]
kind = "type_guard"
guarantee = "federation rejects non-string memo (server.ts:231-236); stellartoml's smol-toml parse throws a caught error on a non-string body (stellartoml/index.ts:70-78)."

[[blockers]]
kind = "reachability"
guarantee = "boundedFetchAdapter is selected only when maxRedirects/maxContentLength is set (fetch-client.ts:483-487); only stellartoml and federation reach it in source, both with maxContentLength."

[[blockers]]
kind = "no_pollution_sink"
guarantee = "JSON.parse creates an own __proto__ property only (no Object.prototype pollution) and no caller recursively merges response.data, so there is no prototype-pollution sink."
```
