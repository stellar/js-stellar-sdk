# F961: Path blocked: contract transaction / auth-entry signing cluster

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/961-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> t.sign`

Area seed sibling set traced from source: `sign`, `signAndSend`,
`needsNonInvokerSigningBy`, `signAuthEntries` (covering `signTransaction`,
`signAuthEntry`, `this.sign`, `keypair.sign`).

## Blocker

At every signing sink the bytes/preimage handed to the signer are exactly the
bytes that get submitted, and they are forwarded in full to the
caller-controlled, trusted signer for inspection at sign time — there is no
SDK-internal "intended" transaction held separately from what the wallet/keypair
sees. `sign` rebuilds `this.built` via `cloneFrom` (splicing
`simulationData.transactionData`) and passes `this.built.toXDR()` straight to the
caller-supplied `signTransaction`, then stores whatever the wallet returns
(assembled_transaction.ts:815-844). `signAuthEntries` forwards the full
`authorizeEntry` preimage (rootInvocation, nonce, expiration, network) to the
caller-supplied `signAuthEntry` (assembled_transaction.ts:1065-1079). Under the
Soroban auth model the signer authorizes exactly what it is shown, and any
attacker-crafted (RPC/JSON/XDR) auth signature or invocation is re-verified
on-chain, so a forged or reordered entry yields a rejected tx, not unauthorized
fund movement. Per-target re-trace below confirms no sibling escapes this.

## Per-Target Disposition

- `sign` / `this.sign`: forwards full reconstructed envelope to caller wallet;
  `this.signed` is the wallet's own returned XDR (815-844). No divergence
  between authorized and submitted bytes.
- `signAndSend`: only wraps the signer to set `submit:false` and prevent double
  submission (894-901), then delegates to `sign`; adds no new signing surface.
- `needsNonInvokerSigningBy`: gates `sign` (804-812). A malicious RPC could mark
  an address entry "already signed" by setting a non-`scvVoid` signature
  (950-961) to skip the co-signer requirement, but the bogus signature is
  re-verified on-chain → failed tx, not fund loss (below Medium).
- `signAuthEntries` / `signAuthEntry` / `keypair.sign`: entry selection compares
  `authEntryAddress !== address` (1061) and forwards the full preimage to the
  signer (1065-1079); custom `authorizeEntry` is a documented call-time caller
  opt-in (1008-1013), not remote-injectable.

## Evidence

- `src/contract/assembled_transaction.ts:815-844` - `sign` passes
  `this.built.toXDR()` to caller `signTransaction`; signed == forwarded bytes.
- `src/contract/assembled_transaction.ts:1065-1079` - `signAuthEntries` forwards
  full preimage to caller `signAuthEntry`; signer authorizes what it sees.
- `src/contract/assembled_transaction.ts:950-961` - non-invoker gate keys on
  `scvVoid` signature presence; bypass only yields on-chain-rejected sigs.

## Negative Scope

- Rules out: signing-sink integrity bug where the bytes/preimage authorized by
  the caller's wallet/keypair diverge from the submitted transaction/auth entry
  on these contract signing entrypoints.
- Does not rule out: the already-recorded VIABLE decode weakness reachable via
  `funcResToNative`/`structToNative` field-order on RPC-supplied ScVals
  (route js-sdk-26a2c419baf9cb084b019288), and the `needsNonInvokerSigningBy`
  "already-signed" detection nuance as a non-signing (on-chain-rejected) edge.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-f987d575b40d886a548457f2"
weakness = "authorization integrity in transaction signing"
record_kind = "area_seed"
path = ["<anonymous>", "t.sign"]
sink = "t.sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "transaction_signing"
target_functions = ["signTransaction", "sign", "<anonymous>", "t.sign", "signAndSend", "this.sign", "signAuthEntry", "keypair\\n      .sign"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["signed_bytes_equal_submitted_bytes_forwarded_to_caller_signer", "soroban_auth_preimage_forwarded_in_full_to_signer", "attacker_auth_signature_reverified_on_chain"]
rules_out = ["signing-sink integrity divergence between caller-authorized bytes/preimage and submitted transaction/auth entry on sign/signAndSend/signAuthEntries"]
does_not_rule_out = ["funcResToNative/structToNative ScVal field-order decode weakness (route js-sdk-26a2c419baf9cb084b019288)", "needsNonInvokerSigningBy already-signed scvVoid detection as on-chain-rejected non-signing edge"]
assumptions = ["no additional assumptions beyond cited source evidence", "Soroban host re-verifies auth-entry signatures on submission"]
mechanism_brief = "All contract signing entrypoints forward the exact submitted bytes/preimage to the caller-trusted signer, so no SDK-internal intended transaction diverges from what is authorized; attacker-crafted auth is re-verified on-chain."
why_failed_brief = "Signed bytes equal submitted bytes and are forwarded in full to the caller's wallet/keypair for sign-time inspection; no separate SDK-held intent exists to deviate from."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "sign forwards this.built.toXDR() to caller signTransaction and stores the wallet's returned XDR (assembled_transaction.ts:834-844); signed == submitted == inspected"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "signAuthEntries forwards the full authorizeEntry preimage to caller signAuthEntry (assembled_transaction.ts:1065-1079); signer authorizes exactly what it is shown"

[[blockers]]
kind = "invariant"
guarantee = "no SDK-internal intended transaction/auth-entry is held separately from the bytes forwarded to the caller-trusted signer at sign time"
```
