# F001: Path blocked: Horizon result_xdr decode surfaces caller-selected server's own result

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/001-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> (submitTransaction .then handler) -> fromXDR`

Sibling target set (`<anonymous>`, `xdr.Tra ... fromXDR`, `fromXDR`) collapses to a
single concrete sink: `xdr.TransactionResult.fromXDR(response.data.result_xdr, "base64")`
at `src/horizon/server.ts:359`. This is the only `fromXDR` call in all of
`src/horizon`. Call builders (`call_builder.ts` `_parseRecord`/`_parseResponse`) only
`JSON.parse` and attach link-follow closures; they never decode XDR.
`submitAsyncTransaction` (`server.ts:584`) returns `response.data` verbatim with no
decode of `error_result_xdr`.

## Blocker

The decoded `TransactionResult` originates entirely from the same caller-selected
Horizon server whose JSON body the SDK already trusts and returns. There is no second
trust source to confuse: the decoded `offerResults` are merged back into the same
server's `response.data` and returned to the caller (`server.ts:524-527`), never fed
into signing, fee derivation, or resubmission. A malicious/MITM Horizon controls both
the JSON and `result_xdr`, so any "wrong semantics" it can express through the decoded
result it can equally express through the JSON it already authors — this is the
documented "trust the server you chose" model, not an SDK validation gap. The decode
itself is a single bounded `TransactionResult` (bounded by the already-received
response body); deep-nesting recursion is capped by js-xdr `DEFAULT_MAX_DEPTH=200`
(prior memory, route `js-sdk-aa9b65c61d46ef89d4540f22`), and per-element work over the
operation/`offersClaimed` arrays is linear in the received body (prior memory:
linear_cost_no_src_amplification). No material side effect crosses back into
transaction state, signing, or fund movement.

## Evidence

- `src/horizon/server.ts:355-365` - `result_xdr` is decoded only when present, then `responseXDR.result().value()` is read; the decoded value is not validated against the JSON `successful`/`hash` nor any signature (none exists to verify against).
- `src/horizon/server.ts:524-527` - decoded `offerResults` are spread into the same untrusted `response.data` and returned; the decode output is a leaf return value, not an input to any further SDK security decision.
- `src/horizon/server.ts:584` - `submitAsyncTransaction` returns `response.data` without decoding `error_result_xdr`, so no second decode sink exists on the async path.
- `src/horizon/call_builder.ts:354-410` - record/response parsing is JSON-only; no `fromXDR` in any call builder, confirming server.ts:359 is the lone horizon XDR-decode sink.

## Negative Scope

- Rules out: `xdr.TransactionResult.fromXDR` on the `submitTransaction` result path as a stand-alone parse-integrity / trust-confusion finding in `src/horizon` — the decoded result is the caller-selected server's own claim, has no independent trust source, and never feeds signing/submission/fund movement.
- Does not rule out: (a) unchecked union-arm access (`result.value().switch()` at server.ts:375, `.value().value().success()` at server.ts:386) throwing a `TypeError` when a remote server returns an HTTP-200 `result_xdr` whose operation/offer result code is not `opINNER`/`manageOfferSuccess` — a local robustness defect, but Low severity (caller-side exception only, no fund loss), below the Medium floor; (b) any future SDK code that consumes `submitTransaction` output as input to re-signing or resubmission.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-d87c484129de8eb8cd54070c"
weakness = "XDR decode / parse integrity"
record_kind = "area_seed"
path = ["<anonymous>", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/horizon/server.ts:submitTransaction", "xdr.TransactionResult.fromXDR"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["single_trust_source_no_confusion", "decode_output_is_leaf_return_value", "xdr_decode_depth_capped_at_200", "linear_cost_no_src_amplification"]
rules_out = ["xdr.TransactionResult.fromXDR on submitTransaction result_xdr as a parse-integrity/trust-confusion finding: decoded value is the caller-selected server's own result, merged back into the same untrusted JSON and returned as a leaf value with no second trust source and no feedback into signing/submission/fund movement"]
does_not_rule_out = ["unchecked union-arm access (server.ts:375,386) throwing TypeError on crafted HTTP-200 result_xdr (Low robustness, below Medium floor)", "future consumers that route submitTransaction output back into re-signing or resubmission"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "submitTransaction decodes result_xdr from a caller-selected Horizon response into a TransactionResult and surfaces offer results; the decoded value has no independent trust source and is a returned leaf, not an input to any SDK security decision."
why_failed_brief = "Sole horizon fromXDR sink surfaces the trusted server's own result with no cross-trust-source confusion, no signing/submission feedback, bounded single-object decode (depth cap 200, linear per-element cost); only sub-Medium local exceptions remain."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "trust_boundary"
guarantee = "result_xdr and the surrounding JSON come from the same caller-selected server; the decoded result is merged into response.data (server.ts:524-527) and returned, so the SDK introduces no trust elevation the server lacks via JSON."

[[sanitizer_guarantees]]
kind = "bounded_decode"
guarantee = "single TransactionResult bounded by the received response body; js-xdr decode recursion capped at DEFAULT_MAX_DEPTH=200, per-element work linear in the already-received body."

[[blockers]]
kind = "no_material_sink"
guarantee = "decoded result is a leaf return value (server.ts:524-527); it is not fed into signing, fee derivation, auth, or resubmission, and submitAsyncTransaction (server.ts:584) returns response.data without decoding."
```
