# F953: Path blocked: parse sink covered by existing VIABLE unbounded-read DoS

**Subsystem**: http-client
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/http-client/953-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`boundedFetchAdapter -> parse`

Residual question (size dimension): unbounded read/parse cost when an external
caller sets `maxRedirects` without `maxContentLength`.

## Source Resolution (concrete yes/no)

The escalated trace confirms the parse sink **is** reached with unbounded input
on a `maxRedirects`-only config. The adapter selector enters
`boundedFetchAdapter` when `maxRedirects !== undefined` OR
`maxContentLength !== undefined` (fetch-client.ts:483-486), so a caller setting
only `maxRedirects` enters it with `maxContentLength === undefined`. Inside
`readBodyBounded` both the content-length pre-check and the streamed-total abort
are gated on `maxContentLength !== undefined` (lines 157, 176), so the full body
is buffered (line 437), then `TextDecoder().decode` (438) and `JSON.parse` (441)
run on it.

## Blocker

This is not a distinct vulnerability: the unbounded-response resource-exhaustion
DoS on this exact `maxRedirects`-only path is already adjudicated VIABLE as route
`js-sdk-21d3e5bacc2e1ae0938706bc` (upstream `readBodyBounded`). The `parse` sink
is strictly downstream of and dominated by that already-known unbounded read —
`readBodyBounded` consumes memory unbounded *before* returning, and the parse
stage adds only a constant-factor allocation that is itself implicitly capped by
V8's max string length (`TextDecoder.decode` throws `RangeError` past ~1GB).
`JSON.parse` on valid JSON is linear (no super-linear/algorithmic-complexity
blowup), and parse exceptions are swallowed to a string fallback (lines 440-444).
No distinct type-confusion, prototype-pollution, or parse-integrity vulnerability
exists at this generic adapter sink — those do not depend on the `maxRedirects`
flag and were previously ruled out. Re-reporting the size dimension at `parse`
would duplicate the existing VIABLE finding.

## Evidence

- `src/http-client/fetch-client.ts:483-486` - adapter selected when `maxRedirects` OR `maxContentLength` is set, so maxRedirects-only enters with maxContentLength undefined.
- `src/http-client/fetch-client.ts:157,176` - both size guards gated on `maxContentLength !== undefined`; no-op when undefined, so the read is unbounded.
- `src/http-client/fetch-client.ts:437-444` - full body buffered then decoded/`JSON.parse`d; parse errors swallowed to string fallback (no crash, no distinct integrity break).
- `src/federation/server.ts:226` and `src/stellartoml/index.ts:56-57` - the only in-source callers; federation sets maxContentLength, stellartoml sets both — neither hits the maxRedirects-only branch.

## Negative Scope

- Rules out: a DISTINCT parse-sink vulnerability (type confusion, prototype pollution, parse-integrity, or independent parse-cost/algorithmic-complexity DoS) at `boundedFetchAdapter -> JSON.parse` beyond the already-known unbounded-response resource exhaustion.
- Does not rule out: the unbounded-response memory-exhaustion DoS on the `maxRedirects`-only path, which remains VIABLE under route `js-sdk-21d3e5bacc2e1ae0938706bc` (upstream `readBodyBounded`); this record only declines to re-report it at the downstream parse sink.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "http-client"
route_id = "js-sdk-2667d1608bbbc484f42b2544"
weakness = "json_deserialization"
record_kind = "residual_escalation"
path = ["boundedFetchAdapter", "parse"]
sink = "parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:readBodyBounded"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "json_decoded"
scope.size_class = "unbounded_when_only_max_redirects_set"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["parse_sink_no_distinct_vuln_beyond_existing_viable_unbounded_read_dos"]
rules_out = ["distinct parse-sink vulnerability (type confusion, prototype pollution, parse-integrity, independent parse-cost DoS) beyond the already-VIABLE unbounded-response resource exhaustion"]
does_not_rule_out = ["unbounded-response memory-exhaustion DoS on maxRedirects-only path, VIABLE under route js-sdk-21d3e5bacc2e1ae0938706bc (upstream readBodyBounded)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "parse sink IS reached with unbounded input on maxRedirects-only config, but this is the same resource-exhaustion DoS already VIABLE upstream at readBodyBounded; parse adds only constant-factor allocation implicitly capped by V8 max string length, and no distinct type/pollution/integrity vuln exists here."
why_failed_brief = "no distinct vulnerability at parse sink; size dimension duplicates existing VIABLE route js-sdk-21d3e5bacc2e1ae0938706bc; parse stage dominated by and downstream of the already-known unbounded read."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "JSON.parse exceptions are caught and fall back to the raw string (fetch-client.ts:440-444), so a malformed/deeply-nested body cannot crash or change decoding semantics at this sink."

[[sanitizer_guarantees]]
kind = "implicit_bound"
guarantee = "TextDecoder.decode is bounded by V8 max string length (~1GB, throws RangeError), so the parse stage cannot exceed the upstream unbounded read it follows."

[[blockers]]
kind = "duplicate_of_viable"
guarantee = "the maxRedirects-only unbounded-response DoS is already adjudicated VIABLE as route js-sdk-21d3e5bacc2e1ae0938706bc at the upstream readBodyBounded sink; the parse sink adds no distinct material effect."
```
