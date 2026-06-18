# F987: Simulation transactionData applied verbatim into signed prepareTransaction envelope

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/987-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The hypothesized forward handoff is real and fully source-confirmed:

- `Server.prepareTransaction` (`src/rpc/server.ts:1133-1139`) calls
  `simulateTransaction(tx)` against the caller-selected RPC server, checks only
  `Api.isSimulationError` (presence of `"error"`), then returns
  `assembleTransaction(tx, simResponse).build()` to the caller for signing and
  submission.
- `assembleTransaction` (`src/rpc/transaction.ts:44-121`) gates on
  `parseRawSimulation` + `Api.isSimulationSuccess`. `isSimulationSuccess` is
  literally `"transactionData" in sim` (`src/rpc/api.ts:479-483`) — any payload
  carrying a `transactionData` field passes.
- `parseSuccessful` (`src/rpc/parsers.ts:172-225`, line 181) wraps
  `sim.transactionData!` in a `SorobanDataBuilder` with no shape/limit checks;
  `parseRawSimulation` (`:236-264`) performs only raw-vs-parsed detection.
- `transaction.ts:96` sets `sorobanData: success.transactionData.build()` —
  the server-decoded `SorobanTransactionData` (footprint + `resourceFee`) is
  placed on the cloned builder unchanged.
- `TransactionBuilder.cloneFrom` (`src/base/transaction_builder.ts:281-366`,
  lines 312-325) folds `sorobanData.resourceFee()` back into the total fee on
  build, so the final signed fee = caller inclusion fee + server-supplied
  resource fee.

So remote-derived bytes genuinely do become part of the signed envelope, which
distinguishes this path from the prior NOT_VIABLE leaf-return routes
(`js-sdk-7abe9b28…`, `js-sdk-5f3e8285…`). The candidate is not a duplicate.

## Why It Failed

The candidate fails on the working-as-designed test and the objective's Medium
severity floor, not on novelty.

1. **No implementable SDK-side guard exists — this is the intended Soroban
   design.** The Soroban footprint (read/write `LedgerKey` set) and the
   `resourceFee` are, by protocol definition, *computed by simulation*. The
   caller has no independent footprint or resource-fee "intent" for the SDK to
   validate against; deriving them is the entire purpose of
   `simulateTransaction` + `assembleTransaction`. The hypothesis's "Expected
   Behavior" ("validate the footprint against the caller's intent") describes a
   guard the SDK cannot implement, because no caller-side ground truth exists.
   A finding that "the SDK trusts simulation output for footprint/fee" reduces
   to "the SDK uses simulation," which is the documented contract of the API
   (`transaction.ts:27-43`, `server.ts:1075-1098`). This is intended behavior,
   not a missing check.

2. **Realistic security impact is bounded to Low.** Decomposing what the
   malicious-but-caller-selected server can actually influence in the signed
   envelope:
   - `resourceFee` is a refundable max bid: the network charges the actual
     computed resource cost and refunds the remainder, so an inflated value
     causes no material overpayment (the candidate's own anti-evidence concedes
     this). The inclusion-fee portion is caller-controlled (`classicFeeNum`
     from `raw.fee`, `transaction.ts:68-94`).
   - A forged/garbage footprint or a dropped `restorePreamble`
     (`parsers.ts:211-224`, ignored by `assembleTransaction`) only causes the
     transaction to **fail on-chain**, wasting the inclusion fee — griefing,
     not loss or wrong semantics.
   - The security-material envelope fields are all caller-controlled and
     unchanged: network passphrase (`transaction.ts:97`), source/memo/bounds
     (via `cloneFrom`), and the invoked `func`/args (`transaction.ts:109`).
     Auth is protocol-defended: `success.result!.auth` is injected only when
     the caller set none (`transaction.ts:115`), and the Soroban host consumes
     only auth entries matching an actual `require_auth` in the fixed,
     caller-chosen invocation, so no authority beyond the caller's own call is
     added.

3. **The marginal capability is subsumed by the trust decision.** A server the
   caller routes all simulation through can already deny service or return
   errors/wrong data arbitrarily; "produce a tx that fails on-chain" adds no
   integrity loss above what choosing that server already grants. Per the
   objective this is Low ("griefing", "issues requiring an already-compromised
   caller environment", "local-only inconvenience").

Because the only material effect is bounded to Low and Low/informational
findings are explicitly out of scope (minimum severity Medium), the candidate
does not meet the bar.

## What This Rules Out

The forward `simulateTransaction` → `assembleTransaction` → signed-envelope
handoff as a Medium+ parse-integrity / remote-trust-confusion finding: the
server-controlled `transactionData` it injects (footprint + `resourceFee`) is
either refund-bounded (`resourceFee` max bid) or fail-closed on-chain
(footprint/restore), and cannot alter the transaction's security-material
semantics (network, source, memo, func, args, auth-beyond-required), which
remain caller-controlled.

## What This Does Not Rule Out

- A concretely demonstrated path where a server-supplied footprint or resource
  value causes **material fund movement or wrong-semantics submission** that is
  *not* refund-bounded and *not* mere on-chain failure (would reopen at Medium+
  if such a mechanism is shown in source/protocol).
- Sibling decode sites outside this exact assembly path (e.g. `parseRawLedger`
  / `parseRawLatestLedger` field-order behavior) remain separately assessed.
- Fee-bump (`innerTransaction`) handling beyond the recursion at
  `transaction.ts:50-53` is not exercised here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-24ba35d5ec019db3e6b35fce"
weakness = "Untrusted XDR deserialization / parse integrity"
record_kind = "single_path"
path = ["prepareTransaction", "assembleTransaction", "cloneFrom.build"]
sink = "success.transactionData.build"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/rpc/parsers.ts:parseSuccessful", "src/rpc/parsers.ts:parseRawSimulation", "src/base/transaction_builder.ts:cloneFrom"]
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
negative_claim.rules_out_codes = ["intended_simulation_design_no_implementable_guard", "impact_bounded_below_medium_griefing_only", "refundable_resource_fee_max_bid"]
rules_out = ["server-supplied simulation transactionData (footprint + resourceFee) injected into the signed prepareTransaction envelope as a Medium+ finding: resourceFee is a refundable max bid (network recomputes/refunds actual cost), footprint/restore manipulation only causes fail-closed on-chain failure, and applying simulation-computed footprint/fee is the intended Soroban design with no caller-side ground truth to validate against"]
does_not_rule_out = ["a demonstrated non-refund-bounded fund-movement or wrong-semantics path from server-supplied simulation data", "server-forged restorePreamble omission causing on-chain failure (Low griefing)", "footprint manipulation causing tx failure / griefing (Low)"]
assumptions = ["Soroban resourceFee in SorobanTransactionData is a max bid with on-chain refund of the unused portion", "the invoked func/args, source, memo, network passphrase, and caller-set auth are preserved from the caller's raw tx (transaction.ts:97-115)", "the caller selects and thereby trusts the simulation RPC server, which can already deny service or return errors at will"]
mechanism_brief = "assembleTransaction applies server-controlled simulation transactionData (resourceFee + footprint) verbatim as sorobanData on a transaction the caller signs/submits, gated only by 'transactionData' in sim"
why_failed_brief = "intended Soroban prepare design (no implementable SDK guard; footprint/fee have no caller-side ground truth) and impact bounded to Low: resourceFee is a refundable max bid, footprint/restore manipulation only fails the tx on-chain (griefing), and security-material envelope fields stay caller-controlled; below Medium floor"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/api.ts:isSimulationSuccess"
guarantee = "isSimulationSuccess only checks presence of transactionData (api.ts:479-483); no value validation or fee/footprint bound is applied before the data is placed on the signed envelope"

[[sanitizer_guarantees]]
kind = "protocol_invariant"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "invoked func/args (transaction.ts:109), source, memo, network passphrase (transaction.ts:97) preserved from caller tx; injected auth (transaction.ts:115) only when caller set none and is host-constrained to entries matching require_auth in the fixed invocation"

[[blockers]]
kind = "partial"
source = "src/base/transaction_builder.ts:cloneFrom"
guarantee = "network recomputes the actual resource fee (declared resourceFee is a refundable max bid) and host ignores unmatched auth entries, bounding direct fund loss; footprint/restore manipulation only causes fail-closed on-chain failure (Low griefing)"

[[blockers]]
kind = "design_intent"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "footprint and resourceFee are simulation-computed by protocol design; the SDK has no caller-side ground truth to validate them against, so applying them verbatim is the intended API contract, not a missing guard"
```
