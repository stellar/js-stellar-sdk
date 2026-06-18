# F937: Path blocked: residual "auto-sign prepared transaction" lead

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/937-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`parseSuccessful -> assembleTransaction -> prepareTransaction`

## Blocker

The escalated residual question — "a future API change that auto-signs prepared
transactions removing the caller-visible-before-signing mitigation" — resolves
to NO in current source. `prepareTransaction(tx)` (server.ts:1133-1140) takes
only a transaction, never a keypair/signer, and returns
`assembleTransaction(tx, simResponse).build()`, an unsigned `Transaction`.
`assembleTransaction` (transaction.ts:44-120) returns a `TransactionBuilder`
whose `.build()` produces an unsigned transaction; `parseSuccessful`
(parsers.ts:172-225) only decodes simulation fields. No `.sign()` exists on the
path; the only signing references are JSDoc examples (server.ts:1124, 1179)
where the *caller* signs after the prepared tx is returned. The
caller-visible-before-signing mitigation is structurally intact, and a
hypothetical future API change has no current-source basis (out of SOURCE_SCOPE).

## Evidence

- `src/rpc/server.ts:1133-1140` - `prepareTransaction(tx)` has no signer param and returns an unsigned built transaction.
- `src/rpc/transaction.ts:44-120` - `assembleTransaction` returns a `TransactionBuilder`; `.build()` is unsigned, no key material accessed.
- `src/rpc/parsers.ts:172-225` - `parseSuccessful` only decodes simulation response fields; no signing side effect.
- `src/rpc/server.ts:1124,1179` - sole `.sign()` references are JSDoc examples showing the caller signing post-return, confirming the mitigation.

## Negative Scope

- Rules out: any current-source auto-signing of prepared/assembled transactions on the parseSuccessful->assembleTransaction->prepareTransaction path that would remove the caller-visible-before-signing review window.
- Does not rule out: the separately-tracked VIABLE finding on route js-sdk-3504706c3cfcfc3ec6179739 (missing read-write footprint/fee reconciliation between raw tx and simulation in assembleTransaction/cloneFrom) — a distinct mechanism still requiring caller signing, not re-reported here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-d8fe689893049ffbbe84f5cb"
weakness = "transaction_assembly"
record_kind = "residual_escalation"
path = ["parseSuccessful", "assembleTransaction", "prepareTransaction"]
sink = "prepareTransaction"
sink_role = "transaction_assembly"
impact_class = "parse_integrity"
route_family = "transaction_assembly"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/server.ts:prepareTransaction", "src/rpc/transaction.ts:assembleTransaction", "src/rpc/parsers.ts:parseSuccessful"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["prepareTransaction_returns_unsigned_no_signer_param"]
rules_out = ["current-source auto-signing of prepared/assembled transactions on parseSuccessful->assembleTransaction->prepareTransaction that removes the caller review-before-sign window"]
does_not_rule_out = ["VIABLE route js-sdk-3504706c3cfcfc3ec6179739 missing footprint/fee reconciliation in assembleTransaction/cloneFrom"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "residual lead asks whether prepared transactions are auto-signed; current source returns an unsigned transaction and exposes no signer parameter on the path, so the caller-visible-before-signing mitigation holds and the lead is a hypothetical future change with no source basis"
why_failed_brief = "prepareTransaction takes only a transaction, returns assembleTransaction(...).build() unsigned, has no key material; caller signs after return per JSDoc; future API change is out of source scope"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "prepareTransaction/assembleTransaction return an unsigned transaction and never receive a keypair or signer, so the prepared transaction is always returned to the caller for inspection before any signing"

[[blockers]]
kind = "missing_capability"
guarantee = "no signing operation exists on the parseSuccessful->assembleTransaction->prepareTransaction path; the only .sign() references are JSDoc caller examples (server.ts:1124,1179)"
```
