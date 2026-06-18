# F951: Path blocked: getTransaction returnValue decoding into SentTransaction.result

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/951-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`SentTransaction.send -> getTransaction -> SentTransaction.result`

Residual question: is there a *true SDK mis-decoding* bug of getTransaction
payloads (distinct from server-forged values the SDK cannot detect) that turns
a failed/void on-chain transaction into a materially wrong successful result?

## Blocker

There is a genuine SDK decoding inconsistency on this route, but it cannot reach
Medium+ integrity impact from an honest server. `SentTransaction.result`
discriminates success on `"returnValue" in response` instead of
`status === SUCCESS` (sent_transaction.ts:134-140), and `parseTransactionInfo`
sets `info.returnValue = metaV.sorobanMeta()?.returnValue() ?? undefined` for any
V3/V4 meta regardless of status (parsers.ts:56-64). However the XDR types bound
the worst case: V3 `SorobanTransactionMeta.returnValue` is non-optional and a
failed tx has `sorobanMeta === null`, so no `returnValue` is set and `result`
correctly throws; V4 `SorobanTransactionMetaV2.returnValue` is `null | ScVal`
(curr.d.ts:5404), so a failed tx yields `returnValue = undefined` and
`parseResultXdr(undefined)` crashes in `funcResToNative` at `undefined.switch()`
(spec.ts:619-621) — a cryptic TypeError, never a silently-parsed success value.
A malicious server gains nothing: it could send `status=SUCCESS` with the same
`returnValue` directly. So honest-server impact is a Low degraded-error; the
in-scope attacker gets no added power.

## Evidence

- `src/contract/sent_transaction.ts:110-127` - `send` throws only on `NOT_FOUND`, so a `FAILED` tx flows through to `result`.
- `src/contract/sent_transaction.ts:134-144` - `result` keys success on `"returnValue" in response`, ignoring `status`, then calls `parseResultXdr(returnValue!)`.
- `src/rpc/server.ts:766-768` - `getTransaction` runs `parseTransactionInfo` for any status `!== NOT_FOUND`, including `FAILED`.
- `src/rpc/parsers.ts:56-64` - `info.returnValue = metaV.sorobanMeta()?.returnValue() ?? undefined` sets the property (even when undefined) for any V3/V4 meta, decoupled from success/failure.
- `src/base/generated/curr.d.ts:5289,5404` - V3 `returnValue: ScVal` (non-optional) vs V4 `returnValue: null | ScVal` (optional); failed V4 → null → undefined.
- `src/contract/spec.ts:612-624` - `funcResToNative(undefined)` reaches `val.switch()` on undefined and throws a TypeError, not a parsed value.

## Negative Scope

- Rules out: a failed or void getTransaction payload being mis-decoded by the
  SDK into a believed-successful, materially-wrong `SentTransaction.result`
  value reachable from an honest server (Medium+ transaction-integrity).
- Does not rule out: the Low-severity decoding inconsistency itself — the
  status-blind `"returnValue" in` discriminator plus `?? undefined` property
  creation — which on protocol-23 V4 metas surfaces a failed transaction as a
  cryptic TypeError instead of the documented `SentTransaction.Errors.SendFailed`
  / "Transaction failed!" error, and would crash a void-returning success if
  core ever omits `returnValue`. Also does not rule out a contract-binding
  `parseResultXdr` whose `funcResToNative` returns a wrong native value for a
  non-undefined but unexpected ScVal type (separate spec-decoding route).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-47e96488c443cb7f894f39b4"
weakness = "transaction_result_presentation"
record_kind = "single_path"
path = ["SentTransaction.send", "getTransaction", "SentTransaction.result"]
sink = "SentTransaction.result"
sink_role = "transaction_result_presentation"
impact_class = "transaction_integrity"
route_family = "transaction_result_presentation"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/sent_transaction.ts:result", "src/rpc/parsers.ts:parseTransactionInfo", "src/rpc/server.ts:getTransaction", "src/contract/spec.ts:funcResToNative"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["honest_server_cannot_force_failed_to_success_value", "malicious_server_gains_no_added_power_over_status_field"]
rules_out = ["a failed/void getTransaction payload being mis-decoded into a believed-successful materially-wrong SentTransaction.result value reachable from an honest server: V3 failed tx has null sorobanMeta so no returnValue is set, and V4 failed tx has null returnValue which becomes undefined and crashes parseResultXdr in funcResToNative rather than returning a parsed value"]
does_not_rule_out = ["the Low-severity status-blind returnValue-in discriminator plus ?? undefined property creation surfacing failed V4 txns as a cryptic TypeError instead of the documented SendFailed error", "a void-returning success crashing if core omits V4 returnValue", "contract-binding funcResToNative returning a wrong native value for an unexpected non-undefined ScVal type on a separate spec-decoding route"]
assumptions = ["no additional assumptions beyond cited source evidence", "stellar-core emits V4 SorobanTransactionMetaV2.returnValue as null (omitted) on failed Soroban transactions, consistent with the field being declared optional in curr.d.ts"]
mechanism_brief = "SentTransaction.result discriminates success on returnValue property presence not status, and parseTransactionInfo sets returnValue for any V3/V4 meta regardless of status; but XDR types bound the failure case so an honest failed tx yields no returnValue (V3) or undefined (V4 -> crash), never a parsed success value, and a malicious server has no added power over the status field"
why_failed_brief = "true decoding inconsistency exists but degrades to a Low crash/cryptic-error on honest failed V4 responses and gives an in-scope malicious server no added power, so it does not reach the Medium integrity floor"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "type_bound"
guarantee = "V3 SorobanTransactionMeta.returnValue is non-optional and failed V3 txns carry null sorobanMeta, so no returnValue property is created on failure; failed V4 txns carry null returnValue which becomes undefined and crashes parseResultXdr rather than yielding a parsed success value"

[[blockers]]
kind = "no_added_attacker_power"
guarantee = "the status-blind discriminator gives an in-scope malicious RPC server no capability beyond sending status=SUCCESS with the same forged returnValue, mirroring prior record js-sdk-47e96488c443cb7f894f39b4 (defense_provides_no_value_against_in_scope_attacker)"
```
