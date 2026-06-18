# F9662: Path blocked: Horizon transaction submission network request (area)

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/9662-path-seed.md
**Verdict**: NOT_VIABLE
**Hypothesis by**: claude-opus-4-8, high

## Path Checked

`submitAsyncTransaction -> this.ht ...   .post`

Area sibling set re-derived from source: `submitTransaction`/`submitAsyncTransaction`
POST issuance, `_sendNormalRequest`/`_requestFnForLink` GET issuance and `_links`
following, `fetchTimebounds`, and the construct-time HTTPS gate.

## Blocker

Every network-integrity lever on this sibling set is source-closed. Outbound
request authority is pinned: `_sendNormalRequest` overwrites `url.protocol` and
`url.host` with the configured server before every GET, so attacker-controlled
absolute `_links.href` values returned by a malicious/proxied Horizon cannot
redirect a request off the trusted host (only path/query stay, which is the
trusted server's own choice). The constructor rejects non-`https:` URLs unless
the caller explicitly set `allowHttp`. Decoded inbound data — `result_xdr`
parsed via `xdr.TransactionResult.fromXDR` and the async `response.data` — is a
terminal Promise return value that never re-enters signing or submission. The
only inbound field that re-enters SDK security logic is server time, which is a
distinct route already recorded VIABLE (js-sdk-26e2014c…), not a new finding.

## Evidence

- `src/horizon/server.ts:120` - constructor throws unless `protocol === "https:"` or `allowHttp` is set; HTTPS policy validated at construction.
- `src/horizon/call_builder.ts:387-398` - `_sendNormalRequest` sets `url.protocol`/`url.host` to the configured server, neutralizing absolute `_links` hrefs from the remote response.
- `src/horizon/call_builder.ts:330-344` - `_requestFnForLink` only resolves links lazily on explicit caller invocation; the SDK never auto-follows, so no unbounded server-driven request loop.
- `src/horizon/server.ts:354-527` - `submitTransaction` result_xdr decode produces a leaf return object (offerResults/amounts); not fed back into any signing/submission decision.
- `src/horizon/server.ts:580-595` - `submitAsyncTransaction` resolves `response.data` directly to the caller; error path maps to `BadResponseError`, both terminal.

## Negative Scope

- Rules out: a distinct (non-server-time) network-request/remote-response-integrity vulnerability on the async/sync submission POST and the read-side GET/`_links`-following siblings — outbound authority is host/protocol-pinned and inbound decoded data is leaf-return.
- Does not rule out: the already-VIABLE server-time → `getCurrentServerTime` → `fetchTimebounds` maxTime route (js-sdk-26e2014c…); the SEP-29 `checkMemoRequired` 404 gate route (js-sdk-2c414395…); and the missing per-request `timeout` on `submitAsyncTransaction` (server-stall hang), which is a Low availability concern below the Medium floor.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-3e3082d9789604107875d9c9"
weakness = "Network request / remote response integrity"
record_kind = "area_seed"
path = ["submitAsyncTransaction", "this.ht ...   .post"]
sink = "this.ht ...   .post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["submitAsyncTransaction", "submitTransaction", "_sendNormalRequest", "_requestFnForLink", "fetchTimebounds", "this.httpClient.get", "post", "get"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["links_host_protocol_pinned_to_configured_server", "decode_output_is_leaf_return_value", "allowhttp_validated_in_constructor"]
rules_out = ["distinct non-time network-request-integrity vuln on async/sync submission POST and read-side GET/_links-following siblings: outbound protocol+host pinned to configured server, decoded result_xdr and response.data are leaf return values, HTTPS enforced at construction"]
does_not_rule_out = ["already-VIABLE server-time -> getCurrentServerTime -> fetchTimebounds maxTime route js-sdk-26e2014c", "SEP-29 checkMemoRequired 404 gate route js-sdk-2c414395", "missing per-request timeout on submitAsyncTransaction (Low availability, below Medium floor)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "submitAsyncTransaction/submitTransaction POST a caller-supplied envelope and the read siblings issue GETs; outbound request authority is pinned to the configured server in _sendNormalRequest and at construction, and all decoded remote responses are terminal return values."
why_failed_brief = "outbound protocol+host pinned to configured server, HTTPS enforced in constructor, and decoded remote responses are leaf return values; only re-entering field (server time) is a separate already-VIABLE route."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_sendNormalRequest forces url.protocol and url.host to the configured server (call_builder.ts:392-393), so attacker _links hrefs cannot leave the trusted host"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "constructor rejects non-https URLs unless allowHttp explicitly set (server.ts:120)"

[[blockers]]
kind = "leaf_return"
guarantee = "decoded result_xdr (server.ts:354-527) and async response.data (server.ts:580-595) are terminal Promise return values, never re-entering signing/submission"
```
