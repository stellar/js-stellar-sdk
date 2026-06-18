# F978: Path blocked: Transaction XDR serialization sibling cluster

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/978-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> a.address().toXDR`

Area seed; the `toXDR`/`toEnvelope` serialization siblings reachable from
transaction-build and authorization-entry entrypoints under the seed's
caller-configured / configuration_values scope.

## Blocker

Every traced serialization sink consumes caller-configured material that is
validated *before* it reaches `toXDR`, and the round-trip/sign paths re-derive
their output from the same validated object, so display and on-wire bytes do not
diverge. `authorizeEntry` clones the entry via `fromXDR(entry.toXDR())`, builds
the preimage from that clone, and gates on a `verify(payload, signature)` check
(src/base/auth.ts:149-195), so the signed preimage and the submitted credentials
commit to the same nonce/invocation/expiration. Muxed encode/decode is symmetric
and StrKey-validated (src/base/util/decode_encode_muxed_account.ts:13-123).
`cloneFrom` rebuilds source via StrKey checks and only subtracts the resource fee
when a positive inclusion fee remains (src/base/transaction_builder.ts:294-325).
No remote/attacker byte source crosses into these serialization sinks on the
seed's scope; that surface is the decode direction, a different route family.

## Per-Target Disposition

- `authorizeEntry` / `buildAuthorizationEntryPreimage` / `preimage.toXDR` /
  `nativeToScVal`: signed payload is built from the same clone that is returned,
  and a `Keypair.verify` gate rejects mismatched signatures
  (src/base/auth.ts:164-195). Legacy ADDRESS credentials are intentionally
  non-address-bound (CAP-71 design), and the network re-derives the same
  preimage, so a swapped credential address fails verification network-side.
  Also already disposed for this scope by prior route
  `js-sdk-63809a71507c05b9211d309d`.
- `cloneFrom` / `tx.toEnvelope` / `this._tx.toXDR` / `sorobanData.toXDR`:
  caller-configured rebuild. `cloneFrom` does not carry `sorobanData`/footprint
  into the new builder, so a cloned Soroban tx rebuilds without its resource
  footprint; this yields a network-rejected (txMALFORMED) tx, not silent wrong
  semantics — functional, below Medium. Left open in `does_not_rule_out`.
- `_encodeMuxedAccountFullyToAddress` / muxed encode/decode: symmetric,
  StrKey-validated, no truncation path.
- `encodeSignerKey` (cloneFrom extraSigners re-encode): operates on already
  StrKey-typed signer keys copied from the source tx.
- `contractId`, `txSignature.toXDR`, `this._data.toXDR`, `build`, `constructor`:
  serialize validated builder state; no untrusted byte source on this scope.

## Evidence

- `src/base/auth.ts:149-195` - clone round-trips the entry, preimage is built
  from the clone, and `verify(payload, signature)` gates before the signature is
  written, so signed and submitted bytes match.
- `src/base/auth.ts:357-404` - preimage commits to networkId/nonce/invocation/
  expiration (and address for V2/DELEGATES), matching the credential fields.
- `src/base/transaction_builder.ts:294-325` - cloneFrom validates source via
  StrKey and guards the resource-fee subtraction against fee underflow.
- `src/base/util/decode_encode_muxed_account.ts:13-123` - muxed encode/decode is
  symmetric and StrKey-validated, no truncation.

## Negative Scope

- Rules out: caller-configured transaction/authorization serialization sinks
  emitting on-wire bytes that diverge from the validated builder/entry state
  (display-vs-signed or address/identity confusion) on this seed's scope.
- Does not rule out: (a) the decode direction `Operation.fromXDRObject` on
  remote-peer envelopes (different route family, already VIABLE under
  `js-sdk-5629e9bbb72358dafa4960a5`); (b) `cloneFrom` silently dropping
  `sorobanData`/footprint as a below-Medium functional defect.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-e09c1291168a83d9dec4096f"
weakness = "transaction serialization integrity"
record_kind = "area_seed"
path = ["<anonymous>", "a.address().toXDR"]
sink = "a.address().toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["<anonymous>", "toXDR", "this.to ... ).toXDR", "contractId", "txSignature.toXDR", "build", "this._data.toXDR", "this._tx.toXDR", "constructor", "sorobanData.toXDR", "cloneFrom", "tx.toEnvelope", "encodeSignerKey", "authorizeEntry", "preimage.toXDR", "_encodeMuxedAccountFullyToAddress"]
scope.trust_boundary = "application_configuration"
scope.protocol_phase = "sdk_configuration"
scope.auth_state = "caller_configured"
scope.attacker_control = "configuration_values"
scope.parser_state = "configuration_loaded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["serialization_emits_validated_builder_state_only", "authorizeentry_verify_gate_binds_signed_preimage_to_submitted_entry"]
rules_out = ["caller-configured transaction/auth XDR serialization sinks emitting on-wire bytes that diverge from the validated builder/entry state on this scope"]
does_not_rule_out = ["Operation.fromXDRObject remote-peer decode direction (route_family transaction_decode, already VIABLE under js-sdk-5629e9bbb72358dafa4960a5)", "cloneFrom dropping sorobanData/footprint as a below-Medium functional defect"]
assumptions = ["no additional assumptions beyond cited source evidence", "seed scope is caller_configured/configuration_values; no remote attacker byte source reaches these serialization sinks on this path"]
mechanism_brief = "Serialization siblings emit bytes re-derived from caller-configured, StrKey/XDR-validated builder and authorization-entry state; authorizeEntry binds the signed preimage to the submitted clone and gates on signature verification, and muxed/clone paths are symmetric and bounds-checked."
why_failed_brief = "All traced toXDR/toEnvelope sinks serialize validated caller-configured state with no display-vs-signed divergence; remote attacker control lives in the decode family, not this serialization scope."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "authorizeEntry builds the signed preimage from fromXDR(entry.toXDR()) clone and rejects any signature failing Keypair.verify(payload, signature) before writing it (src/base/auth.ts:149-195)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "cloneFrom validates the source account via StrKey and only subtracts resourceFee when a positive inclusion fee remains (src/base/transaction_builder.ts:294-325)"

[[blockers]]
kind = "validated_input"
guarantee = "serialization sinks receive only caller-configured material validated by StrKey/XDR codecs; no remote/attacker byte source crosses into toXDR/toEnvelope on this scope"
```
