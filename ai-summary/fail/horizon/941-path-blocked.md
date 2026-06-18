# F941: Path blocked: Horizon submission/request network integrity surface

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/941-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`submitTransaction -> post`

Area seed covering the sibling submission/read network-request set: `submitTransaction`,
`submitAsyncTransaction`, `post`, `_sendNormalRequest`/`get`, the remote `_links`
follow path, `fetchTimebounds`, and the streaming `onMessage` handler.

## Blocker

The seed's primary sink (`submitTransaction -> post` and `submitAsyncTransaction -> post`)
is transport-gated once at construction: `server.ts:120` throws "Cannot connect to
insecure horizon server" unless `serverURL.protocol === "https:"` or `allowHttp` is
explicitly set, so the outbound `post` cannot silently downgrade transport. The submitted
envelope is the caller's own value and the decoded `result_xdr`/`offerResults` are a leaf
return value never re-read by the SDK for signing, fee, auth, sequence, or resubmission
(prior NOT_VIABLE js-sdk-5f3e8285bdb0d1bde50ff0fd). The remote `_links` follow path is
contained by `_sendNormalRequest` rewriting `url.protocol` and `url.host` to the configured
server (`call_builder.ts:392-393`), so a remote response cannot redirect a follow-up GET to
an attacker host; residual userinfo/path/query land only on the already-trusted configured
host. `checkMemoRequired` is fail-closed except the documented SEP-29 account-not-found
(404) case (`server.ts:896-906`).

## Evidence

- `server.ts:120-122` - construction-time https/allowHttp gate blocks insecure submission transport.
- `server.ts:349-362,524-527` - submitTransaction posts caller's envelope; decoded result is a returned leaf value.
- `server.ts:580-595` - submitAsyncTransaction returns `response.data` raw with no SDK re-use.
- `call_builder.ts:387-399` - `_sendNormalRequest` forces configured protocol+host onto remote `_links` URLs, blocking SSRF.
- `server.ts:885-907` - checkMemoRequired only continues on NotFoundError, otherwise re-throws (fail-closed).

## Negative Scope

- Rules out: remote-`_links` host/transport redirection (SSRF) on read builders; transport downgrade on the submission `post`; trust confusion from the submitTransaction result-XDR leaf decode.
- Does not rule out: server-`date`-header to `maxTime` timebound inflation via `fetchTimebounds`/`getCurrentServerTime` (already VIABLE js-sdk-1081a18ffde6555aa858c026), unguarded `JSON.parse` in streaming `onMessage` (already VIABLE js-sdk-1081a18ffde6555aa858c026), and a possible distinct premature-expiry variant when the server `date` is far in the past.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-26e2014cc473b795c741c78d"
weakness = "network request integrity / remote-response trust boundary"
record_kind = "area_seed"
path = ["submitTransaction", "post"]
sink = "post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["submitTransaction", "submitAsyncTransaction", "post", "_sendNormalRequest", "fetchTimebounds", "checkMemoRequired"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["transport_gate_at_construction", "remote_links_host_protocol_rewrite", "decode_output_is_leaf_return_value"]
rules_out = ["remote _links host/transport redirection (SSRF) on read call builders via _sendNormalRequest", "insecure transport downgrade on the submission post sink", "trust confusion from submitTransaction result_xdr leaf decode"]
does_not_rule_out = ["server date-header maxTime inflation in fetchTimebounds/getCurrentServerTime (already VIABLE)", "unguarded JSON.parse in streaming onMessage (already VIABLE)", "premature-expiry timebound variant from a far-past server date"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Submission post sinks are https-gated at construction and emit the caller's own envelope; decoded results are leaf return values; remote _links follow requests are host/protocol-pinned to the configured server, so the network-request boundary cannot be redirected or downgraded by a remote response."
why_failed_brief = "submission/transport sinks source-blocked by construction-time https gate, leaf-return decode, and _sendNormalRequest host/protocol rewrite; the only open mechanisms on this area (date->timebounds, streaming JSON.parse) are already VIABLE and not re-reported"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "server.ts:120 rejects non-https serverURL unless allowHttp is explicitly enabled, gating the post submission transport"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "call_builder.ts:392-393 overwrites remote _links url.protocol and url.host with the configured server, blocking SSRF on follow-up GETs"

[[blockers]]
kind = "leaf_return_value"
guarantee = "submitTransaction/submitAsyncTransaction decoded responses are returned to the caller and never re-read by the SDK for signing, fee, auth, sequence, or resubmission"
```
