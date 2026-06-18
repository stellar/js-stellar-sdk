# F959: Path blocked: Horizon response XDR decode of attacker-controlled envelope/result fields

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/959-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> fromXDR`

This is an `area_seed` with target set `<anonymous>`, `xdr.Tra ... fromXDR`,
`fromXDR`. I treated the three targets as one sibling set rooted at the single
real XDR decode site reachable from horizon source.

## Blocker

The only `fromXDR` decode in `src/horizon` is `xdr.TransactionResult.fromXDR`
on `response.data.result_xdr` inside `Server.submitTransaction`
(`server.ts:359-362`). Its decoded value is consumed only to compute the
`offerResults` summary and is then merged back into the same untrusted
`response.data` and returned to the caller (`server.ts:524-527`). It is never
re-read by the SDK for transaction signing, fee derivation, auth-entry
selection, sequence handling, memo decisions, or resubmission, so a malicious
caller-selected server cannot use the decode outcome to mislead a later signing
or submission decision. Every malformed-XDR or wrong-union-arm access
(`server.ts:365/375/386/413`) throws a catchable `TypeError`/`Error` that the
`.catch` re-rejects unchanged (`server.ts:530-531`) — a Low robustness effect
against the server the caller already trusted, below the Medium floor.
`submitAsyncTransaction` returns `response.data` without any XDR decode
(`server.ts:584`).

## Evidence

- `src/horizon/server.ts:359-362` - sole horizon `fromXDR`; decodes
  caller-selected server's `result_xdr`.
- `src/horizon/server.ts:386,413` - union-arm access (`.success()`) and the
  explicit `throw` on unexpected `ClaimAtomType`; both are catchable throws on
  attacker-shaped XDR.
- `src/horizon/server.ts:524-527` - decoded `offerResults` is a leaf return
  value spread back into untrusted `response.data`; not fed forward.
- `src/horizon/server.ts:584` - `submitAsyncTransaction` returns raw
  `response.data`, no decode.
- Scoped `grep` of `src/horizon/` confirms no other `fromXDR` / `.read(` decode
  site; `envelope_xdr`/`result_xdr`/`result_meta_xdr`/`error_result_xdr` in
  `horizon_api.ts:17-26,681-686` are plain string response-type fields the SDK
  does not decode.

## Negative Scope

- Rules out: `xdr.TransactionResult.fromXDR` on `submitTransaction.result_xdr`
  (and the derived `offerResults`) as a parse-integrity, trust-confusion,
  resource-exhaustion, or numeric-domain finding — decoded value is a leaf
  return value and every failure is a catchable throw below Medium.
- Does not rule out: JSON-level trust confusion in `_parseRecord` / call-builder
  response parsing, or `checkMemoRequired` being misled by crafted remote
  account JSON (different `route_family`, not an `fromXDR` XDR decode); and
  `fromXDR`/`ScVal.fromXDR` decode paths in the RPC subsystem
  (`parseRawEvents`, contract assembly) which are separate routes.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-d87c484129de8eb8cd54070c"
weakness = "XDR decode of remote-influenced input"
record_kind = "area_seed"
path = ["<anonymous>", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["<anonymous>", "xdr.TransactionResult.fromXDR", "fromXDR", "src/horizon/server.ts:submitTransaction"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["decode_output_is_leaf_return_value", "catchable_throw_fail_closed"]
rules_out = ["xdr.TransactionResult.fromXDR on submitTransaction result_xdr and the derived offerResults as a parse-integrity/trust-confusion/resource-exhaustion/numeric-domain finding: decoded value is merged back into untrusted response.data and returned (server.ts:524-527), never re-read for signing/fee/auth/sequence/resubmission, and every malformed-XDR access throws a catchable error (server.ts:386,413,530-531)"]
does_not_rule_out = ["JSON-level _parseRecord / call-builder trust confusion", "checkMemoRequired misled by crafted remote account JSON (non-xdr route_family)", "ScVal.fromXDR / contract-spec fromXDR decode paths in the RPC subsystem (parseRawEvents, assembled_transaction)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Sole horizon fromXDR (server.ts:359) decodes the caller-selected server's result_xdr only to build an offerResults summary spread back into the same untrusted response.data and returned; submitAsyncTransaction does not decode."
why_failed_brief = "decoded XDR is a leaf return value never re-read for any signing/submission decision, and all malformed-input accesses are catchable throws below the Medium floor"
confidence = "high"

[[sanitizer_guarantees]]
kind = "control_flow_invariant"
guarantee = "decoded TransactionResult/offerResults at server.ts:524-527 is a leaf return value; the SDK never re-reads it for signing, fee, auth, sequence, memo, or resubmission decisions"

[[sanitizer_guarantees]]
kind = "fail_closed_throw"
guarantee = "malformed XDR or wrong-union-arm access (server.ts:386,413) throws a catchable Error that .catch re-rejects unchanged (server.ts:530-531), giving only a Low availability effect against the caller-selected server"

[[blockers]]
kind = "single_decode_site"
guarantee = "scoped grep of src/horizon confirms server.ts:359 is the only fromXDR/XDR decode site; envelope_xdr/result_xdr/result_meta_xdr/error_result_xdr are undecoded string response-type fields"
```
