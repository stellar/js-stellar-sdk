# F1011: requestAirdrop returned-Account sequence derived from remote funding meta

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/1011-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The hypothesized path is source-accurate:

- `requestAirdrop` (`src/rpc/server.ts:1239-1281`) resolves
  `friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl`
  (`server.ts:1244`); `getNetwork` is a plain `jsonrpc.postObject` call
  (`server.ts:937-943`), so under the `remote_rpc_server` trust model the POST
  destination is remote-chosen when the caller omits `friendbotUrl`.
- The POST response is decoded either from `response.data.result_meta_xdr`
  via `xdr.TransactionMeta.fromXDR` (`server.ts:1262-1265`) or from
  `getTransaction(response.data.hash)` meta (`server.ts:1254-1260`); both
  inputs are attacker-controlled along this path.
- `findCreatedAccountSequenceInTransactionMeta(meta)` (`server.ts:101-135`)
  returns the first `ledgerEntryCreated` account entry's `seqNum().toString()`
  (`server.ts:118-129`) with no comparison to the requested account, ledger,
  or any trusted value.
- The result is returned as `new Account(account, sequence)`
  (`server.ts:1269`).

The decode does propagate an unverified, remote-chosen sequence into the
returned `Account`. The trace is confirmed.

## Why It Failed

Two independent, source-backed reasons place this below the Medium scope floor
and into working-as-designed:

1. **No incremental trust exposure beyond the SDK's inherent baseline.** Every
   account sequence the SDK surfaces comes from the remote RPC server. The
   primary accessor `getAccount` (`server.ts:203-206`) returns
   `new Account(address, entry.seqNum().toString())` where `entry` is the
   `getLedgerEntry` response from the *same* server. There is no trusted local
   source of an account's current sequence to validate against — the network is
   the authoritative source by protocol. `requestAirdrop` returning a sequence
   from the funding response is functionally identical to `getAccount`
   returning a sequence from a ledger query: in the malicious-RPC model both
   are remote-controlled. The candidate's "no integrity check" gap describes an
   inherent and necessary design property, not a missing guard specific to this
   path, so it adds no new weakness over the baseline.

2. **Mandatory network sequence validation caps the consequence at a rejected
   transaction.** Stellar requires a transaction's source-account sequence to
   equal the account's current sequence + 1 at apply time. A forged starting
   sequence therefore yields `txBadSeq` rejection at submission, not an
   accepted-but-wrong transaction. The signed bytes never apply, so there is no
   fund movement, no replay benefit, and no unsafe semantics that survive
   network validation. The bounded effect is availability/correctness
   (funding-helper output unusable) = Low, which is out of scope
   (minimum severity Medium; `requestAirdrop`'s consequence does not reach
   "unsafe signing/submission or fund movement").

This is the bright-line distinction from the VIABLE `prepareTransaction`
auth-entry finding (prior `route_id js-sdk-014c7e2b1c426cfa3f7f5c02`): injected
authorization entries are *executed* by the network and survive validation,
whereas a forged sequence is *rejected* by mandatory protocol validation.

Per `reviewer-security` rejection criteria, the actual behavior matches the
correct expected behavior (surface the network-reported sequence so the caller
can build the next transaction; submission-time validation is the integrity
control), so this is working-as-designed.

## What This Rules Out

The remote funding-response decode in `requestAirdrop`
(`findCreatedAccountSequenceInTransactionMeta` →
`new Account(account, sequence)`) propagating an attacker-chosen *sequence
number* into unsafe signing/submission or fund movement: the network's
mandatory source-sequence validation rejects the resulting transaction
(`txBadSeq`), and the same remote-trust property already governs every
`getAccount`-derived sequence, so no incremental boundary is crossed.

## What This Does Not Rule Out

- Remote-controlled `friendbotUrl` steering the POST to an arbitrary attacker
  host independent of scheme (destination-integrity beyond the prior
  HTTPS-only finding, `route_id js-sdk-c7ee0ae8709778ef50975329`).
- `fundAddress` returned `getTransaction` response-decode integrity
  (`server.ts:1340-1347`), a different return type and path.
- Remote auth-entry / simulation-result trust confusion on
  `prepareTransaction`/`assembleTransaction`, where remote data survives
  network validation (already VIABLE elsewhere).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-0e82075ff69bc834638421e8"
weakness = "remote funding response decoded into attacker-controlled Account sequence used for later transaction signing"
record_kind = "single_path"
path = ["requestAirdrop", "this.httpClient.post", "findCreatedAccountSequenceInTransactionMeta"]
sink = "findCreatedAccountSequenceInTransactionMeta"
sink_role = "response_decode"
impact_class = "remote_response_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/rpc/server.ts:requestAirdrop", "src/rpc/server.ts:findCreatedAccountSequenceInTransactionMeta", "src/rpc/server.ts:getNetwork", "src/rpc/server.ts:getAccount"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["remote_sequence_neutralized_by_network_seq_validation", "no_incremental_trust_exposure_beyond_getaccount_baseline"]
rules_out = ["forged remote funding-meta sequence in requestAirdrop reaching unsafe signing/submission or fund movement: a wrong source-account sequence is rejected by the network's mandatory seq+1 validation (txBadSeq), so the signed transaction never applies", "this decode introducing a new trust exposure over the SDK baseline: getAccount (server.ts:203-206) already returns a remote-derived sequence from the same server and no trusted local source exists to validate against"]
does_not_rule_out = ["remote-controlled friendbotUrl steering the POST to an arbitrary attacker host independent of scheme (destination integrity beyond the prior HTTPS-only finding)", "fundAddress returned getTransaction response-decode integrity at server.ts:1340-1347", "prepareTransaction/assembleTransaction remote auth-entry trust confusion where remote data survives network validation"]
assumptions = ["Stellar protocol requires a transaction's source-account sequence to equal the account's current sequence + 1 at apply time, so a forged starting sequence causes submission-time rejection rather than acceptance (protocol behavior, not verified in this repo's source)", "the returned Account's documented use is to build subsequent caller transactions, all of which inherit the rejected starting sequence"]
mechanism_brief = "requestAirdrop derives friendbotUrl from remote getNetwork, POSTs to it, and decodes the funding response meta XDR; findCreatedAccountSequenceInTransactionMeta extracts the first created-account seqNum with no cross-check and returns it inside new Account(account, sequence)."
why_failed_brief = "working-as-designed: the SDK necessarily reports the network's account sequence (getAccount does the same from the same server), and a forged sequence is rejected by mandatory protocol seq+1 validation, capping the effect at a rejected transaction (Low, below the Medium floor) with no unsafe signing/submission or fund movement."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "external_invariant"
source = "src/rpc/server.ts:requestAirdrop"
guarantee = "network-level source-account sequence validation (seq == current+1) rejects any transaction built from a forged returned-Account sequence, so the forged value cannot produce an accepted/applied transaction"

[[sanitizer_guarantees]]
kind = "design_baseline"
source = "src/rpc/server.ts:getAccount"
guarantee = "getAccount returns new Account(address, entry.seqNum()) from the same remote RPC server, establishing that a remote-derived sequence is the SDK's intended baseline with no trusted local alternative to validate against"

[[blockers]]
kind = "out_of_scope_severity"
source = "src/rpc/server.ts:findCreatedAccountSequenceInTransactionMeta"
guarantee = "bounded consequence is a rejected/unusable transaction (availability/correctness = Low), below the Medium minimum severity for this objective"
```
