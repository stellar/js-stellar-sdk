# F955: Path blocked: server-forged restorePreamble omission on prepareTransaction path

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/955-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`prepareTransaction -> assembleTransaction -> cloneFrom.build`

## Blocker

`assembleTransaction` never consumes `restorePreamble`: it reads only
`success.transactionData` (the simulation sorobanData) and
`success.result.auth` from the parsed simulation (transaction.ts:63-117). The
prepared transaction it builds via `cloneFrom(...).build()` is therefore
identical whether the server includes or omits `restorePreamble`, so omission
has zero material effect on this rpc path. `restorePreamble` is consumed only in
the contract layer (`AssembledTransaction.restoreFootprint`), and even there the
auto-restore branch is gated by `Api.isSimulationRestore(this.simulation)` plus
an opt-in `restore` flag (assembled_transaction.ts:659-664); omission makes that
guard false and merely skips auto-restore. In both cases the consequence of a
missing restore is a fail-closed on-chain invocation failure (expired state not
restored), which the dispatch seed itself classifies as Low griefing — below the
Medium minimum severity. No silent wrong-semantics success arises from omission.

## Evidence

- `src/rpc/transaction.ts:44-121` - `assembleTransaction` uses only `success.transactionData.build()` and `success.result.auth`; no reference to `restorePreamble`.
- `src/rpc/server.ts:1133-1139` - `prepareTransaction` calls `assembleTransaction(tx, simResponse).build()` and discards the rest of the simulation response, so restorePreamble never reaches the caller's prepared tx.
- `src/rpc/parsers.ts:211-224` - on omission/empty `transactionData` the parser returns `success` with no `restorePreamble` field; downstream restore detection becomes false.
- `src/contract/assembled_transaction.ts:659-664,1118-1144` - the only `restorePreamble` consumer is `restoreFootprint`, gated by `isSimulationRestore` and an opt-in `restore` flag; omission skips the branch (fail-closed), and a forged restore tx would be separately signed via `signTransaction`.

## Negative Scope

- Rules out: server-forged `restorePreamble` omission on the prepareTransaction -> assembleTransaction -> cloneFrom.build path causing a Medium+ effect; the field is not consumed on this path and the worst outcome is fail-closed Low griefing.
- Does not rule out: server-forged `restorePreamble` *injection/forging* consumed by the contract-layer `restoreFootprint` (different subsystem `src/contract`); and the already-known VIABLE footprint/transactionData injection on this same path (route js-sdk-3504706c3cfcfc3ec6179739).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-24ba35d5ec019db3e6b35fce"
weakness = "xdr_decode"
record_kind = "residual_escalation"
path = ["prepareTransaction", "assembleTransaction", "cloneFrom.build"]
sink = "cloneFrom.build"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/rpc/server.ts:prepareTransaction", "src/contract/assembled_transaction.ts:restoreFootprint"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["restorePreamble_not_consumed_in_assembleTransaction", "restore_omission_fail_closed_low_griefing"]
rules_out = ["server-forged restorePreamble omission on prepareTransaction->assembleTransaction->cloneFrom.build causing a Medium+ effect: assembleTransaction ignores restorePreamble entirely, so the built tx is identical with or without it, and the only downstream consumer (contract restoreFootprint) is gated by isSimulationRestore + opt-in restore and fails closed on omission"]
does_not_rule_out = ["server-forged restorePreamble injection/forging consumed by contract-layer restoreFootprint (src/contract)", "already-VIABLE footprint/transactionData injection on the same path (route js-sdk-3504706c3cfcfc3ec6179739)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "restorePreamble omission by a malicious RPC server has no effect on the prepareTransaction/assembleTransaction path because assembleTransaction never reads restorePreamble; the worst outcome anywhere (contract auto-restore skipped) is a fail-closed on-chain failure rated Low griefing, below the Medium minimum."
why_failed_brief = "restorePreamble is not on the dispatched path's data flow and omission is fail-closed Low griefing only"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "assembleTransaction reads only success.transactionData and success.result.auth (transaction.ts:63-117); restorePreamble is never referenced, so omission cannot alter the assembled/prepared transaction"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "contract restoreFootprint is gated by Api.isSimulationRestore and an opt-in restore flag (assembled_transaction.ts:659-664); omission makes the guard false and skips auto-restore (fail-closed)"

[[blockers]]
kind = "data_flow_absent"
guarantee = "restorePreamble does not flow into cloneFrom.build on the prepareTransaction path; on-chain failure from a missing restore is fail-closed Low griefing, below Medium minimum severity"
```
