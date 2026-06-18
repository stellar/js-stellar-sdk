# F953: Path blocked: Horizon streaming JSON deserialization area (distinct mechanisms)

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/953-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`onMessage -> JSON.parse`

Area seed (`record_kind = "area_seed"`) over target set
`<anonymous>`, `Date.parse`, `onMessage`, `JSON.parse`, `parse`. The two primary
deserialization risks on this `route_id` are already adjudicated VIABLE in prior
memory and are intentionally NOT re-reported here:

- `onMessage -> JSON.parse/_parseRecord` with no try/catch or shape validation
  (prior reviewed VIABLE). The parsed object handed to `options.onmessage` is
  trusted downstream — this is the existing finding.
- `responseInterceptor -> getCurrentServerTime -> fetchTimebounds` server-time
  `Date.parse` influence on `maxTime` (prior reviewed VIABLE).

This record adjudicates the remaining DISTINCT mechanisms on the same streaming
path that were not yet covered, and finds none reaches the Medium floor.

## Blocker

The distinct streaming-area mechanisms are all same-origin, leaf, or
host/protocol-pinned. (1) The attacker-controlled `result.paging_token` is
written to the reconnect cursor (`call_builder.ts:201-202`), but `streamUrl` is
built only from `this.url` (`call_builder.ts:119`) and the cursor is sent back
to the same caller-selected Horizon on reconnect (`new EventSource(streamUrl)`,
line 165) — the server influences only a value returned to itself, crossing no
trust boundary. (2) `_parseRecord` link-key field shadowing
(`call_builder.ts:358-382`) replaces a data field with a function and preserves
the original under `${key}_attr`; this is the same parsed-object-trust surface
already captured by the VIABLE `onMessage->JSON.parse` finding, not a distinct
defect. (3) Templated `_links` expansion via `expandUriTemplate`
(`call_builder.ts:336-337`, `src/utils/url.ts:7-39`) is reached only when the
caller later invokes the link function, inserts only caller-supplied `opts`
values (encodeURIComponent), and `_sendNormalRequest` forces `url.protocol`/
`url.host` to the configured server (`call_builder.ts:392-393`), so cross-origin
SSRF is pinned out.

## Evidence

- `src/horizon/call_builder.ts:192-208` - `onMessage` parses `message.data`, sets `cursor` from `result.paging_token`, then hands `result` to `options.onmessage`; no distinct sink beyond the known VIABLE trust-confusion surface.
- `src/horizon/call_builder.ts:119` - `streamUrl` derives from `this.url`; the cursor write-back at line 202 stays on the caller-selected origin, so server-controlled `paging_token` only round-trips to the same server.
- `src/horizon/call_builder.ts:354-385` - `_parseRecord` shadows colliding data fields with link functions and stores originals at `${key}_attr`; specialization of the existing VIABLE parsed-object-trust finding, not a new mechanism.
- `src/horizon/call_builder.ts:387-398` - `_sendNormalRequest` overwrites `url.protocol`/`url.host` with the configured server, pinning out templated-link SSRF.
- `src/utils/url.ts:7-39` - `expandUriTemplate` interpolates only caller-supplied `variables` (encodeURIComponent); attacker template controls query-param names but not values, on the same pinned origin.

## Negative Scope

- Rules out: streaming `paging_token` cursor write-back as a cross-origin/SSRF or trust-boundary-crossing finding; templated `_links` expansion as a Medium SSRF/parse-ambiguity finding (host/protocol pinned, caller-supplied values).
- Does not rule out: the two already-VIABLE routes on this `route_id` (`onMessage->JSON.parse` parsed-object trust confusion, and the `Date.parse` server-time `fetchTimebounds` path), which remain known-viable and are not re-reported here; and `_parseRecord` field-shadowing as a within-scope instance of that same VIABLE trust-confusion surface.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-1081a18ffde6555aa858c026"
weakness = "Untrusted JSON deserialization / parse integrity"
record_kind = "area_seed"
path = ["onMessage", "JSON.parse"]
sink = "JSON.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["onMessage", "JSON.parse", "_parseRecord", "_requestFnForLink", "expandUriTemplate"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["cursor_writeback_same_origin_self_loop", "templated_link_host_protocol_pinned"]
rules_out = ["streaming paging_token cursor write-back as cross-origin/SSRF or trust-boundary crossing (streamUrl derives only from this.url; cursor returns to caller-selected server)", "templated _links expansion as Medium SSRF/parse-ambiguity (host/protocol forced in _sendNormalRequest; only caller-supplied opts interpolated)"]
does_not_rule_out = ["onMessage->JSON.parse parsed-object trust confusion (already reviewed VIABLE on this route_id)", "Date.parse server-time getCurrentServerTime->fetchTimebounds maxTime path (already reviewed VIABLE on this route_id)", "_parseRecord link-key field shadowing as a within-scope instance of the existing VIABLE trust-confusion surface"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Distinct streaming-area mechanisms beyond the two already-VIABLE findings (paging_token cursor write-back, _parseRecord field shadowing, templated _links expansion) are same-origin, leaf, or host/protocol-pinned and do not reach the Medium floor."
why_failed_brief = "Cursor write-back stays on the caller-selected origin; templated-link SSRF is host/protocol pinned; field shadowing is a specialization of the existing VIABLE parsed-object-trust finding, not a distinct defect."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_sendNormalRequest overwrites url.protocol and url.host with the configured server (call_builder.ts:392-393), pinning templated _links expansion to the caller-selected origin"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "streamUrl is constructed only from this.url (call_builder.ts:119); the paging_token cursor write-back (line 202) is returned to the same caller-selected Horizon on reconnect, crossing no trust boundary"

[[blockers]]
kind = "same_origin_self_loop"
guarantee = "attacker-controlled paging_token only influences a cursor value sent back to the server that supplied it; no cross-origin or downstream signing/fee/auth effect"

[[blockers]]
kind = "host_protocol_pinned"
guarantee = "templated _links href cannot redirect host or protocol; expandUriTemplate interpolates only caller-supplied opts values (encodeURIComponent)"
```
