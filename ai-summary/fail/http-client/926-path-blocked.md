# F926: Path blocked: maxRedirects without maxContentLength -> unbounded readBodyBounded + JSON.parse

**Subsystem**: http-client
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/http-client/926-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> JSON.parse`

Residual question (escalated): can a caller select `boundedFetchAdapter` by
setting `maxRedirects` while leaving `maxContentLength` unset, so that
`readBodyBounded` runs with `undefined` cap and feeds an unbounded attacker
response to `JSON.parse`?

## Blocker

The code-level mechanism is real: `boundedFetchAdapter` is selected whenever
`maxRedirects !== undefined || maxContentLength !== undefined`
(`fetch-client.ts:483-486`), and `readBodyBounded` only enforces a size cap
when `maxContentLength !== undefined` — with it unset the `while(true)` reader
loop appends every chunk uncapped before `JSON.parse` (`readBodyBounded:157-184`,
`boundedFetchAdapter:437-441`). However, no in-source caller reaches that
branch: the only two callers that opt into `boundedFetchAdapter` both set
`maxContentLength` unconditionally — stellartoml sets BOTH `maxRedirects` and
`maxContentLength = STELLAR_TOML_MAX_SIZE` (`stellartoml/index.ts:56-57`), and
federation sets `maxContentLength = FEDERATION_RESPONSE_MAX_SIZE` with no
`maxRedirects` (`federation/server.ts:225-226`). Neither sets `maxRedirects`
without `maxContentLength`, so the uncapped read is never instantiated by SDK
code. An arbitrary external caller passing maxRedirects-only yields the same
uncapped read already recorded VIABLE on the default feaxios path
(`js-sdk-74011b123136054779aaac38`), not a distinct finding.

## Evidence

- `src/http-client/fetch-client.ts:483-486` - adapter chooses boundedFetchAdapter when either maxRedirects or maxContentLength is defined.
- `src/http-client/fetch-client.ts:157-184` - cap is enforced only when maxContentLength is defined; otherwise the read loop is unbounded.
- `src/http-client/fetch-client.ts:437-441` - bounded/unbounded bytes are TextDecoded and JSON.parsed.
- `src/stellartoml/index.ts:56-57` - the sole caller setting maxRedirects also sets maxContentLength unconditionally.
- `src/federation/server.ts:225-226` - the only other boundedFetchAdapter caller sets maxContentLength and no maxRedirects.

## Negative Scope

- Rules out: an in-source SDK caller reaching `boundedFetchAdapter` with `maxRedirects` set and `maxContentLength` unset, producing an unbounded `readBodyBounded` + `JSON.parse` on an attacker response.
- Does not rule out: the already-VIABLE default-feaxios uncapped-read path (`js-sdk-74011b123136054779aaac38`) for callers (e.g. Horizon/RPC) that set no maxContentLength at all; and an external SDK consumer manually configuring maxRedirects-only, which collapses into that same known unbounded-read class.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "http-client"
route_id = "js-sdk-f3602f77d6787375a5a1ec22"
weakness = "json_deserialization"
record_kind = "residual_escalation"
path = ["<anonymous>", "JSON.parse"]
sink = "JSON.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:readBodyBounded", "src/stellartoml/index.ts:resolve", "src/federation/server.ts:_sendRequest"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["bounded_json_parse_no_unbounded_read_for_reachable_boundedadapter_callers"]
rules_out = ["in-source SDK caller reaching boundedFetchAdapter with maxRedirects set and maxContentLength unset to drive unbounded readBodyBounded + JSON.parse"]
does_not_rule_out = ["default feaxios path js-sdk-74011b123136054779aaac38 unbounded read for callers with no maxContentLength (Horizon/RPC)", "external SDK consumer manually setting maxRedirects-only, which is the same already-VIABLE unbounded-read class, not distinct"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "boundedFetchAdapter with maxContentLength undefined reads uncapped then JSON.parse, but the only two in-source callers (stellartoml, federation) always set maxContentLength, so maxRedirects-without-maxContentLength is never instantiated by SDK code; external maxRedirects-only collapses into already-VIABLE default-path unbounded read."
why_failed_brief = "exact residual route is unreachable in source (both boundedFetchAdapter callers set maxContentLength) and the external-caller variant duplicates the already-VIABLE default-feaxios unbounded-read finding."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "stellartoml (index.ts:56-57) and federation (server.ts:225-226) unconditionally set maxContentLength on the boundedFetchAdapter request, so readBodyBounded enforces a cap for every in-source caller."

[[blockers]]
kind = "unreachable_branch"
guarantee = "no in-source caller sets maxRedirects without maxContentLength; the adapter selection (fetch-client.ts:483-486) reaches the uncapped readBodyBounded branch only for an external caller config, which is the same effect as the already-VIABLE default-feaxios path."
```
