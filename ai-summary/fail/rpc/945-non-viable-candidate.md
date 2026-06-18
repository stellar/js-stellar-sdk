# F945: Simulation auth-entry adoption in assembleTransaction is working-as-designed

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/945-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's factual code claims are confirmed in current source:

- `src/rpc/transaction.ts:100-117` — for an `invokeHostFunction` op the
  original operation is dropped (`clearOperations`) and rebuilt with
  `func: invokeOp.func` and
  `auth: existingAuth.length > 0 ? existingAuth : success.result!.auth`
  (line 115). When the caller supplied no auth, the simulation's auth array is
  adopted verbatim.
- `src/rpc/parsers.ts:186-189` — `parseSuccessful` decodes the auth array as
  `row.auth.map(entry => xdr.SorobanAuthorizationEntry.fromXDR(entry,"base64"))`
  taken straight from the remote `sim.results[0].auth` with no content
  validation.
- `src/rpc/transaction.ts:85-98` — `cloneFrom` rebuilds the envelope; the
  returned builder is later serialized for signing.

So the data flow (remote base64 auth -> decoded entry -> rebuilt op ->
serialized envelope) is real. The disagreement is with the candidate's stated
**expected behavior**, not its code reading.

## Why It Failed

The candidate asserts expected behavior is that "simulation-derived
authorization entries folded into a transaction destined for signing should be
reconciled against the caller's intended invocation/auth." Tracing the code and
the documented API contract shows this is the wrong expected behavior; the
actual behavior is working-as-designed for three independent reasons:

1. **No caller-authored auth baseline on the first-simulation flow.** The
   empty-`auth` path is the documented mechanism by which the caller delegates
   auth discovery to simulation. `src/rpc/transaction.ts:27-43` and the inline
   comment at `transaction.ts:110-114` ("if auth exists, this tx has probably
   been simulated before") state that simulation entries are the intended
   source of auth precisely when the caller supplied none. There is no
   caller-authored auth set to "reconcile" against on first simulation. This is
   the same structural situation prior record `[4]`
   (`route_id js-sdk-d8fe689893049ffbbe84f5cb`) ruled NOT_VIABLE for the
   simulated resource fee: "simulation exists to discover it, so a numeric
   cap/diff is not meaningful and adopting the simulated value is
   working-as-designed rather than a missing guard." The reasoning transfers
   directly to the auth array, which the caller deliberately left empty to be
   populated by simulation.

2. **The injected entries are inert permissions, not commands, and cannot
   redirect execution.** The rebuilt top-level operation's `func` is taken from
   the caller's own op (`transaction.ts:109 func: invokeOp.func`), never from
   simulation. A `SorobanAuthorizationEntry` only takes effect when the
   executing contract makes a matching `require_auth` call during the caller's
   chosen invocation. The contract is on-chain and deterministic and its
   behavior is driven by the caller-controlled `func` + arguments, not by the
   auth array. A malicious server therefore cannot cause a sub-invocation
   (e.g. a token transfer) that the caller's chosen invocation does not already
   perform; extra `sorobanCredentialsSourceAccount` entries that match no
   contract-initiated `require_auth` are simply unused. The candidate's own
   anti-evidence concedes "end-to-end fund theft depends on the invoked
   contract."

3. **Address-credential entries cannot be forged and are not auto-signed on
   this path.** `sorobanCredentialsAddress` entries require a separate signature
   from the credentialed address; a malicious RPC server cannot produce one,
   and `assembleTransaction`/`prepareTransaction` do not sign auth entries
   (consistent with prior record `[3]`, which established no auto-signing and an
   unsigned, caller-reviewable result on this exact path). Such injected
   entries fail at execution rather than authorizing anything.

Combining 1-3: no transaction with materially different *effective* auth is
produced. The auth array contents come from simulation by design, the caller
reviews the unsigned result before signing, and the Soroban auth model
neutralizes any server-injected entry that does not correspond to the caller's
own intended invocation. There is no material security effect, so the candidate
falls below the Medium severity floor and is out of scope.

## What This Rules Out

Verbatim adoption of the simulation `success.result.auth` array into the
rebuilt `invokeHostFunction` operation on the empty-auth
`parseSuccessful -> assembleTransaction` first-simulation flow being a Medium+
transaction-integrity finding. The mechanism is working-as-designed (caller
delegated auth discovery to simulation) and the injected entries are inert
unless matched by a caller-driven contract `require_auth`.

## What This Does Not Rule Out

- The `sorobanData`/footprint reconciliation mechanism remains VIABLE under the
  distinct prior records `[1][2]` (`route_id js-sdk-3504706c3cfcfc3ec6179739`);
  this review addresses only the auth-array field, not the footprint.
- Simulation `retval` handling, and any auth-related defect on a different
  trust boundary, protocol phase, or non-`invokeHostFunction` operation type,
  are not assessed here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-4acdcae9829cb09725a27428"
weakness = "Transaction Integrity / serialization boundary"
record_kind = "single_path"
path = ["assembleTransaction", "toEnvelope"]
sink = "toEnvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/rpc/parsers.ts:parseSuccessful"]
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
negative_claim.rules_out_codes = ["simulation_auth_discovery_working_as_designed", "soroban_auth_permission_not_command", "address_credentials_require_unforgeable_signature"]
rules_out = ["verbatim adoption of simulation success.result.auth into the rebuilt invokeHostFunction op on the empty-auth first-simulation flow being a Medium+ transaction-integrity finding: the empty-auth path is the documented auth-discovery delegation, the top-level func is the caller's, and injected source-account entries are inert unless a caller-driven contract require_auth matches them"]
does_not_rule_out = ["sorobanData/footprint reconciliation mechanism remains VIABLE under prior records [1][2] on a different field", "simulation retval handling", "auth defects on a different trust boundary, protocol phase, or non-invokeHostFunction operation type"]
assumptions = ["Soroban host consumes an auth entry only when the executing contract makes a matching require_auth call during the caller-selected invocation (protocol property, not repo source)", "sorobanCredentialsAddress entries require a separate signature the remote RPC server cannot forge", "prepareTransaction/assembleTransaction return an unsigned, caller-reviewable result with no auth-entry auto-signing (consistent with prior record [3])"]
mechanism_brief = "assembleTransaction adopts the simulation auth array verbatim only when the caller supplied none; this is the documented auth-discovery flow and the entries are inert permissions matched against caller-driven contract require_auth, so no materially-different effective auth is signed."
why_failed_brief = "working-as-designed: empty-auth flow delegates auth discovery to simulation (no caller baseline, parallel to prior [4] fee reasoning); injected entries are inert permissions, not commands; address creds cannot be forged; result is unsigned and caller-reviewable; no material security effect, below Medium floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "documented_contract"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "empty-auth branch (transaction.ts:110-115) intentionally sources auth from simulation; top-level func is taken from invokeOp.func (line 109), not simulation, so injected auth cannot redirect the invocation"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "existingAuth.length>0 branch disregards simulation auth entirely when the caller pre-populated auth"

[[blockers]]
kind = "protocol_invariant"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "Soroban auth entries are permissions consumed only by matching contract require_auth calls under the caller's chosen func+args; address credentials additionally require an unforgeable separate signature, so server-injected entries produce no materially-different effective auth"
```
