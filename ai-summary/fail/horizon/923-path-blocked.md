# F923: Path blocked: Horizon transaction-XDR decode is a leaf return value

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/923-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> xdr.Tra ... fromXDR`

## Blocker

The only transaction-XDR decode sink in `src/horizon` is `xdr.TransactionResult.fromXDR(response.data.result_xdr, "base64")` at `server.ts:359`, reached only on the `submitTransaction` success path when the caller-selected server returns a `result_xdr`. The decoded value is consumed solely to derive `offerResults` (DEX affordance amounts/prices) and is then merged into the returned object (`server.ts:524-527`) and handed back to the caller. The SDK never re-reads it for signing, fee derivation, auth, sequence, or resubmission, so a malformed/lying decode cannot redirect any SDK security decision (leaf return value). The sibling `submitAsyncTransaction` path performs no decode at all — it returns `response.data` verbatim (`server.ts:584`). Worst observable effect from malformed union arms or the `default` throw (`server.ts:374-376,386,412-415`) is a catchable `TypeError`/`Error` that the `.catch` re-rejects unchanged (`server.ts:529-538`): fail-closed, Low robustness, below the Medium floor. Per-response cost is linear in the XDR/operation/claimed-offer count with no super-linear amplification, and `getAmountInLumens` divides by a constant 1e7, not by attacker-controlled values.

## Evidence

- `src/horizon/server.ts:359-365` - sole transaction-XDR decode sink; result fed only into the `offerResults` map.
- `src/horizon/server.ts:524-527` - decoded-derived `offerResults` returned to caller; never re-read by the SDK.
- `src/horizon/server.ts:584` - `submitAsyncTransaction` returns `response.data` without any XDR decode.
- `src/horizon/server.ts:529-538` - `.catch` re-rejects thrown `Error` unchanged; decode failure is catchable and fail-closed.
- `src/horizon/horizon_api.ts:17-19,681` - `envelope_xdr`/`result_meta_xdr` are pass-through string fields, not decoded inside horizon.

## Negative Scope

- Rules out: `xdr.TransactionResult.fromXDR` on `submitTransaction` `result_xdr` (and derived `offerResults`) as a parse-integrity, trust-confusion, resource-exhaustion, or numeric-domain finding — decode output is a leaf return value, decode failure is a catchable fail-closed throw, and per-response cost is linear.
- Does not rule out: decode/validation of `envelope_xdr`/`result_meta_xdr` strings if a caller or another subsystem later parses those returned strings; XDR transaction-envelope decode paths outside `src/horizon` (e.g. `src/transaction*`).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-5f3e8285bdb0d1bde50ff0fd"
weakness = "XDR decode of remote-influenced transaction data"
record_kind = "area_seed"
path = ["<anonymous>", "xdr.Tra ... fromXDR"]
sink = "xdr.Tra ... fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/horizon/server.ts:submitTransaction", "src/horizon/server.ts:submitAsyncTransaction", "xdr.TransactionResult.fromXDR"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["decode_output_is_leaf_return_value", "catchable_throw_fail_closed", "linear_cost_no_src_amplification"]
rules_out = ["xdr.TransactionResult.fromXDR on submitTransaction result_xdr and derived offerResults as parse-integrity/trust-confusion/resource-exhaustion/numeric-domain: decoded value is a leaf return value (server.ts:359,524-527), decode failure is a catchable fail-closed throw (server.ts:529-538), and per-response cost is linear with constant-divisor amount scaling"]
does_not_rule_out = ["downstream caller-side parsing of returned envelope_xdr/result_meta_xdr strings", "XDR transaction-envelope decode paths outside src/horizon"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "submitTransaction decodes result_xdr via xdr.TransactionResult.fromXDR only to build offerResults, returned to the caller and never re-read for SDK security decisions; submitAsyncTransaction does not decode at all."
why_failed_brief = "decode output is a leaf return value; decode failure is catchable/fail-closed; linear cost; worst effect below Medium floor"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "decode failure and malformed union arms throw a catchable Error/TypeError that .catch re-rejects unchanged (server.ts:529-538), fail-closed"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "amount conversion divides by constant 1e7 (getAmountInLumens), not by attacker-controlled denominators"

[[blockers]]
kind = "leaf_return_value"
guarantee = "decoded TransactionResult/offerResults are returned to the caller (server.ts:524-527) and never re-read by the SDK for signing, fee, auth, sequence, or resubmission"
```
