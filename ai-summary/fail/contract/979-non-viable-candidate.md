# F979: Sign-time injection of RPC-supplied sorobanData/resourceFee into signed envelope

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/979-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The mechanism is fully source-confirmed:

- `src/contract/assembled_transaction.ts:657` — `this.simulation = await this.server.simulateTransaction(this.built);` populates simulation state from the remote (untrusted) RPC.
- `src/contract/assembled_transaction.ts:730` — `this.simulationTransactionData = simulation.transactionData.build();` takes the RPC `SorobanTransactionData` (footprint + `resourceFee`) verbatim.
- `src/contract/assembled_transaction.ts:815-821` — at sign time the built transaction is re-cloned with `sorobanData: this.simulationData.transactionData` and rebuilt.
- `src/contract/assembled_transaction.ts:834-835` — `signTransaction(this.built.toXDR(), signOpts)` hands those bytes to the wallet.
- `src/rpc/transaction.ts:96` — `assembleTransaction` likewise applies `sorobanData: success.transactionData.build()` during simulate (line 689).
- `src/contract/types.ts:206-209` — `fee` is documented as the classic inclusion fee only; no resource-fee cap option exists.

So the candidate's factual claim (RPC-supplied footprint + `resourceFee` are injected into the bytes the wallet signs, with no SDK-side cap) is **true**. It fails on viability, not on facts.

## Why It Failed

1. **Working-as-designed; expected behavior misstated.** A Soroban transaction cannot be built without a footprint and resource fee, and these are knowable *only* by simulating against an RPC. Obtaining `sorobanData` from simulation is the documented, intended Soroban SDK design and is identical across every Soroban SDK (Rust/Python/JS); there is no "resource-fee cap" concept in the protocol or any SDK. The hypothesis's "Expected Behavior" — that the SDK should cap/validate the simulation-derived `resourceFee` against an application ceiling — describes a *feature request*, not an established contract the code deviates from. Per the security-review procedure (Step 4a), behavior that matches design intent and is treated as a bug is NOT_VIABLE.

2. **No unsafe default or misleading API contract.** `MethodOptions.fee` (types.ts:206-209) is accurately documented as the classic inclusion fee; it never claims to bound the resource fee. This matches OUT_OF_SCOPE: behavior documented as caller responsibility with no SDK-level unsafe default or misleading API contract.

3. **Impact below the Medium severity floor.** The only attacker is a fully malicious/compromised RPC the user explicitly configured and trusts (MITM requires breaking TLS/HTTPS, which is out of scope). Even then the impact is bounded: (a) Soroban refund semantics refund the refundable resource-fee components, and the non-refundable portion is bounded by actual on-chain consumption, so an over-declared `resourceFee` yields essentially no realized fund loss; (b) a manipulated footprint causes on-chain transaction failure (availability/DoS, inclusion fee only), not integrity divergence or fund movement; (c) the wallet `signTransaction` callback presents the total fee to the user for review before signing. None of these reach the Medium floor for a remote-response trust-confusion finding with material effect.

The candidate also does not represent a distinct signing-sink integrity divergence: prior [4] (js-sdk-0c7fd0f9...) already establishes that on the build route only auth/sorobanData come from RPC while func/args are preserved, and prior [1]/[2]/[3] establish no divergence between signed and submitted bytes. The residual "pre-sign injection" reframing is real as a mechanism but resolves to the intended Soroban assembly behavior, not a bug.

## What This Rules Out

The claim that sign-time injection of simulation-derived `sorobanData`/`resourceFee` is an SDK security defect: it is intended, unavoidable Soroban assembly behavior with no unsafe default or misleading contract, and its impact is bounded below the Medium floor by protocol refund semantics, on-chain footprint enforcement, HTTPS transport, and wallet-side fee review.

## What This Does Not Rule Out

- A *concrete* divergence in which the SDK promised to honor an application-supplied resource-fee or footprint ceiling and then silently overrode it (no such API exists today, but adding and then mis-enforcing one would be in scope).
- Arg/func/auth substitution at sign time (covered by separate routes/priors, not this candidate).
- Any future change that mutates the envelope between `sign()` returning and submission (prior [1] scope).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-587ee082458abf49ec3c04a1"
weakness = "transaction_submission"
record_kind = "single_path"
path = ["simulate", "sign"]
sink = "signTransaction"
sink_role = "transaction_signing"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/assembled_transaction.ts:sign", "src/contract/assembled_transaction.ts:simulationData", "src/rpc/transaction.ts:assembleTransaction"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["sorobanData_from_simulation_is_required_by_design", "resource_fee_overdeclare_refunded_below_severity_floor", "no_sdk_resource_fee_cap_contract_to_violate"]
rules_out = ["sign-time injection of simulation-derived sorobanData/resourceFee being an SDK security defect: it is the intended, unavoidable Soroban assembly path with no unsafe default or misleading fee contract, and impact is bounded below Medium by refund semantics, on-chain footprint enforcement, HTTPS transport, and wallet fee review"]
does_not_rule_out = ["a future SDK that promises an application-supplied resource-fee/footprint ceiling and then silently overrides it", "arg/func/auth substitution at sign time (separate routes)", "post-sign envelope mutation (prior js-sdk-587ee082458abf49ec3c04a1 scope)"]
assumptions = ["footprint and resourceFee are knowable only via simulation against an RPC, matching documented Soroban design", "Soroban protocol refunds the refundable resource-fee components and bounds non-refundable fees by actual consumption", "the wallet signTransaction callback presents the transaction (including total fee) to the user before signing", "RPC transport is HTTPS so MITM tampering requires out-of-scope TLS compromise"]
mechanism_brief = "sign() clones the built tx with sorobanData = this.simulationData.transactionData (verbatim RPC footprint + resourceFee) and hands built.toXDR() to the wallet; the fee option bounds only the classic inclusion fee. The mechanism is source-true but is the intended Soroban assembly behavior, not a deviation from any SDK contract."
why_failed_brief = "working-as-designed Soroban assembly: simulation-derived sorobanData/resourceFee is required and universal across SDKs; no unsafe default or misleading contract; impact bounded below Medium by refund semantics, footprint enforcement, HTTPS, and wallet fee review; expected-behavior (fee cap) is a feature request, not a bug"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "design_invariant"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "footprint and resourceFee are only obtainable from simulation; the SDK applying them is the intended Soroban assembly path, not an unguarded sink"

[[sanitizer_guarantees]]
kind = "protocol_bound"
source = "src/contract/assembled_transaction.ts:sign"
guarantee = "Soroban refunds the refundable resource-fee portion and bounds non-refundable fees by actual consumption, so an over-declared resourceFee yields no material realized fund loss"

[[blockers]]
kind = "out_of_scope"
source = "src/contract/types.ts:206-209"
guarantee = "the fee option is documented as the classic inclusion fee with no resource-fee-cap contract; there is no SDK-level unsafe default or misleading contract to violate"

[[blockers]]
kind = "severity_floor"
source = "src/contract/assembled_transaction.ts:834-835"
guarantee = "only a malicious user-trusted RPC can trigger this (MITM needs out-of-scope TLS break); impact is bounded below the Medium floor by refunds, on-chain footprint enforcement, and wallet-side fee review"
```
