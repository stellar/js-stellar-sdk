# F973: Path blocked: contract spec conversion of caller values into ScVal (area seed)

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/973-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`addSacTransferOperation -> nativeToScVal`

Area sibling set: `addSacTransferOperation`, `nativeToScVal`, `authorizeEntry`,
`extractEvent`, `scValToNative`, `<anonymous>`.

## Blocker

Every forward `nativeToScVal` sink in this sibling set consumes only
caller-configured or signature-verified values, so no remote/attacker-controlled
native value or type tag crosses into authorization or operation building.
`addSacTransferOperation` takes its `destination`/`asset`/`amount`/`sorobanFees`
as method parameters, validates them (positive/i64 bound on amount, U32/i64
bounds on fees, StrKey validation on destination), and builds the auth entry
with `sorobanCredentialsSourceAccount` — the caller signs their own intent.
`authorizeEntry` converts only the locally derived `public_key`/`signature` and
gates them behind `Keypair.verify` before any `nativeToScVal` call. The one
remote-facing direction — `scValToNative` decode-by-ScVal-tag confusion (reached
via `extractEvent` remote event decode) — is already recorded VIABLE under route
`js-sdk-26a2c419baf9cb084b019288`, so it is a known finding, not a distinct new
one here.

## Per-Target Disposition

- `addSacTransferOperation` (transaction_builder.ts:719-898): all
  `nativeToScVal` args are caller method parameters with validated bounds;
  credentials are source-account. No remote input. NOT_VIABLE.
- `nativeToScVal` (scval.ts:161-349): forward type-directed conversion; the
  type tag is caller-supplied (`opts.type`). No attacker-controlled tag source
  on these routes. NOT_VIABLE forward.
- `authorizeEntry` (auth.ts:134-213): signature verified at auth.ts:193 before
  the `nativeToScVal` at 202; values are signer-derived caller responsibility.
  NOT_VIABLE.
- `extractEvent` / `scValToNative`: reverse decode of remote events; the tag
  confusion mechanism is already VIABLE under route js-sdk-26a2c419 — known,
  not re-reported. Typed duplicate per prior memory.

## Evidence

- `src/base/transaction_builder.ts:725-768` - amount and destination validated (positive, ≤ i64 max, StrKey-valid) before any conversion.
- `src/base/transaction_builder.ts:792-812` - args are `[source, destination, amount]` from caller, credentials = sorobanCredentialsSourceAccount.
- `src/base/scval.ts:288-332` - string conversion is type-tag directed with the tag supplied by the caller via `opts.type`.
- `src/base/auth.ts:193-213` - `Keypair.verify` gate precedes the `nativeToScVal` of public_key/signature.

## Negative Scope

- Rules out: a distinct Medium+ forward conversion confusion in
  caller-configured `addSacTransferOperation`/`authorizeEntry`/`nativeToScVal`
  feeding authorization or operation building with no remote attacker input.
- Does not rule out: the already-VIABLE `scValToNative` decode-by-tag confusion
  on remote events (route js-sdk-26a2c419); and the muxed (M...) `destination`
  passed to `nativeToScVal` at transaction_builder.ts:794/835 versus the base
  (G...) `destinationBaseAddress` used in the footprint at 862/872 — a
  caller-configured arg/footprint shape question, not an attacker route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-32a27f03c5dd5d9aa0ecd680"
weakness = "contract spec conversion / contract interface integrity"
record_kind = "area_seed"
path = ["addSacTransferOperation", "nativeToScVal"]
sink = "nativeToScVal"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["authorizeEntry", "nativeToScVal", "addSacTransferOperation", "extractEvent", "scValToNative", "<anonymous>"]
scope.trust_boundary = "application_configuration"
scope.protocol_phase = "sdk_configuration"
scope.auth_state = "caller_configured"
scope.attacker_control = "configuration_values"
scope.parser_state = "configuration_loaded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["sac_transfer_and_authorizeentry_caller_configured_only", "authorizeentry_signature_verified_before_nativetoscval", "nativetoscval_type_tag_caller_supplied"]
rules_out = ["distinct Medium+ forward nativeToScVal conversion confusion in caller-configured addSacTransferOperation/authorizeEntry/nativeToScVal feeding auth or operation building"]
does_not_rule_out = ["scValToNative decode-by-ScVal-tag confusion on remote events already VIABLE under js-sdk-26a2c419baf9cb084b019288", "muxed destination arg vs base-address footprint shape mismatch in addSacTransferOperation (caller-configured)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Forward nativeToScVal sinks in this sibling set consume only caller-configured (addSacTransferOperation) or signature-verified signer-derived (authorizeEntry) values; no remote/attacker native value or type tag crosses in."
why_failed_brief = "All forward conversion routes are caller-configured or signature-gated; the only remote-facing reverse decode (scValToNative tag confusion) is an already-recorded VIABLE finding, not a distinct new one."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "input_validation"
guarantee = "addSacTransferOperation validates amount (positive, <= i64 max), fee fields (U32/i64 bounds), and destination (StrKey) before conversion (transaction_builder.ts:725-768)"

[[sanitizer_guarantees]]
kind = "signature_verification"
guarantee = "authorizeEntry verifies the signer signature via Keypair.verify before converting public_key/signature via nativeToScVal (auth.ts:193-213)"

[[blockers]]
kind = "trust_boundary"
guarantee = "no remote/attacker-controlled native value or type tag reaches the forward nativeToScVal sinks on these routes; inputs are caller method parameters or source-account credentials"
```
