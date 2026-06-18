# R993: prepareTransaction adopts untrusted remote simulation auth entries into the caller-signed invokeHostFunction op

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/993-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's source claims were all confirmed in current source:

- `src/rpc/server.ts:1133-1139` — `prepareTransaction` awaits `simulateTransaction(tx)`
  (which posts the caller tx to the caller-selected RPC via
  `_simulateTransaction`, server.ts:1041-1051), then returns
  `assembleTransaction(tx, simResponse).build()` directly for signing. There is
  no caller-intent reconciliation of the auth field anywhere on this path.
- `src/rpc/transaction.ts:100-118` — for an `invokeHostFunction` op the builder
  drops the original op (`clearOperations`) and rebuilds it. Line 115:
  `auth: existingAuth.length > 0 ? existingAuth : success.result!.auth`. When
  the caller op has no pre-set auth (`existingAuth.length === 0`, the documented
  normal first-prepare flow), the operation the caller signs is populated with
  `success.result!.auth`, i.e. the simulation-supplied entries.
- `src/rpc/parsers.ts:185-194` — `parseSuccessful` builds `result.auth` by
  decoding `row.auth` straight from the remote response:
  `xdr.SorobanAuthorizationEntry.fromXDR(entry, "base64")`, with no validation
  of credential type or invocation contents.
- `func` (the host function being invoked) is taken from the caller's original
  op (transaction.ts:109), so only the `auth` field, not the invocation, is
  attacker-substitutable here.

The distinct known footprint finding on this same path (route
js-sdk-3504706c, the `sorobanData` field) is not re-reported; this is the
operation `auth` field, a separate sink with a distinct mechanism.

## Findings

Under the documented subsystem threat model (a caller-selected RPC endpoint is
untrusted or MITM-capable; remote JSON/XDR is attacker-controlled), an attacker
controlling the RPC response can substitute arbitrary
`SorobanAuthorizationEntry` values into the operation that the application then
signs and submits. The SDK performs no reconciliation against the caller's
intent and no provenance warning for the auth field. This is a genuine SDK-layer
integrity break: the prepared, "ready for signing & sending" transaction
contains authorization entries the application never authored. The objective's
impact table lists "transaction submitted with a different auth entry than the
application intended" and "remote RPC response decoded into a materially wrong
transaction auth" as in-scope (remote-response trust confusion).

**Severity downgraded from the hypothesis's High to Medium.** The on-chain
Soroban host bounds direct fund loss to fail-closed for the realistic
credential cases:

- For `SorobanCredentials.sourceAccount` entries (auto-covered by the tx source
  signature), the host requires each consumed auth entry's invocation tree to
  match the invocations actually performed during execution of the
  caller-fixed `func`. A fabricated entry authorizing a different
  invocation/args does not match and causes `require_auth` to fail — the tx
  fails rather than moving funds. Auth gates execution; it never drives it, and
  `func` is caller-controlled, so the attacker cannot induce an unintended
  sub-invocation by auth substitution alone.
- For `SorobanCredentials.address` entries, the attacker cannot forge the
  required per-address signature, so on-chain signature verification fails.

The residual, realistic impact is therefore remote-response trust confusion and
a materially wrong assembled/signed transaction (Medium per the IMPACT
table's "remote RPC response decoded into a materially wrong transaction auth";
the "High if it leads to unsafe signing/submission or fund movement" escalator
does not apply because on-chain enforcement is fail-closed). Full on-chain
exploitability across host versions was not traced in this repo, which is why
the on-chain bound is treated as bounding rather than eliminating the SDK
defect, and confidence is medium.

## PoC Guidance

- **Test file**: `test/unit/transaction.test.ts` (existing `assembleTransaction`
  suite; reuse the `singleContractFnTransaction(auth)` helper and the
  `it("simulate adds the auth to the host function in tx operation")` pattern at
  ~line 100).
- **Setup**: build a single-op `invokeHostFunction` transaction with **no**
  pre-set auth (`singleContractFnTransaction([])`). Construct a simulation
  response whose `results[0].auth` is an **attacker-chosen**
  `SorobanAuthorizationEntry` (base64) that differs from any entry the caller
  authored — e.g. a source-account-credentialed entry for an unrelated
  invocation.
- **Steps**: call `rpc.assembleTransaction(txn, forgedSimResponse).build()`.
- **Assertion**: assert the built tx's
  `operations[0].auth` equals the attacker-supplied entry (decoded by
  `parseSuccessful`), demonstrating the SDK folds untrusted remote auth into the
  to-be-signed operation with no reconciliation. Optionally contrast with the
  existing `it("doesn't overwrite auth if it's present")` case (line ~210) to
  show the gap is specific to the no-pre-auth flow.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-014c7e2b1c426cfa3f7f5c02"
weakness = "transaction serialization integrity"
record_kind = "single_path"
path = ["prepareTransaction", "assembleTransaction"]
sink = "assembleTransaction"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/rpc/server.ts:prepareTransaction", "src/rpc/parsers.ts:parseSuccessful"]
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
rules_out = ["source trace confirms no reconciliation or provenance check of remote simulation auth entries against caller intent on prepareTransaction -> assembleTransaction before signing; the existingAuth>0 guard at transaction.ts:115 does not cover the documented no-pre-auth first-prepare flow", "distinct from the known footprint finding (route js-sdk-3504706c): this is the operation auth field (transaction.ts:115 / parsers.ts:187-189), not the sorobanData footprint field"]
does_not_rule_out = ["on-chain Soroban host fail-closed enforcement was not traced in this repo and may further constrain real-world impact", "fee/minResourceFee inflation folded via cloneFrom on the same path", "footprint reconciliation failure mode already covered by route js-sdk-3504706c"]
assumptions = ["caller-selected RPC endpoint is untrusted or MITM-capable, per the rpc subsystem threat model", "common documented flow: invokeHostFunction op with no pre-set auth passed to prepareTransaction/assembleTransaction", "source-account-credentialed auth entries are implicitly authorized by the tx source signature with no separate per-entry signature"]
mechanism_brief = "prepareTransaction/assembleTransaction adopts untrusted remote simulation auth entries (decoded by parseSuccessful at parsers.ts:187-189) into the invokeHostFunction op the caller signs, with no reconciliation against caller intent when the op has no pre-set auth (transaction.ts:115); impact bounded to remote-response trust confusion / materially wrong signed auth (Medium) because the on-chain host fail-closes mismatched/unsigned auth."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "pre-existing caller auth entries (existingAuth.length > 0) are preferred over simulation auth at transaction.ts:115; this guard does not cover the normal no-pre-auth first-prepare flow where success.result.auth is adopted verbatim"

[[blockers]]
kind = "not_found"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "no source-proven reconciliation, provenance warning, or caller-intent validation of remote-supplied auth entries before the assembled transaction is returned for signing"
```
