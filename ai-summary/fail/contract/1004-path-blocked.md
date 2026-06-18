# F1004: Path blocked: contract transaction submission via send

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/1004-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`send -> this.server.sendTransaction (RPC transaction submission)`

Area seed targets adjudicated: `send`, `sendTransaction` (the submission sink
`this.se ... saction`), and the `<anonymous>` wallet sign callback.

## Blocker

Between signing and submission the SDK performs no rebuild, clone, field edit,
or re-encode of the envelope. `AssembledTransaction.sign` stores the wallet's
returned `signedTxXdr` verbatim into `this.signed`
(`assembled_transaction.ts:841-844`), and `SentTransaction.send` submits exactly
that object via `this.server.sendTransaction(this.assembled.signed!, ...)`
(`sent_transaction.ts:78-79`) with nothing in between mutating it. The only
attacker-influenced (RPC simulate response) mutation — `sorobanData:
this.simulationData.transactionData` injected by the pre-sign `cloneFrom`
(`assembled_transaction.ts:815-821`) — happens *before* the wallet signs, so the
user signs exactly the bytes that are submitted; that injection is the intended
Soroban assembly path and its resource-fee/footprint impact is bounded
(over-declared resource fee is refunded; an over-broad footprint cannot
authorize writes, only fail or raise the refundable fee).

## Evidence

- `src/contract/sent_transaction.ts:78-79` - submission sink forwards `this.assembled.signed` verbatim; no envelope edit before the RPC call.
- `src/contract/assembled_transaction.ts:841-844` - `this.signed` is the wallet's `signedTxXdr` decoded with the caller's networkPassphrase; not re-derived afterward.
- `src/contract/assembled_transaction.ts:815-821` - the only attacker-influenced mutation (sorobanData from the RPC simulate response) is applied pre-sign, inside the bytes the wallet receives at `this.built.toXDR()` (line 835).
- `src/contract/assembled_transaction.ts:688-689,695-703` - `simulationData.transactionData` originates from `server.simulateTransaction`, confirming the RPC source, but it is consumed only during assembly before signing.

## Negative Scope

- Rules out: a spec/JSON/XDR- or RPC-response-driven mutation occurring between
  `sign` returning and `send` submitting that makes the submitted envelope
  diverge from the wallet-signed envelope on this route.
- Does not rule out: (a) Spec/result-decode type confusion when
  `SentTransaction.result` parses the RPC `getTransactionResponse.returnValue`
  (`sent_transaction.ts:136-139`) — a distinct result-decode route, not the
  submission sink; (b) the `restoreFootprint -> signAndSend` path
  (`assembled_transaction.ts:~1144`) which builds and submits a separate
  restore transaction from RPC `restorePreamble`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-dfb2ac9b8611377f55d03e10"
weakness = "transaction integrity at submission boundary"
record_kind = "area_seed"
path = ["send", "this.se ... saction"]
sink = "this.se ... saction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = ["src/contract/sent_transaction.ts:send", "src/contract/assembled_transaction.ts:send", "src/contract/assembled_transaction.ts:sign"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["signed_bytes_equal_submitted_bytes_no_post_sign_mutation", "submission_sink_forwards_verbatim_no_envelope_edit"]
rules_out = ["the send -> sendTransaction submission sink introducing divergence between the wallet-signed envelope and the bytes submitted to the RPC server; this.assembled.signed is submitted verbatim with no intervening rebuild/clone/edit/re-encode"]
does_not_rule_out = ["Spec/result type confusion when SentTransaction.result parses RPC getTransactionResponse.returnValue (distinct result-decode route)", "the restoreFootprint -> signAndSend path that builds and submits a separate restore transaction from RPC restorePreamble"]
assumptions = ["no additional assumptions beyond cited source evidence", "the application-provided signTransaction wallet callback is trusted per objective out-of-scope rules"]
mechanism_brief = "send submits this.assembled.signed verbatim; the only attacker-influenced mutation (RPC sorobanData) is applied pre-sign so the user signs exactly the submitted bytes; resource-fee/footprint impact is bounded."
why_failed_brief = "post-sign immutability is source-proven (sent_transaction.ts:78-79, assembled_transaction.ts:841-844); pre-sign sorobanData injection is the intended Soroban assembly path with bounded, refundable impact."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "send() refuses to submit unless this.signed is set (assembled_transaction.ts:854-858) and submits that exact object (sent_transaction.ts:78-79); no re-encode of a different state"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "the bytes handed to the wallet (assembled_transaction.ts:835 this.built.toXDR) already include the RPC-derived sorobanData, so signed preimage == submitted envelope"

[[blockers]]
kind = "invariant"
guarantee = "no rebuild/clone/field-edit/re-encode occurs between sign() returning and send() submitting; submitted == signed"
```
