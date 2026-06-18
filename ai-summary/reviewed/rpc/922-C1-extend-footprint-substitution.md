# R922a: Remote RPC simulation substitutes extendFootprintTtl footprint adopted verbatim by assembleTransaction

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/922-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full documented flow in current source:

1. `prepareTransaction` (`src/rpc/server.ts:1133-1139`): simulates the caller's
   transaction, then `return assembleTransaction(tx, simResponse).build()`. The
   assembled tx is returned for the caller to sign — no footprint-vs-intent
   check exists anywhere on this path.
2. `parseSuccessful` (`src/rpc/parsers.ts:172-181`):
   `transactionData: new SorobanDataBuilder(sim.transactionData!)` — the entire
   `SorobanTransactionData` (footprint + resources + fee) is decoded straight
   from the response's base64 `transactionData` field, which is attacker-
   controlled under the objective trust boundary (remote RPC).
3. `assembleTransaction` (`src/rpc/transaction.ts:44-121`): `isSorobanTransaction`
   (lines 11-25) admits `extendFootprintTtl`. Lines 75-83 read `rawSorobanData`
   only to de-double-count the resource **fee**; the raw footprint is never read
   or reconciled. Line 96 sets `sorobanData: success.transactionData.build()`,
   replacing the caller's entire `SorobanTransactionData`. The op-specific
   rebuild branch (lines 100-118) handles **only** `invokeHostFunction`; for
   `extendFootprintTtl` the original op is cloned (`cloneFrom` line 363) but it
   carries no footprint of its own.
4. `TransactionBuilder.cloneFrom` (`src/base/transaction_builder.ts:281-366`):
   reads the raw envelope's `sorobanData` only to subtract the resource fee
   (lines 312-325), then `Object.assign(builderOpts, opts)` (line 359) lets the
   caller-passed `sorobanData` (the simulation object) win unconditionally. The
   raw footprint is discarded.
5. `extendFootprintTtl` (`src/base/operations/extend_footprint_ttl.ts:9-53`):
   the op's only parameter is `extendTo`; "the keys for extension have to be
   provided in the read-only footprint of the transaction" (lines 10-12). The
   footprint *is* the operation payload.

So a malicious/compromised/MITM'd RPC returns a success simulation whose
`transactionData` read-only footprint lists attacker-chosen ledger keys; the SDK
adopts it verbatim and hands the caller a tx that, once signed, extends TTL on
the attacker's entries rather than the caller's intended entries.

## Findings

This is a transaction-integrity break: the signed/submitted transaction targets
a different operation set than the application intended. For `extendFootprintTtl`
the read-only footprint is the *semantic target* (which entries are kept alive),
not a cost knob. The user pays to extend attacker-chosen entries while the
entries they meant to preserve are not extended and may expire/archive.

This is distinct from the already-VIABLE resource-fee inflation effect of the
same line (prior route `js-sdk-37b8abbeef5856e72db630c2`): here the material
effect is wrong-entry targeting, not fee. It is also distinct from prior [1]
(`js-sdk-3504706c3cfcfc3ec6179739`), which only ruled out a *serialization-stage*
break at `toXDR`/`k.toXDR`; the integrity break here is the **upstream
construction** at `assembleTransaction:96`, before serialization. It is distinct
from auth-entry priors [2]/[3], which concern `SorobanAuthorizationEntry`
adoption, not the footprint.

Unlike `invokeHostFunction` — where an over-broad footprint only over-charges
fee because contract logic bounds the actual accesses — for `extendFootprintTtl`
the on-chain effect is fully determined by the footprint, so footprint
substitution genuinely redirects the operation. Maps to the impact category
"Transaction submitted with different operation target than the application
intended" → **High**.

The `assembleTransaction` docstring (transaction.ts:39) frames the applied
simulation data as trusted "resource (fee, footprint)" data and offers no
affordance to verify or reconcile the footprint for extend/restore ops; this is
an unsafe default / misleading contract under the objective's attacker-
controlled-RPC trust model, not a documented caller responsibility.

## PoC Guidance

- **Test file**: append to `test/unit/server/transaction_test.js` (or the
  existing `assembleTransaction` unit test under `test/unit`).
- **Setup**: build a real `extendFootprintTtl` transaction whose raw
  `sorobanData` read-only footprint names a caller-intended ledger key K_user
  (use `SorobanDataBuilder().setReadOnly([K_user])`).
- **Steps**: construct a mocked successful `RawSimulateTransactionResponse`
  whose `transactionData` base64 encodes a `SorobanTransactionData` with a
  *different* read-only footprint K_attacker. Call
  `assembleTransaction(rawTx, mockedSim).build()`.
- **Assertion**: decode the resulting tx's `ext().value()` read-only footprint
  and assert it equals `[K_attacker]` and no longer contains `K_user` —
  demonstrating the caller's intended footprint was silently replaced by the
  remote-supplied one with no warning/reconciliation. Optionally assert the same
  via the full `prepareTransaction` path with a mocked transport.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-3504706c3cfcfc3ec6179739"
weakness = "remote_simulation_footprint_substitution_in_assembleTransaction"
record_kind = "single_path"
path = ["prepareTransaction", "parseSuccessful", "assembleTransaction", "cloneFrom", "build"]
sink = "assembleTransaction"
sink_role = "transaction_construction_sorobandata_adoption"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/base/operations/extend_footprint_ttl.ts:extendFootprintTtl", "src/rpc/server.ts:prepareTransaction", "src/rpc/parsers.ts:parseSuccessful", "src/base/transaction_builder.ts:cloneFrom"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms no footprint reconciliation between raw tx and simulation response: assembleTransaction:75-83 and cloneFrom:312-325 read the raw sorobanData only to de-count the resource fee, and cloneFrom Object.assign lets the simulation sorobanData override the footprint unconditionally", "prior [1] serialization-stage blocker does not cover this upstream construction at assembleTransaction:96", "prior [7] resource-fee VIABLE covers a distinct material effect (fee), not footprint targeting"]
does_not_rule_out = ["resource-fee inflation effect already VIABLE under route js-sdk-37b8abbeef5856e72db630c2", "invokeHostFunction footprint manipulation (over-broad footprint over-charges fee but contract logic bounds actual accesses)", "manual flows that build sorobanData and never call prepareTransaction/assembleTransaction", "restoreFootprint variant of the same mechanism (tracked separately as C2)"]
assumptions = ["objective trust model treats the caller-selected RPC simulation response as attacker-controlled", "caller follows the documented prepareTransaction/simulate+assemble flow and signs the returned tx", "no additional assumptions beyond cited source evidence"]
mechanism_brief = "assembleTransaction:96 unconditionally replaces the raw tx sorobanData with the simulation response's transactionData; for extendFootprintTtl the read-only footprint IS the operation payload, so a malicious RPC substitutes which ledger entries get TTL-extended and the user signs a different-than-intended operation."
why_failed_brief = "viable; not failed"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "isSorobanTransaction (transaction.ts:11) and isSimulationSuccess (transaction.ts:64) are the only gates; neither inspects or reconciles the footprint, and the success status is read from the same attacker-controlled response"

[[blockers]]
kind = "not_found"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "no source-proven footprint reconciliation or caller-intent check exists between the raw tx footprint and the simulation footprint before signing on the prepareTransaction/assembleTransaction path"
```
