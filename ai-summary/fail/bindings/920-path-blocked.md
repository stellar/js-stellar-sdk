# F920: Path blocked: contract spec entry re-serialization via entry.toXDR

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/920-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> entry.toXDR`

Concretely: `ClientGenerator.generate` maps each decoded `xdr.ScSpecEntry` to
`"${entry.toXDR("base64")}"` (client.ts:43-45) and embeds the array into the
emitted client as `new Spec([...])`, which at runtime re-decodes each string via
`xdr.ScSpecEntry.fromXDR(s, "base64")` (spec.ts:530-533).

## Blocker

The `entry.toXDR("base64")` sink is both injection-free and
integrity-preserving for this route. The emission site is `"${entry.toXDR("base64")}"`;
the standard base64 alphabet (`A-Za-z0-9+/=`) contains no `"`, `\`, backtick,
`$`, or newline, so the attacker-shaped entry cannot break out of the string
literal into executable TypeScript (re-derived from source; matches prior
record js-sdk-764db1ecd1a0b26cd4288e42). The serialization itself is a canonical
XDR `toXDR`/`fromXDR` round-trip over the already-decoded `ScSpecEntry`
(spec.ts:495,520-538), so re-serialization is lossless and introduces no
divergence, and no downstream spec hash/equality check exists for a
canonicalization difference to subvert. The remaining "attacker controls the
spec" effect is the contract's own declared interface and is faithfully carried,
not corrupted, by this sink.

## Evidence

- `src/bindings/client.ts:43-45` - entries re-serialized as `"${entry.toXDR("base64")}"`; base64 charset cannot escape the string literal.
- `src/contract/spec.ts:495,520-538` - `entries` is the decoded `xdr.ScSpecEntry[]`; runtime `new Spec([...])` re-decodes via `ScSpecEntry.fromXDR`, a lossless canonical XDR round-trip with no transform.
- `src/contract/spec.ts:544-547` - displayed types and runtime encoding both derive from the same faithful entries; `entry.toXDR` adds no divergence of its own.

## Negative Scope

- Rules out: attacker-shaped spec entries corrupting integrity of, or injecting executable TypeScript through, the `entry.toXDR("base64")` re-serialization sink in `ClientGenerator.generate`.
- Does not rule out: type-confusion between generated TS types (`parseTypeFromTypeDef`/`TypeGenerator`) and runtime `Spec` encoding, and identifier/UDT-name collision/shadow sinks already tracked as VIABLE on routes js-sdk-45bef61cba5cce008f254c75 and js-sdk-0283c3cad484b8dcb342fe0f; these are distinct downstream sinks, not the re-serialization sink.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-a81567cffe291c84348a5355"
weakness = "Serialization / Transaction Integrity"
record_kind = "area_seed"
path = ["<anonymous>", "entry.toXDR"]
sink = "entry.toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/bindings/client.ts:ClientGenerator.generate", "src/contract/spec.ts:Spec.constructor", "entry.toXDR"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["base64_charset_cannot_escape_string_literal", "canonical_xdr_roundtrip_lossless_no_downstream_integrity_check"]
rules_out = ["attacker-shaped spec entry corrupting integrity of or injecting TS through entry.toXDR base64 re-serialization in ClientGenerator.generate"]
does_not_rule_out = ["type confusion between parseTypeFromTypeDef-emitted TS types and runtime Spec encoding", "identifier/UDT-name collision or shadow sinks on routes js-sdk-45bef61cba5cce008f254c75 and js-sdk-0283c3cad484b8dcb342fe0f"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "entry.toXDR(base64) re-serializes already-decoded ScSpecEntry objects into a lossless canonical XDR string embedded in a double-quoted literal; base64 alphabet cannot break the literal and the round-trip introduces no divergence."
why_failed_brief = "base64 charset cannot escape the string literal and canonical XDR round-trip is lossless with no downstream spec integrity/hash check, so the re-serialization sink corrupts nothing and injects nothing."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "encoding_charset"
guarantee = "entry.toXDR(\"base64\") yields only [A-Za-z0-9+/=], none of which can escape the enclosing double-quoted TS string literal at client.ts:43-45"

[[sanitizer_guarantees]]
kind = "canonical_roundtrip"
guarantee = "ScSpecEntry toXDR/fromXDR is canonical XDR; the decode->re-serialize->re-decode round-trip is lossless and no downstream spec hash/equality check exists to subvert"

[[blockers]]
kind = "encoding_invariant"
guarantee = "base64 re-serialization of a decoded spec entry is injection-free and integrity-preserving on this route"
```
