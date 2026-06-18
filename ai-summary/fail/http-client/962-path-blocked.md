# F962: Path blocked: decompression amplification of readBodyBounded on the bounded route

**Subsystem**: http-client
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/http-client/962-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> readBodyBounded`

Residual question: "decompression-amplified variant of the same unbounded read
on the no-maxContentLength path." Resolved to a concrete no for the bounded
route (route_id `js-sdk-fefd13778545c40aba34525a`, the in-source stellartoml /
federation callers that set `maxContentLength`).

## Blocker

`readBodyBounded` enforces the cap on the *decompressed* byte stream, not on the
`content-length` header. Platform fetch decompresses transparently (the file
contains no manual gzip/Content-Encoding handling), so `response.body.getReader()`
yields decompressed chunks. The streaming loop adds each decompressed chunk to
`total` and, when `total > maxContentLength`, calls `reader.cancel()` and throws
before pushing the chunk (`fetch-client.ts:171-184`). A small gzip-compressed body
that passes the optional `content-length` pre-check (line 157-161, which compares
the *compressed* header value) is therefore still bounded once decompression
exceeds 100 KB, and `reader.cancel()` halts further decompression. Peak transient
memory ≈ `maxContentLength` + one runtime decompression chunk, matching the prior
~2x100KB bound. Both in-source bounded callers set the cap to 100*1024
(`stellartoml/index.ts:11,57`; `federation/server.ts:15,226`).

## Evidence

- `src/http-client/fetch-client.ts:171-184` - streaming loop counts `value.byteLength` (decompressed chunk) into `total` and aborts via `reader.cancel()` once `total > maxContentLength`, before buffering the offending chunk.
- `src/http-client/fetch-client.ts:157-161` - the only `content-length`-header check is a pre-filter; the streamed total check is the authoritative bound, so a small compressed header cannot bypass the decompressed accounting.
- `src/stellartoml/index.ts:11,57` and `src/federation/server.ts:15,226` - in-source bounded callers set `maxContentLength = 100*1024`, activating both checks; no manual decompression exists in the file (grep: no gzip/content-encoding/decompress).

## Negative Scope

- Rules out: decompression (gzip/transparent Content-Encoding) bombs bypassing the `maxContentLength` cap on the in-source bounded `readBodyBounded` callers (stellartoml, federation), via a small compressed `content-length` header or single-chunk amplification.
- Does not rule out: the no-`maxContentLength` unbounded read on the `maxRedirects`-only `boundedFetchAdapter` path (`fetch-client.ts:483-487`, readBodyBounded called with `maxContentLength === undefined` → checks at 157/176 skipped). Decompression amplifies that read but it is the SAME already-VIABLE finding (route_id `js-sdk-21d3e5bacc2e1ae0938706bc`), reachable only via external `maxRedirects`-without-`maxContentLength` caller config (no in-source caller does this), not a distinct vulnerability on this route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "http-client"
route_id = "js-sdk-fefd13778545c40aba34525a"
weakness = "bounded_response_read"
record_kind = "residual_escalation"
path = ["<anonymous>", "readBodyBounded"]
sink = "readBodyBounded"
sink_role = "bounded_response_read"
impact_class = "resource_exhaustion"
route_family = "bounded_response_read"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:readBodyBounded", "src/http-client/fetch-client.ts:boundedFetchAdapter"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["bounded_read_accounting_holds_on_decompressed_stream_for_inscope_boundedadapter_callers"]
rules_out = ["gzip/transparent-decompression amplification bypassing maxContentLength at readBodyBounded for in-source bounded callers (stellartoml, federation), via small compressed content-length header or single-chunk decompression"]
does_not_rule_out = ["no-maxContentLength unbounded read on maxRedirects-only boundedFetchAdapter path (route_id js-sdk-21d3e5bacc2e1ae0938706bc, already VIABLE); decompression amplifies that same read but adds no distinct sink/effect and needs external maxRedirects-without-maxContentLength caller config"]
assumptions = ["platform fetch performs transparent Content-Encoding decompression so response.body yields decompressed chunks; the SDK does no manual decompression (grep: no gzip/content-encoding in fetch-client.ts)", "runtime decompression streams yield incrementally with backpressure rather than one unbounded chunk"]
mechanism_brief = "readBodyBounded counts decompressed chunk bytes into total and cancels the reader once total > maxContentLength, so a gzip bomb passing the compressed content-length pre-check is still bounded; peak memory ~= cap + one decompression chunk."
why_failed_brief = "streamed decompressed-byte accounting plus reader.cancel() bounds the bounded route; decompression on the no-cap path is the same already-VIABLE unbounded read, not a distinct finding."
confidence = "high"

[[sanitizer_guarantees]]
kind = "size_bound"
guarantee = "readBodyBounded sums decompressed chunk byteLength into total and throws + reader.cancel() once total > maxContentLength (fetch-client.ts:171-184), bounding peak memory to ~maxContentLength + one decompression chunk on the bounded route"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "content-length header pre-check (fetch-client.ts:157-161) is only a pre-filter; the decompressed streamed-total check is authoritative, so a small compressed content-length cannot bypass the bound"

[[blockers]]
kind = "size_bound"
guarantee = "in-source bounded callers set maxContentLength = 100*1024 (stellartoml/index.ts:11,57; federation/server.ts:15,226), activating the decompressed-stream bound for both reachable callers"
```
