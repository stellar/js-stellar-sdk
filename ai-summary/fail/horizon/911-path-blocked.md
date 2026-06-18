# F911: Path blocked: Horizon submission transaction serialization cluster

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/911-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> toEnvelope`

Area seed sibling set: `submitTransaction`, `submitAsyncTransaction`, `toEnvelope`, `toXDR`.

## Blocker

On both submit entry points the caller transaction is serialized one-directionally and faithfully before any network I/O: `transaction.toEnvelope().toXDR().toString("base64")` runs (server.ts:340, server.ts:571) prior to the POST, so no remote Horizon response can influence the serialized envelope bytes. `toEnvelope` (transaction.ts:279-308) builds the envelope only from construction-time `this.tx` and a copied `this.signatures`, and `toXDR` (transaction_base.ts:239-241) merely delegates to it — both deterministic on caller-constructed state. The sole attacker-influenced channel is the remote response, which flows on the separate downstream decode path (`result_xdr.fromXDR`) already adjudicated NOT_VIABLE as a leaf return value. A caller supplying a different-than-intended transaction is the caller's own intent and out of scope.

## Evidence

- `src/horizon/server.ts:339-341` (`submitTransaction`) - serializes the caller tx with `toEnvelope().toXDR()` before the POST; no response data is in scope at serialization time.
- `src/horizon/server.ts:570-572` (`submitAsyncTransaction`) - identical pre-POST serialization; returns `response.data` raw without decoding (server.ts:584).
- `src/base/transaction.ts:279-308` (`Transaction.toEnvelope`) - envelope built solely from `this.tx.toXDR()` round-trip and copied `this.signatures`, deterministic on construction-time state.
- `src/base/transaction_base.ts:239-241` (`TransactionBase.toXDR`) - delegates to `toEnvelope().toXDR().toString("base64")`; no external input.
- `src/horizon/server.ts:359-365` - the only attacker-influenced data (`result_xdr`) is decoded after submission as a leaf return value (prior NOT_VIABLE routes js-sdk-d87c484129de8eb8cd54070c, js-sdk-5f3e8285bdb0d1bde50ff0fd).

## Negative Scope

- Rules out: `toEnvelope`/`toXDR` on the Horizon submit paths as a serialization-integrity / trust-confusion finding where a remote Horizon response corrupts the serialized caller envelope — serialization precedes and is independent of any response.
- Does not rule out: the downstream `result_xdr` decode/merge path on `submitTransaction` (covered separately by prior decode-side records), and a catchable throw from `toEnvelope` on a malformed caller-constructed transaction (Low availability, below floor).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-6875e3823921de2ccc10a578"
weakness = "transaction serialization integrity"
record_kind = "area_seed"
path = ["<anonymous>", "toEnvelope"]
sink = "toEnvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["submitAsyncTransaction", "toXDR", "toEnvelope", "submitTransaction", "Transaction.toEnvelope", "TransactionBase.toXDR"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["serialize_before_network_io", "faithful_caller_state_serialization"]
rules_out = ["remote Horizon response corrupting the serialized caller envelope on submitTransaction/submitAsyncTransaction: serialization (server.ts:340,571) runs before the POST and uses only construction-time this.tx/this.signatures (transaction.ts:279-308)"]
does_not_rule_out = ["downstream result_xdr decode/merge on submitTransaction result handling", "catchable throw from toEnvelope on a malformed caller transaction (Low availability)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Caller transaction is serialized one-directionally to an XDR envelope before any POST, using only construction-time state; no remote response can alter the serialized bytes, so the serialize path carries no attacker-controlled integrity risk."
why_failed_brief = "serialization is faithful and precedes network I/O; the only attacker channel (remote response) is the separate downstream decode leaf already adjudicated NOT_VIABLE"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "data_flow_direction"
guarantee = "toEnvelope/toXDR serialize construction-time caller state before the POST; remote response is not in scope at serialization time (server.ts:339-341, 570-572)"

[[blockers]]
kind = "one_directional_serialization"
guarantee = "Transaction.toEnvelope builds the envelope only from this.tx round-trip and copied this.signatures, deterministic on caller construction state (transaction.ts:279-308)"
```
