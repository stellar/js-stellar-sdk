# F002: Simulation authorization entries injected into invokeHostFunction

**Date**: 2026-06-17
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/001-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed data flow is real:

- `src/rpc/parsers.ts:186-189` — `parseSuccessful` decodes
  `results[].auth[]` via `xdr.SorobanAuthorizationEntry.fromXDR(entry,
  "base64")` from raw RPC JSON.
- `src/rpc/transaction.ts:100-117` — for an `invokeHostFunction` op, the
  original op is dropped and rebuilt with
  `auth: existingAuth.length > 0 ? existingAuth : success.result!.auth`. When
  the caller supplied no auth (the normal `prepareTransaction` case), the
  simulation auth array is used unmodified.
- `src/rpc/transaction.ts:108-109` — the invoked `func` and `source` are
  caller-controlled and preserved.

So a malicious RPC can place crafted `SorobanAuthorizationEntry` values into a
transaction the caller signs. The mechanism is source-confirmed.

## Why It Failed

Two independent reasons, both source/design grounded:

1. **Working as designed.** The `assembleTransaction` JSDoc
   (`transaction.ts:27-35`) documents exactly this: "If the given transaction
   already has authorization entries ... the simulation entries are ignored,"
   with the inverse — adopting simulation auth when none is present — being the
   intended behavior. Discovering the required auth entries is the primary
   purpose of simulation; the SDK has no independent way to author them.

2. **On-chain auth framework constrains the injected entries to a no-op for an
   attacker.** The caller's `func` is preserved (`transaction.ts:109`), and the
   Soroban host only consumes an auth entry whose `rootInvocation` matches an
   actual `require_auth` performed during execution of that caller-authored
   `func`:
   - `SOROBAN_CREDENTIALS_SOURCE_ACCOUNT` entries are covered by the source
     account's signature, but only authorize sub-invocations the caller's own
     `func` actually triggers — the attacker cannot make the contract perform
     an action the caller's `func` does not already drive. Extra/unmatched
     entries are not satisfied by any real invocation.
   - `SOROBAN_CREDENTIALS_ADDRESS` entries require that address's own signature,
     which the attacker does not possess, so injected address-credential entries
     cannot be satisfied.

   The attacker therefore cannot cause the caller's signature to authorize
   anything beyond what the caller's own `func` already authorizes. There is no
   material integrity loss (the hypothesis acknowledges this caveat as checked
   anti-evidence).

Combined, the behavior is the documented design and the on-chain semantics
prevent an attacker from extracting value, so the candidate does not reach the
Medium severity floor.

## What This Rules Out

Verbatim adoption of simulation `SorobanAuthorizationEntry` arrays into the
signed `invokeHostFunction` operation on the `parseSuccessful` ->
`assembleTransaction` path is not an exploitable finding: it is documented
behavior and the on-chain auth framework binds the entries to the
caller-authored `func`'s actual invocation tree (source-account entries) or
requires a signature the attacker lacks (address entries).

## What This Does Not Rule Out

- Simulation fee inflation on the same path (C1, separately assessed).
- Downstream `ScVal` -> native type/key confusion in `spec.ts`
  (prior VIABLE route `js-sdk-26a2c419baf9cb084b019288`), a distinct mechanism.
- A bug where `existingAuth`/single-op structural guards are bypassed for a
  multi-auth or non-invokeHostFunction Soroban op shape — not the mechanism
  claimed here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-aa9b65c61d46ef89d4540f22"
weakness = "Untrusted XDR Decode"
record_kind = "single_path"
path = ["parseSuccessful", "assembleTransaction", "fromXDR"]
sink = "invokeHostFunction"
sink_role = "transaction_assembly"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/rpc/parsers.ts:parseSuccessful", "src/rpc/transaction.ts:assembleTransaction"]
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
negative_claim.rules_out_codes = ["documented_simulation_auth_adoption", "onchain_auth_framework_binds_entries_to_caller_func"]
rules_out = ["verbatim adoption of simulation SorobanAuthorizationEntry arrays into the signed invokeHostFunction op on the parseSuccessful->assembleTransaction path: it is documented behavior and on-chain auth binds source-account entries to the caller-authored func invocation tree while address entries require a signature the attacker lacks"]
does_not_rule_out = ["simulation fee inflation on the same path (C1)", "downstream ScVal->native type/key confusion in spec.ts (route js-sdk-26a2c419baf9cb084b019288)", "bypass of the single-op/existingAuth structural guards for a different Soroban op shape"]
assumptions = ["the caller-authored func is preserved (transaction.ts:109) and determines which require_auth calls execute", "the Soroban host consumes an auth entry only when its rootInvocation matches an actual invocation, and SOROBAN_CREDENTIALS_ADDRESS entries require that address's own signature"]
mechanism_brief = "Untrusted simulation auth entries are injected verbatim into the signed invokeHostFunction op when caller auth is empty, but this is documented behavior and on-chain auth semantics bind the entries to the caller's own func, yielding no material integrity loss."
why_failed_brief = "working as designed per JSDoc, and the on-chain auth framework constrains injected entries to the caller-authored func's invocation tree or requires a signature the attacker lacks, so no value can be extracted; below the Medium floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "documented_contract"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "JSDoc documents that simulation auth is adopted only when the caller supplied none; func and source are caller-controlled and preserved"

[[blockers]]
kind = "protocol_invariant"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "on-chain auth requires rootInvocation to match the caller-authored func's actual invocations (source-account creds) or the target address's signature (address creds), so injected entries cannot authorize anything the caller's func does not already drive"
```
