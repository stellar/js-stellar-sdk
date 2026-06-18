# F1003: Path blocked: contract transaction submission send sink

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/1003-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> send -> SentTransaction.init -> SentTransaction.send -> this.server.sendTransaction`

Area-seed sibling targets adjudicated: `send`, `this.server.sendTransaction`,
`sendTransaction`, and the `<anonymous>` closures around them.

## Blocker

The submission boundary forwards bytes unchanged. `SentTransaction.send`
submits `this.assembled.signed!` verbatim to `server.sendTransaction`
(sent_transaction.ts:78-80), and `this.signed` is set only from the wallet's
own `signedTxXdr` output via `TransactionBuilder.fromXDR(signature, ...)`
(assembled_transaction.ts:841-844). No re-build, re-clone, re-encode, or field
mutation happens between `sign()` returning and `send()` submitting, so the
submitted envelope is byte-identical to what the caller-trusted wallet signed.
The only untrusted RPC data folded into the envelope (`sorobanData`/resource
fee from `this.simulationData.transactionData`) is injected at
assembled_transaction.ts:815-821 and surfaced to the wallet via
`this.built.toXDR()` at sign time (line 834-837) — i.e. before signing, where
it is already recorded VIABLE upstream, not at this submission sink.

## Evidence

- `src/contract/sent_transaction.ts:78-80` - `send` submits `this.assembled.signed!` unchanged to `server.sendTransaction`.
- `src/contract/assembled_transaction.ts:841-844` - `this.signed` is exactly the wallet-returned `signedTxXdr`, re-parsed only (no mutation).
- `src/contract/assembled_transaction.ts:853-861` - `send` only guards `this.signed` exists, then delegates to `SentTransaction.init`; no envelope edits.
- `src/contract/assembled_transaction.ts:815-837` - RPC `sorobanData`/resource fee enters via `cloneFrom` and is forwarded to the wallet in `this.built.toXDR()` at sign time, not at the submission sink.

## Negative Scope

- Rules out: the `send`/`sendTransaction` submission sink introducing an
  integrity divergence between the caller-/wallet-signed envelope and the bytes
  submitted to the RPC server (no post-sign mutation exists on this path).
- Does not rule out: the sign-time injection of RPC-supplied
  `sorobanData`/`resourceFee` into the signed envelope (already recorded VIABLE
  under `js-sdk-37b8abbeef5856e72db630c2` and `js-sdk-1704e35f985caf506dd6a0f1`);
  result/return-value decode trust on `parseResultXdr` of the RPC
  `getTransaction` response (already recorded VIABLE on the decode cluster);
  and RPC-response-driven polling cost in `withExponentialBackoff`, which is
  bounded by `timeoutInSeconds` and below the Medium floor.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-587ee082458abf49ec3c04a1"
weakness = "transaction integrity at submission boundary"
record_kind = "area_seed"
path = ["<anonymous>", "sendTransaction"]
sink = "sendTransaction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = ["src/contract/sent_transaction.ts:send", "src/contract/assembled_transaction.ts:send", "src/contract/assembled_transaction.ts:signAndSend", "src/contract/assembled_transaction.ts:sign"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["signed_bytes_equal_submitted_bytes_no_post_sign_mutation", "submission_sink_forwards_verbatim_no_envelope_edit"]
rules_out = ["the send/sendTransaction submission sink introducing integrity divergence between the wallet-signed envelope and the bytes submitted to the RPC server; this.assembled.signed (the wallet's signedTxXdr) is submitted verbatim with no post-sign mutation"]
does_not_rule_out = ["sign-time injection of RPC-supplied sorobanData/resourceFee into the signed envelope (VIABLE js-sdk-37b8abbeef5856e72db630c2, js-sdk-1704e35f985caf506dd6a0f1)", "RPC getTransaction return-value decode trust via parseResultXdr (VIABLE decode cluster)", "withExponentialBackoff polling cost driven by repeated RPC NOT_FOUND responses (bounded by timeoutInSeconds, below Medium)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "send submits this.assembled.signed verbatim; signed equals the wallet's signedTxXdr re-parsed only; no mutation between sign and submit, so the submission sink cannot diverge from the signed bytes."
why_failed_brief = "submitted bytes are byte-identical to the wallet-signed envelope; the only untrusted RPC data enters and is wallet-visible at sign time upstream, where it is already recorded VIABLE, not at this submission sink."
confidence = "high"

[[sanitizer_guarantees]]
kind = "invariant"
guarantee = "SentTransaction.send submits this.assembled.signed unchanged (sent_transaction.ts:78-80) and this.signed is only the wallet's signedTxXdr re-parsed (assembled_transaction.ts:841-844); no post-sign envelope mutation exists on this path."

[[blockers]]
kind = "no_mutation_between_sign_and_submit"
guarantee = "between sign() returning and send() submitting, the SDK performs no re-build, re-clone, field edit, or re-encode of the envelope; submitted == signed."
```
