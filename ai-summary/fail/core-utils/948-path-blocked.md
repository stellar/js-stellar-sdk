# F948: Path blocked: Signature-path buffer decode of caller-supplied bytes

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/948-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`verify -> Buffer.from`

Area seed over the buffer_decode cluster reachable from signature/verification
and operation-builder entrypoints. Per-target disposition below; all share two
source-confirmed gates plus the seed's own `caller_configured` /
`configuration_values` trust scope.

## Blocker

Every `Buffer.from` sink in this cluster consumes bytes the local caller already
controls, and the two materially security-relevant shapes are both gated. (1)
Signing entrypoints (`sign`, `signDecorated`, `signPayloadDecorated`,
`getKeypairSignature`) operate on caller data with the caller's own secret key —
no trust boundary is crossed. (2) The one entrypoint that ingests
externally-produced bytes, `addSignature`, base64-decodes the signature with
`Buffer.from` but then requires `keypair.verify(this.hash(), signatureBuffer)`
to pass before the signature is accepted; a lenient/malformed base64 decode
cannot bypass the ed25519 verify gate (a valid signature still requires the
matching secret key). Operation builders (`allowTrust`, `setOptions`,
`liquidityPoolWithdraw`, `uploadContractWasm`, `toBuffer`, `toXDRObject`) decode
only caller-configured operation arguments, which the seed itself scopes as
`configuration_values` — out of scope absent a remote-byte cross-in.

## Per-Target Disposition

- `verify` / `signing.verify` (src/base/signing.ts:31-44): ed25519 verify with
  `zip215:false`; `Buffer.from` here normalizes inputs INTO the cryptographic
  check, it is the gate, not a pre-gate. No bypass.
- `addSignature` (src/base/transaction_base.ts:156-186): base64 decode then
  mandatory `keypair.verify`; forged/malformed signatures throw "Invalid
  signature". Matches prior memory [2][4] (readChallengeTx verify-gate).
- `signPayloadDecorated` / `signDecorated` / `sign`
  (src/base/keypair.ts:236-307): caller signs caller data with caller key; hint
  XOR loop bounded to 4 bytes (`keyHint` is 4 bytes), no OOB. No trust boundary.
- `signHashX` (src/base/transaction_base.ts:204-217): hex decode of caller
  preimage, length capped at 64; caller-supplied.
- `setOptions` (src/base/operations/set_options.ts:122,138): hex decode of
  caller-chosen signer `preAuthTx`/`sha256Hash`; caller-configured.
- `allowTrust` (src/base/operations/allow_trust.ts:34,37): pads caller
  `assetCode`; caller-configured.
- `liquidityPoolWithdraw`, `uploadContractWasm`, `toBuffer`, `toXDRObject`,
  `hash`, `from`, `constructor`, `<anonymous>`: caller-configured operation
  args / local encoding helpers under the same `configuration_values` scope; no
  remote attacker byte source traced into these.

## Evidence

- `src/base/signing.ts:31-44` - `verify` runs ed25519 over decoded bytes; the
  `Buffer.from` normalizations feed the crypto check, not a trust decision.
- `src/base/transaction_base.ts:167-178` - `addSignature` base64-decodes then
  requires `keypair.verify(this.hash(), signatureBuffer)` before push.
- `src/base/keypair.ts:285-307` - `signPayloadDecorated` signs caller data with
  caller's own key; 4-byte-bounded hint XOR, no OOB.
- `src/base/operations/set_options.ts:122,138` - signer hash buffers decoded
  from caller-chosen signer config.
- `src/base/operations/allow_trust.ts:34,37` - asset code padded/decoded from
  caller argument.

## Negative Scope

- Rules out: lenient/malformed `Buffer.from` base64/hex decode in the
  signature/verification and operation-builder cluster producing a forged-valid
  signature or wrong-shaped trusted buffer, because signing uses the caller's
  own key and verification is gated by ed25519 verify, while builder inputs are
  caller-configured.
- Does not rule out: a distinct route where a REMOTE RPC/Horizon/SEP-10
  response's bytes (not caller config) reach one of these `Buffer.from` sinks
  pre-verification; remote-response variants are covered separately by prior
  memory (readChallengeTx server-signature gate; getClaimableBalance pre-decoded
  XDR).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-083ff40f27c9f10b6fa69450"
weakness = "buffer decode / encoding integrity"
record_kind = "area_seed"
path = ["verify", "Buffer.from"]
sink = "Buffer.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["verify", "addSignature", "signPayloadDecorated", "signDecorated", "signHashX", "setOptions", "allowTrust", "liquidityPoolWithdraw", "uploadContractWasm", "toBuffer", "toXDRObject", "hash", "from", "constructor", "Buffer.from"]
scope.trust_boundary = "application_configuration"
scope.protocol_phase = "sdk_configuration"
scope.auth_state = "caller_configured"
scope.attacker_control = "configuration_values"
scope.parser_state = "configuration_loaded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["signature_buffer_decode_is_verify_gate_not_pregate", "signing_uses_caller_own_key_no_trust_boundary", "builder_inputs_caller_configured_only"]
rules_out = ["lenient Buffer.from base64/hex decode in the verify/operation-builder cluster forging a valid signature or producing a wrong-shaped trusted buffer from caller-configured bytes"]
does_not_rule_out = ["a remote RPC/Horizon/SEP-10 response byte source reaching these Buffer.from sinks pre-verification (covered by sibling readChallengeTx / getClaimableBalance records)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Caller-supplied bytes flow into Buffer.from across signing, verification, and operation-builder entrypoints, but signing uses the caller's own secret key (no trust boundary), addSignature requires ed25519 verify before acceptance, and builder inputs are caller-configured per the seed scope."
why_failed_brief = "signing path crosses no trust boundary; verification path is gated by ed25519 verify that lenient decode cannot bypass; operation-builder inputs are caller-configured configuration values"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "crypto_gate"
guarantee = "addSignature requires keypair.verify(this.hash(), signatureBuffer) to pass before the decoded signature is accepted (src/base/transaction_base.ts:176-178)"

[[sanitizer_guarantees]]
kind = "ownership_invariant"
guarantee = "signing entrypoints sign caller data with the caller's own secret key, crossing no trust boundary (src/base/keypair.ts:236-307)"

[[blockers]]
kind = "trust_scope"
guarantee = "operation-builder Buffer.from inputs are caller-configured operation arguments (configuration_values) with no traced remote attacker byte source (src/base/operations/set_options.ts:122-138, allow_trust.ts:34-37)"
```
