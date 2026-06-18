# F920: Path blocked: _parseRecord link-key field shadowing (residual escalation)

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/920-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`onMessage -> JSON.parse` (then `_parseRecord` link-key shadowing)

Residual question: is `_parseRecord` link-key field shadowing a within-scope,
distinct instance of the existing VIABLE trust-confusion surface on this route?

## Blocker

Field shadowing in `_parseRecord` operates entirely inside the
`remote_horizon_server` trust boundary on data the same server already fully
controls: for each key in server-supplied `json._links`, a colliding top-level
field is **copied** (not lost) to `json[`${key}_attr`]` (call_builder.ts:363)
before `json[key]` is replaced with a link/join function. A malicious server
gains nothing it could not achieve by simply emitting a different field value
directly, so no cross-trust-boundary confusion arises. The replacement link
functions route through `_sendNormalRequest`, which pins protocol and host to
`this.url` (call_builder.ts:392-393), foreclosing cross-origin/SSRF. The only
SDK-internal consumer of a parsed field is the `paging_token` cursor
write-back (call_builder.ts:201-202), already a same-origin self-loop with no
signing/fee/auth effect (prior NOT_VIABLE, route js-sdk-1081a18ffde6555aa858c026).
Shadowing introduces no new synchronous throw distinct from the already-known
`JSON.parse` throw surface.

## Evidence

- `src/horizon/call_builder.ts:_parseRecord:354-385` - colliding data field is preserved at `${key}_attr` (line 363); `json[key]` overwritten with a function only; recursion gated by `JOINABLE=["transaction"]` whitelist (line 374).
- `src/horizon/call_builder.ts:_requestFnForLink:330-345` / `_sendNormalRequest:387-398` - link-derived requests pin `url.protocol`/`url.host` to `this.url` (392-393), so no cross-origin redirect from shadowed link keys.
- `src/horizon/call_builder.ts:onMessage:198-203` - only `result.paging_token` is consumed internally (cursor on the same caller-selected server); result is otherwise passed to caller `options.onmessage`.

## Negative Scope

- Rules out: `_parseRecord` link-key field shadowing as a distinct trust-confusion / parse-integrity escalation (server-only data, original preserved at `_attr`, host/protocol-pinned link functions, cursor self-loop).
- Does not rule out: the separately-tracked VIABLE unhandled synchronous throw around `JSON.parse`/`_parseRecord` inside `onMessage` (no try/catch); prototype-key (`__proto__`/`constructor`) handling in `Object.keys(json._links)` was checked and produces only local, non-global effects, but a deeper proto-pollution chain in downstream consumers was not exhaustively traced.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-1081a18ffde6555aa858c026"
weakness = "json_deserialization"
record_kind = "residual_escalation"
path = ["onMessage", "JSON.parse"]
sink = "JSON.parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/call_builder.ts:_parseRecord", "src/horizon/call_builder.ts:onMessage", "src/horizon/call_builder.ts:_sendNormalRequest"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["shadowed_field_original_preserved_at_attr_suffix", "link_fn_host_protocol_pinned_same_origin", "shadowing_within_single_server_trust_boundary"]
rules_out = ["_parseRecord link-key field shadowing as a distinct cross-trust-boundary trust-confusion or parse-integrity escalation: colliding data field is copied to ${key}_attr and only replaced with a host/protocol-pinned link/join function, all within server-controlled response data"]
does_not_rule_out = ["separately-tracked VIABLE unhandled synchronous throw around JSON.parse/_parseRecord in onMessage (no try/catch)", "deep prototype-pollution chain via __proto__/constructor keys in downstream consumers (local-only effect confirmed at this sink)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "For each server-supplied _links key colliding with a top-level field, _parseRecord preserves the original at ${key}_attr and replaces json[key] with a link/join function; all data is server-controlled, link functions are host/protocol-pinned via _sendNormalRequest, and the only internal consumer (paging_token cursor) is a same-origin self-loop."
why_failed_brief = "Shadowing rearranges only same-server-controlled data with the original preserved at _attr; link functions are host/protocol pinned; no SDK signing/fee/auth decision reads shadowed fields; no new throw distinct from the known VIABLE JSON.parse surface."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "Colliding top-level field is copied to json[`${key}_attr`] (call_builder.ts:363) before json[key] is replaced, so the original value is never silently lost."

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_sendNormalRequest forces url.protocol and url.host to this.url (call_builder.ts:392-393), pinning all link-derived requests to the caller-selected server (no cross-origin from shadowed link keys)."

[[blockers]]
kind = "trust_boundary"
guarantee = "The entire parsed json originates from the remote_horizon_server; shadowing rearranges only data that server already fully controls, so no value crosses a trust boundary it did not already control."

[[blockers]]
kind = "no_security_decision_on_sink_output"
guarantee = "The SDK reads only result.paging_token internally (cursor write-back to the same server, prior same-origin self-loop); no signing, fee, auth, or sequence decision reads shadowed record fields."
```
