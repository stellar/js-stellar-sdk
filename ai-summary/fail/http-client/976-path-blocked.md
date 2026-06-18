# F976: Path blocked: bounded remote response read in fetch adapter

**Subsystem**: http-client
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/http-client/976-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> readBodyBounded`

Area seed targets: `boundedFetchAdapter`, `readBodyBounded`, `<anonymous>`.

## Blocker

For every in-source caller of `boundedFetchAdapter`, `readBodyBounded` enforces a
finite response-size bound. The adapter is reached only when `maxRedirects` or
`maxContentLength` is set (fetch-client.ts:482-490). `readBodyBounded` performs a
streamed enforcement that aborts the reader (`reader.cancel()`) and throws the
moment the running `total` exceeds `maxContentLength` (fetch-client.ts:176-181),
in addition to an early `content-length` header pre-check (157-161). The two
in-source callers, stellartoml and federation, both pass a hard 100 KB constant
(`STELLAR_TOML_MAX_SIZE`/`FEDERATION_RESPONSE_MAX_SIZE = 100*1024`), so the read,
its error-path twin (line 423), and the post-read `TextDecoder`/`JSON.parse`
allocations are all bounded to a small constant multiple of 100 KB. The streaming
counter operates on decompressed chunk bytes, so spoofed/absent `content-length`
and compression amplification do not bypass it.

## Evidence

- `src/http-client/fetch-client.ts:176-181` - streamed `total > maxContentLength` check cancels the reader and throws, bounding buffered bytes even with a spoofed/absent content-length.
- `src/http-client/fetch-client.ts:482-490` - adapter selected only when `maxRedirects`/`maxContentLength` is set; both `readBodyBounded` call sites (423, 437) forward `maxContentLength`.
- `src/stellartoml/index.ts:11,57` and `src/federation/server.ts:15,226` - both in-source callers set a finite 100 KB `maxContentLength`, so per-request memory is bounded to ~2×100 KB (chunks + `out`).

## Negative Scope

- Rules out: unbounded or mis-accounted read at `readBodyBounded` for in-source `boundedFetchAdapter` callers (stellartoml, federation) via spoofed/absent/contradictory content-length, chunked streaming, transparent decompression, or 2× buffer amplification — all bounded by the 100 KB streamed cap.
- Does not rule out: the no-`maxContentLength` configuration (external caller setting only `maxRedirects`), where lines 157 and 176 are skipped and the read is unbounded — already recorded VIABLE as `js-sdk-21d3e5bacc2e1ae0938706bc`; a decompression-amplified variant of that same unbounded read would share that root cause and sink.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "http-client"
route_id = "js-sdk-fefd13778545c40aba34525a"
weakness = "Resource Exhaustion"
record_kind = "area_seed"
path = ["<anonymous>", "readBodyBounded"]
sink = "readBodyBounded"
sink_role = "bounded_response_read"
impact_class = "resource_exhaustion"
route_family = "bounded_response_read"
material_effect = "bounded_response_read"
target_functions = ["boundedFetchAdapter", "readBodyBounded", "stellartoml/index.ts", "federation/server.ts"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["bounded_read_accounting_holds_for_inscope_boundedadapter_callers"]
rules_out = ["unbounded or mis-accounted read at readBodyBounded for in-source boundedFetchAdapter callers (stellartoml, federation) via spoofed/absent/contradictory content-length, chunked streaming, transparent decompression, or 2x chunk+out buffer amplification, all bounded by the 100KB streamed cap"]
does_not_rule_out = ["no-maxContentLength caller path (maxRedirects-only) where the streamed cap and header pre-check are skipped, already VIABLE js-sdk-21d3e5bacc2e1ae0938706bc", "decompression-amplified variant of the same unbounded read on the no-maxContentLength path"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "readBodyBounded streams the remote body and aborts the reader when running total exceeds maxContentLength; both in-source callers (stellartoml, federation) pass a finite 100KB cap, bounding buffered and decoded memory to a small constant multiple."
why_failed_brief = "for in-source bounded callers the 100KB streamed cap holds; the only Medium+ unbounded path (no maxContentLength) is already recorded VIABLE and not re-reported, and remaining amplification angles stay below the Medium floor."
confidence = "high"

[[sanitizer_guarantees]]
kind = "size_bound"
guarantee = "readBodyBounded aborts the response reader and throws when streamed total exceeds maxContentLength (fetch-client.ts:176-181); in-source callers set a finite 100KB cap"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "content-length header pre-check throws early when the declared length exceeds maxContentLength (fetch-client.ts:157-161)"

[[blockers]]
kind = "constant_bound"
guarantee = "stellartoml and federation set maxContentLength = 100*1024, bounding per-request buffered and decoded memory to ~2x100KB (src/stellartoml/index.ts:11,57; src/federation/server.ts:15,226)"
```
