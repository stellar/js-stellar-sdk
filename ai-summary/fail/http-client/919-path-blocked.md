# F919: Path blocked: remote response JSON.parse in bounded fetch adapter

**Subsystem**: http-client
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/http-client/919-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> JSON.parse`

Area seed targets: `boundedFetchAdapter`, `parse`, `JSON.parse`, `<anonymous>`.

## Blocker

`boundedFetchAdapter` is reached only by `stellartoml` and `federation`, and
both set `maxContentLength = 100*1024` (`stellartoml/index.ts:57`,
`federation/server.ts:226`). `readBodyBounded` enforces that cap with a
streaming running-total check plus `reader.cancel()` before the full body is
buffered (`fetch-client.ts:171-184`), so every byte reaching either `JSON.parse`
site (success `:441`, error `:426`) is bounded to ≤100KB. Parse cost is
therefore a constant per-event bound, and a remote server cannot force a caller
to repeat the single caller-initiated request, so no resource exhaustion
accumulates. Content-type-blind `JSON.parse` does not misdecode for these two
callers: `smol-toml.parse` throws on a non-string object (caught/rejected at
`stellartoml/index.ts:69-78`), and federation legitimately expects JSON from its
own domain authority and tolerates a string `data` (`server.ts:228-235`).

## Evidence

- `src/http-client/fetch-client.ts:483-487` - adapter routes to `boundedFetchAdapter` only when `maxRedirects` or `maxContentLength` is set; Horizon/RPC use the default axios instance.
- `src/http-client/fetch-client.ts:171-184` - streamed total>cap check with `reader.cancel()` bounds attacker body before `JSON.parse`.
- `src/http-client/fetch-client.ts:437-444` - success-path `JSON.parse(text)` over the already-bounded decoded body; falls back to raw string on parse failure.
- `src/stellartoml/index.ts:56-57,69-78` - only TOML caller; sets 100KB cap; `smol-toml.parse` rejects non-string input rather than silently accepting JSON.
- `src/federation/server.ts:226-235` - only JSON caller; sets 100KB cap; reads `response.data.memo` from its own trusted domain authority.

## Negative Scope

- Rules out: attacker-controlled remote response body reaching `JSON.parse` in `boundedFetchAdapter` as an unbounded-size or per-event resource-exhaustion vulnerability, and as a security-relevant content-type/type-confusion misdecode for the two reachable callers (stellartoml, federation).
- Does not rule out: a future/SDK-user caller that sets `maxRedirects` but leaves `maxContentLength` undefined, which routes through `boundedFetchAdapter` with an unbounded `readBodyBounded` read followed by unbounded `JSON.parse` (`fetch-client.ts:153-164` skips the cap when `maxContentLength === undefined`); the error-body `JSON.parse` at `:426` attaching attacker-controlled JSON to `err.response.data`; and the separately-tracked redirect-scheme non-revalidation route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "http-client"
route_id = "js-sdk-f3602f77d6787375a5a1ec22"
weakness = "untrusted remote response deserialization"
record_kind = "area_seed"
path = ["<anonymous>", "JSON.parse"]
sink = "JSON.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["boundedFetchAdapter", "parse", "JSON.parse", "readBodyBounded"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["bounded_json_parse_no_repetition_no_typeconfusion_for_reachable_callers"]
rules_out = ["attacker remote response reaching JSON.parse in boundedFetchAdapter as unbounded-size, per-event resource-exhaustion, or security-relevant content-type confusion for the stellartoml and federation callers"]
does_not_rule_out = ["caller setting maxRedirects without maxContentLength -> unbounded readBodyBounded + JSON.parse", "error-body JSON.parse at fetch-client.ts:426 attaching attacker JSON to err.response.data", "redirect-scheme non-revalidation route tracked separately"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "boundedFetchAdapter JSON.parses remote response bytes, but both reachable callers (stellartoml, federation) set a 100KB maxContentLength enforced by a streaming cap, parse cost is a constant per-event bound with no attacker-forced repetition, and content-type-blind parsing does not misdecode for either caller."
why_failed_brief = "size cap streamed before parse and only two reachable callers, both 100KB-bounded; no resource amplification or type-confusion security effect on this route."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "size_cap"
guarantee = "readBodyBounded streams a running total and cancels the reader once total exceeds maxContentLength (100KB for both reachable callers), bounding bytes before JSON.parse (fetch-client.ts:171-184)"

[[sanitizer_guarantees]]
kind = "type_guard"
guarantee = "smol-toml.parse rejects non-string input and federation reads JSON from its own trusted domain authority, so content-type-blind JSON.parse yields parse errors/expected types rather than security misdecoding"

[[blockers]]
kind = "reachability"
guarantee = "boundedFetchAdapter is selected only when maxRedirects or maxContentLength is set; only stellartoml and federation reach it and both set maxContentLength, so no in-source caller hits the unbounded-read branch (fetch-client.ts:483-487, 153-164)"
```
