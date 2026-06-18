# F960: Path blocked: requestAirdrop forged funding-meta sequence (residual escalation D960)

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/960-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`requestAirdrop -> this.httpClient.post -> findCreatedAccountSequenceInTransactionMeta`

## Blocker

The residual escalation asked to confirm/refute "prepareTransaction/assembleTransaction
remote auth-entry trust confusion." Source tracing the *actual* seed path
refutes any such confusion on this route: `requestAirdrop` returns a plain
`Account(account, sequence)` and is never wired into `assembleTransaction`
(`transaction.ts:44`, fed only from a `simulation` argument) or
`prepareTransaction` — no auth entries flow from friendbot meta. The only
attacker-influenced output is the funding-meta `seqNum` decoded verbatim from
the remote `result_meta_xdr` (server.ts:1262, server.ts:118-129). A forged or
mismatched sequence merely produces a wrong starting `Account.sequence`; any
transaction the caller then builds is signed over `seq+1` and rejected by the
network's mandatory sequence-number validation (`txBadSeq`). The bounded
consequence is a rejected/unusable transaction (availability/correctness), with
no unsafe signing, no fund movement, and no incremental remote-trust exposure
beyond the existing `getAccount` baseline — below the Medium severity floor.

## Evidence

- `src/rpc/server.ts:1250-1269` - friendbot POST result (`result_meta_xdr`, or `getTransaction` fallback) is decoded and `findCreatedAccountSequenceInTransactionMeta` feeds `new Account(account, sequence)`; output is an Account, not a signable tx with auth entries.
- `src/rpc/server.ts:118-129` - sink extracts the first ledgerEntryCreated account `seqNum().toString()`; remote-controlled value with no SDK-side validation, but it only seeds a sequence number.
- `src/rpc/transaction.ts:44-52` and `src/rpc/server.ts:1139` - `assembleTransaction(tx, simulation)` takes a simulation result, never the airdrop Account; the dispatch seed's auth-entry/assemble linkage does not exist on this path.

## Negative Scope

- Rules out: forged remote friendbot funding-meta sequence (and any "auth-entry trust confusion via assembleTransaction") on the `requestAirdrop -> findCreatedAccountSequenceInTransactionMeta` path reaching unsafe signing/submission or fund movement — a wrong source-account sequence is rejected by mandatory network seq+1 validation (txBadSeq), and no auth entries flow on this route.
- Does not rule out: the separate `parseSuccessful -> assembleTransaction -> prepareTransaction` simulation-trust route (route_id js-sdk-d8fe689893049ffbbe84f5cb), nor the missing scheme/allowHttp guard on the friendbot URL (route_id js-sdk-c7ee0ae8709778ef50975329, already VIABLE); also does not rule out bounded resource cost of decoding an oversized attacker `result_meta_xdr`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-0e82075ff69bc834638421e8"
weakness = "response_decode"
record_kind = "residual_escalation"
path = ["requestAirdrop", "this.httpClient.post", "findCreatedAccountSequenceInTransactionMeta"]
sink = "findCreatedAccountSequenceInTransactionMeta"
sink_role = "response_decode"
impact_class = "remote_response_integrity"
route_family = "response_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/server.ts:requestAirdrop", "src/rpc/server.ts:findCreatedAccountSequenceInTransactionMeta", "src/rpc/transaction.ts:assembleTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["remote_sequence_neutralized_by_network_seq_validation", "no_authentry_flow_from_requestairdrop_to_assembletransaction", "no_incremental_trust_exposure_beyond_getaccount_baseline"]
rules_out = ["forged remote friendbot funding-meta sequence on requestAirdrop->findCreatedAccountSequenceInTransactionMeta reaching unsafe signing/submission or fund movement; rejected by network seq+1 (txBadSeq)", "auth-entry trust confusion on this path: requestAirdrop output never reaches assembleTransaction/prepareTransaction"]
does_not_rule_out = ["parseSuccessful->assembleTransaction->prepareTransaction simulation-trust route (js-sdk-d8fe689893049ffbbe84f5cb)", "missing scheme/allowHttp guard on friendbot URL (js-sdk-c7ee0ae8709778ef50975329)", "bounded resource cost of decoding oversized result_meta_xdr"]
assumptions = ["network enforces mandatory sequence-number (seq+1) validation, rejecting any wrong source-account sequence with txBadSeq", "no additional assumptions beyond cited source evidence"]
mechanism_brief = "requestAirdrop decodes remote result_meta_xdr and returns Account with the funding-meta seqNum; the value is attacker-influenced but only seeds a sequence number neutralized by network seq+1 validation, and never flows into assembleTransaction/prepareTransaction auth-entry handling"
why_failed_brief = "forged sequence only causes txBadSeq rejection (Low availability/correctness); no auth-entry path from requestAirdrop to assembleTransaction exists, so the residual auth-entry confusion is refuted by source"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "external_invariant"
guarantee = "network mandatory seq+1 validation rejects any wrong source-account sequence (txBadSeq) before fund movement, capping impact at rejected/unusable transaction"

[[sanitizer_guarantees]]
kind = "no_flow"
guarantee = "requestAirdrop returns an Account; assembleTransaction(tx, simulation) is fed only by simulation results, so no friendbot auth entry reaches transaction assembly"

[[blockers]]
kind = "severity_threshold"
guarantee = "bounded consequence is a rejected/unusable transaction (availability/correctness = Low), below the Medium minimum severity for this objective"
```
