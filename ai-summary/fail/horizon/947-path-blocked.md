# F947: Path blocked: Horizon transaction envelope serialization on submission

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/947-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> transac ... nvelope`

Area seed target set: `submitTransaction`, `submitAsyncTransaction`, `toXDR`,
`toEnvelope`, `transac ... nvelope`, `transac ... ).toXDR`, `<anonymous>`.

## Blocker

On both submission entrypoints the caller envelope is serialized synchronously
*before* any network IO: `transaction.toEnvelope().toXDR().toString("base64")`
is fully evaluated and bound to `tx` (server.ts:339-341 sync, 570-572 async)
before the awaited `httpClient.post`. The serialization reads only
construction-time transaction state, and the only remote interaction that
precedes it, `checkMemoRequired`, is strictly read-only on the transaction
(it inspects `transaction.memo`/`operations`/`destination` and can only throw —
server.ts:849-908). Therefore no remote Horizon response can be interleaved
into, or corrupt, the serialized caller envelope. On the response side the
decoded result XDR is a leaf return value (server.ts:359-365, 524-527) merged
back into the same untrusted JSON and returned to the caller; `submitAsyncTransaction`
returns `response.data` undecoded (server.ts:584). The decoded value is never
re-read for signing, fee, auth, sequence, or resubmission, so a malicious
response cannot redirect a later trust decision.

## Evidence

- `src/horizon/server.ts:339-341` - sync submit serializes envelope to XDR before the POST; no remote input in scope.
- `src/horizon/server.ts:570-572,584` - async submit serializes before POST and returns raw `response.data` with no decode.
- `src/horizon/server.ts:359-365,524-527` - result_xdr decode and offerResults are a leaf return value, not re-fed into the SDK.
- `src/horizon/server.ts:849-908` - the only pre-serialization remote call (`checkMemoRequired`) reads transaction fields read-only and only throws.

## Negative Scope

- Rules out: remote Horizon response (or pre-serialization memo-required account
  loads) corrupting the serialized caller envelope on
  `submitTransaction`/`submitAsyncTransaction`, and decoded result XDR being
  re-used by the SDK for a signing/fee/auth/resubmission decision.
- Does not rule out: integrity of `Transaction.toEnvelope`/`toXDR` internals in
  `stellar-base` (out of this repo's `src/`), and `checkMemoRequired`'s own
  remote-driven control flow (memo-required gating) as a distinct route.

## Per-Target Disposition

- `submitTransaction` / `submitAsyncTransaction`: serialize-before-network-IO; blocked.
- `toEnvelope` / `toXDR` / `transac ... ).toXDR` / `transac ... nvelope`:
  deterministic from caller construction state; no remote influence on the path.
- `<anonymous>`: response `.then` callback decodes result XDR into a leaf return
  value only.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-5fb6f805af186b3710202761"
weakness = "transaction serialization integrity"
record_kind = "area_seed"
path = ["<anonymous>", "transac ... nvelope"]
sink = "transac ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["submitAsyncTransaction", "toXDR", "toEnvelope", "<anonymous>", "transac ... nvelope", "transac ... ).toXDR", "submitTransaction"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["serialize_before_network_io", "faithful_caller_state_serialization", "decode_output_is_leaf_return_value"]
rules_out = ["remote Horizon response or pre-serialization memo-required loads corrupting the serialized caller envelope on submitTransaction/submitAsyncTransaction; decoded result_xdr being re-read by the SDK for signing/fee/auth/sequence/resubmission"]
does_not_rule_out = ["stellar-base Transaction.toEnvelope/toXDR internal integrity (outside src/)", "checkMemoRequired memo-required gating as a distinct remote-driven route"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Both submit entrypoints serialize toEnvelope().toXDR() synchronously before the awaited POST, reading only construction-time transaction state; the only prior remote call (checkMemoRequired) is read-only on the transaction, and the decoded result XDR is a leaf return value never re-used by the SDK."
why_failed_brief = "serialization completes before any network IO and uses only caller construction state; remote response decode is a leaf return value"
confidence = "high"

[[sanitizer_guarantees]]
kind = "ordering_invariant"
guarantee = "envelope serialization to XDR is fully evaluated before the awaited httpClient.post on both submit paths (server.ts:339-341,570-572)"

[[sanitizer_guarantees]]
kind = "read_only_access"
guarantee = "checkMemoRequired only reads transaction.memo/operations/destination and throws; it does not mutate the transaction before serialization (server.ts:849-908)"

[[blockers]]
kind = "leaf_return_value"
guarantee = "decoded result_xdr/offerResults are returned to the caller and never re-read by the SDK for signing, fee, auth, sequence, or resubmission (server.ts:359-365,524-527); async returns raw response.data (server.ts:584)"
```
