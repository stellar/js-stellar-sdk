# R985-C1: Malicious RPC Simulation Auth Injection via Unvalidated SorobanAuthorizationEntry

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/985-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

Traced the complete path from simulation response to auth signing:

1. `parseSuccessful` (src/rpc/parsers.ts:187-188) decodes every auth entry from the raw simulation response via `xdr.SorobanAuthorizationEntry.fromXDR(entry, "base64")`. No semantic validation of the decoded entries' invocation trees occurs.

2. `assembleTransaction` (src/rpc/transaction.ts:100-117) checks `existingAuth.length > 0` at line 105. When empty (typical first-simulate path), simulation auth entries are placed directly into the `invokeHostFunction` operation at line 115: `auth: existingAuth.length > 0 ? existingAuth : success.result!.auth`.

3. `signAuthEntries` (src/contract/assembled_transaction.ts:1041-1080) iterates all auth entries from the operation. For each entry with address-based credentials matching the configured `address` (line 1061), it calls `authorizeEntry`.

4. `authorizeEntry` (src/base/auth.ts:134-193) builds a preimage via `buildAuthorizationEntryPreimage` (auth.ts:357-396) which includes `invocation: entry.rootInvocation()` at line 379. The signer signs `hash(preimage)` — the full invocation tree from the attacker-crafted entry.

5. `needsNonInvokerSigningBy` (assembled_transaction.ts:924-967) only checks whether auth entries have unsigned credentials for matching addresses (lines 950-966); it does not inspect invocation tree content.

The path is end-to-end confirmed: a malicious RPC simulation response can inject `SorobanAuthorizationEntry` entries with arbitrary invocation trees, and programmatic signers (Keypair or server-side callbacks) will sign them without any content inspection.

## Findings

A malicious or compromised Soroban RPC endpoint can craft a simulation response containing `SorobanAuthorizationEntry` entries that authorize contract invocations different from what the application intended (e.g., `drain_funds(attacker)` instead of `transfer(recipient, amount)`). The SDK decodes, assembles, and signs these entries in a straight-line path with no content validation at any stage.

The impact is High because:
- The signed auth entry commits the application's key to whatever `rootInvocation` the attacker specified
- Programmatic signers (Keypair, server-side signing callbacks) cannot inspect or reject the invocation content
- This is the typical first-simulate flow — `existingAuth` is empty for new transactions
- The attacker only needs the auth entry's address credential to reference the application's account, which is feasible when the contract expects invoker auth for sub-invocations

The `existingAuth.length > 0` guard (transaction.ts:115) only blocks pre-authed transactions (advanced usage), not the documented typical case. Interactive wallet-based signers may prompt the user, but programmatic signers do not.

## PoC Guidance

- **Test file**: `test/unit/server/soroban/simulate_transaction_test.js` or a new `test/unit/server/soroban/auth_injection_test.js`
- **Setup**: Mock a Soroban RPC server that returns a simulation response with a crafted `SorobanAuthorizationEntry` containing an invocation tree for a different contract function (e.g., `drain_funds`) but targeting the application's account address
- **Steps**: Build an `invokeHostFunction` transaction for `transfer()`, simulate against the mock RPC, then call `signAuthEntries` with a Keypair signer
- **Assertion**: The signed auth entry's `rootInvocation` contains the attacker's function name and arguments, not the application's intended invocation. Verify by decoding the signed entry and inspecting `rootInvocation().function().functionName()`

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-4bffeef38fbfee0e8fc501e8"
weakness = "xdr_decode"
record_kind = "single_path"
path = ["simulateTransaction", "parseSuccessful", "xdr.SorobanAuthorizationEntry.fromXDR", "assembleTransaction", "signAuthEntries", "authorizeEntry", "buildAuthorizationEntryPreimage"]
sink = "signAuthEntries"
sink_role = "auth_signing"
impact_class = "wrong_tx_signing"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/rpc/parsers.ts:parseSuccessful", "src/rpc/transaction.ts:assembleTransaction", "src/contract/assembled_transaction.ts:signAuthEntries", "src/base/auth.ts:authorizeEntry"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "soroban_simulation"
scope.auth_state = "pre_auth"
scope.attacker_control = "rpc_simulation_response"
scope.parser_state = "simulation_response_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["no content validation of decoded SorobanAuthorizationEntry invocation tree exists between parseSuccessful decode and authorizeEntry signing; existingAuth guard only blocks pre-authed transactions not first-simulate flows; needsNonInvokerSigningBy checks address match and signature presence but not invocation tree content"]
does_not_rule_out = ["other rpc response fields without cross-validation", "getTransactions batch envelope injection", "interactive wallet signers that prompt users for approval may mitigate for non-programmatic flows"]
assumptions = ["application uses programmatic signAuthEntry (e.g., Keypair or server-side callback) without inspecting auth entry invocation tree", "first simulation of the transaction (existingAuth is empty)", "malicious or compromised RPC endpoint", "attacker crafts auth entry with address credential referencing application's account"]
mechanism_brief = "Malicious RPC simulation response provides SorobanAuthorizationEntry decoded via xdr.SorobanAuthorizationEntry.fromXDR (parsers.ts:187); assembleTransaction places these into invokeHostFunction.auth when existingAuth is empty (transaction.ts:115); signAuthEntries iterates entries matching the configured address (assembled_transaction.ts:1041-1061) and calls authorizeEntry which signs hash(preimage) including the attacker-controlled entry.rootInvocation() (auth.ts:379); the application key authorizes an attacker-chosen contract invocation."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "existingAuth.length > 0 discards simulation auth for pre-authed transactions (transaction.ts:105-115); not a blocker for typical first-simulate flows where existingAuth is empty"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "address filter at line 1061 ensures only entries whose address credential matches the configured address are signed; attacker must craft entries for the application's account specifically"

[[blockers]]
kind = "not_found"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "no source-proven content validation of decoded SorobanAuthorizationEntry invocation tree before signing; rootInvocation is signed as-is via buildAuthorizationEntryPreimage (auth.ts:379)"
```
