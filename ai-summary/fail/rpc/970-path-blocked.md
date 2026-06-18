# F970: Path blocked: assembleTransaction folds simulation resourceFee/footprint into signed tx (documented design)

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/970-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`_sendTransaction -> toXDR` (residual material site: `assembleTransaction` -> `TransactionBuilder.cloneFrom` -> `build`)

## Residual Question Resolved (concrete yes/no)

**YES** — `assembleTransaction` applies the simulation `transactionData`
(sorobanData footprint + resourceFee) verbatim, and it does so **regardless of
the auth path**. The fee-folding and `sorobanData: success.transactionData.build()`
assignment (transaction.ts:85-98) execute *before* the `invokeHostFunction`
auth branch (transaction.ts:100-118); the "advanced usage" branch only chooses
between `existingAuth` and `success.result.auth` for auth entries and never
gates the resourceFee/footprint application. So on the advanced-auth path the
simulation-chosen resourceFee/footprint is still folded into the fee of the tx
the caller subsequently signs.

## Blocker

The confirmed behavior is the explicitly documented, intended contract of
`prepareTransaction`/`assembleTransaction`, not a defect. `prepareTransaction`
docs (server.ts:1085-1094) state "Any provided footprint will be overwritten...
Other fields (footprint, etc.) will be filled as normal" and "The transaction
fee will also automatically be padded with the contract's minimum resource fees
discovered from the simulation." Simulation can only come from the
caller-selected RPC server, and computing the resource fee/footprint is the
entire purpose of the call; there is no safe alternative design and no unsafe
SDK default. cloneFrom (transaction_builder.ts:309-319) faithfully excludes the
existing resourceFee before deriving the per-op base fee and re-adds it on
build, with a positive-inclusion-fee guard (transaction.ts:80; builder:320).
This is documented caller responsibility under an inherent trust boundary,
placing it out of scope per the objective's exclusion of documented behavior
with no unsafe default. Material fee impact is also bounded (declared maximum,
partially refundable resource fee) and the prepared fee is inspectable pre-sign.

## Evidence

- `src/rpc/transaction.ts:85-98` - fee folding + `sorobanData: success.transactionData.build()` run before any auth branch.
- `src/rpc/transaction.ts:100-118` - auth "advanced usage" branch only selects auth entries; never gates resource/fee application.
- `src/rpc/server.ts:1085-1094` - docs explicitly document footprint overwrite and fee padding from simulation as intended behavior.
- `src/base/transaction_builder.ts:309-320` - cloneFrom excludes existing resourceFee then re-adds simulation resourceFee into total fee on build, with positive-inclusion guard.

## Negative Scope

- Rules out: simulation-chosen resourceFee/footprint folded verbatim into the caller-signed tx fee via assembleTransaction (incl. the advanced-auth path) being an in-scope finding — it is the explicitly documented, inherent purpose of prepareTransaction/assembleTransaction under the caller-selected RPC trust model, with no unsafe default.
- Does not rule out: a distinct numeric-precision/overflow defect at `transaction_builder.ts:319` (`Number(sorobanData.resourceFee().toBigInt())` converting an attacker-supplied int64 resourceFee through JS `Number`, losing precision above 2^53) producing a materially wrong total fee — a different mechanism not traced here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-f1b97e20c571fe578a444b9e"
weakness = "transaction_serialization"
record_kind = "residual_escalation"
path = ["_sendTransaction", "toXDR"]
sink = "toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/base/transaction_builder.ts:cloneFrom", "src/rpc/server.ts:prepareTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["documented_simulation_fee_footprint_application", "advanced_auth_branch_only_gates_auth_entries"]
rules_out = ["simulation-chosen resourceFee/footprint folded into the caller-signed tx fee via assembleTransaction (including the advanced-auth path) as an in-scope finding: it is the documented, inherent purpose of prepareTransaction/assembleTransaction under the caller-selected RPC trust model with no unsafe SDK default"]
does_not_rule_out = ["JS Number precision loss/overflow at transaction_builder.ts:319 converting an attacker int64 resourceFee, yielding a materially wrong total fee (distinct mechanism, not traced)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "assembleTransaction applies simulation transactionData (sorobanData footprint + resourceFee) verbatim before the auth branch (transaction.ts:85-98) so the advanced-auth path still folds the simulation resourceFee/footprint into the fee the caller signs (cloneFrom re-adds resourceFee on build)"
why_failed_brief = "confirmed-true behavior is the explicitly documented, inherent contract of prepareTransaction/assembleTransaction (server.ts:1085-1094) under the caller-selected RPC trust model; documented caller responsibility with no unsafe default and bounded/refundable fee impact"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "documented_contract"
guarantee = "prepareTransaction docs (server.ts:1085-1094) document footprint overwrite and fee padding from simulation as intended; cloneFrom (transaction_builder.ts:309-320) faithfully folds resourceFee with a positive-inclusion-fee guard"

[[blockers]]
kind = "out_of_scope_policy"
guarantee = "documented caller responsibility under an inherent simulation trust boundary with no unsafe SDK default; bounded/refundable fee impact and inspectable prepared fee"
```
