# F9237: Path blocked: generated-client spec entry XDR re-serialization

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/9237-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> entry.toXDR`

Area seed targets `<anonymous>`, `toXDR`, `entry.toXDR` all resolve to the single
serialization sink at `client.ts:43-44`; there is no other `toXDR` call site in
`src/bindings`. Per-target disposition is shared: the sink is a faithful
canonical XDR forwarder.

## Blocker

`ClientGenerator.generate` interpolates each spec entry into generated source
only as `"${entry.toXDR("base64")}"` (client.ts:43-44). `this.spec.entries` are
already-decoded `xdr.ScSpecEntry[]` (spec.ts:495, 520-535), so `toXDR("base64")`
is a canonical, lossless XDR re-encode of a previously validated entry. The
output is restricted to the base64 alphabet `[A-Za-z0-9+/=]`, which cannot
contain a double-quote, backslash, or newline and therefore cannot escape the
surrounding string literal (no TS injection), and the canonical roundtrip cannot
alter the serialized bytes (no serialization-integrity corruption at this sink).
The sink only forwards spec content; any type-misrepresentation malice lives in
the spec content and materializes downstream at runtime, not in `entry.toXDR`.

## Evidence

- `src/bindings/client.ts:43-44` - each entry reaches generated source solely as a base64 string literal `"${entry.toXDR("base64")}"`.
- `src/contract/spec.ts:495,520-535` - `entries` are decoded `xdr.ScSpecEntry[]` (via `processSpecEntryStream`/`ScSpecEntry.fromXDR`), so re-encode is a canonical lossless roundtrip of validated XDR.
- `src/bindings/*` grep - `client.ts:44` is the only `toXDR` sink in the bindings generator; no alternate non-base64 entry-serialization path exists.

## Negative Scope

- Rules out: attacker-shaped spec entry injecting TypeScript into, or corrupting the serialization integrity of, the generated client via `entry.toXDR("base64")` re-serialization in `ClientGenerator.generate`.
- Does not rule out: runtime type-confusion from a tampered spec downstream of binding generation — result decoding via `Spec.funcResToNative`/`scValToNative` (already tracked VIABLE) and the distinct inbound argument-encoding route via `Spec.nativeToScVal` during transaction building, where misrepresented declared types could change encoded contract arguments.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-a81567cffe291c84348a5355"
weakness = "Transaction integrity / serialization"
record_kind = "area_seed"
path = ["<anonymous>", "entry.toXDR"]
sink = "entry.toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["<anonymous>", "toXDR", "entry.toXDR", "ClientGenerator.generate"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["base64_charset_cannot_escape_string_literal", "canonical_xdr_roundtrip_lossless_no_serialization_corruption"]
rules_out = ["attacker-shaped spec entry injecting TS into or corrupting serialization integrity of the generated client via entry.toXDR base64 re-serialization in ClientGenerator.generate"]
does_not_rule_out = ["runtime type-confusion from tampered spec via Spec.scValToNative result decoding (tracked VIABLE)", "distinct inbound argument-encoding type-confusion via Spec.nativeToScVal during transaction building"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "entry.toXDR(base64) emits only base64-alphabet bytes inside a quoted string literal and canonically lossless re-encodes already-decoded xdr.ScSpecEntry, so it neither injects TS nor corrupts serialized integrity; it is a faithful forwarder of spec content."
why_failed_brief = "source-confirmed base64-charset and canonical-roundtrip blocker holds for this exact sink; bypass via alternate non-base64 entry-serialization path does not exist in bindings."
confidence = "high"

[[sanitizer_guarantees]]
kind = "encoding_charset"
guarantee = "entry.toXDR(\"base64\") output is restricted to [A-Za-z0-9+/=] and cannot contain quote/backslash/newline to escape the surrounding string literal (client.ts:44)"

[[sanitizer_guarantees]]
kind = "canonical_roundtrip"
guarantee = "entries are decoded xdr.ScSpecEntry re-encoded losslessly, so serialized bytes are unchanged (spec.ts:495,520-535)"

[[blockers]]
kind = "charset_confinement"
guarantee = "no non-base64 entry-serialization sink exists in src/bindings; client.ts:44 is the only toXDR forwarder and is charset-confined"
```
