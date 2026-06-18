# F9243: Path blocked: attacker-controlled XDR decode during binding generation

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/9243-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> fromXDR`

Concretely: `processSpecEntryStream(buffer)` (`src/contract/utils.ts:181-189`) drives
`xdr.ScSpecEntry.read(cereal.XdrReader)` over attacker-controlled spec/WASM bytes
fetched via RPC during binding generation, before the decoded shape feeds the
TypeScript generators.

## Blocker

Every variable-length field in the ScSpec type tree is hard-capped, so a malicious
4-byte length prefix cannot drive amplified work or allocation. Each
`xdr.varArray` in the ScSpec definitions carries an explicit small `maxLength`
(`ScSpecTypeTuple` 12, `ScSpecUdtStructV0.fields` 40, union/enum `cases` 50,
`ScSpecFunctionV0.inputs` 10 / `outputs` 1, `prefixTopics` 2), and `VarArray.read`
rejects any `length > maxLength` before `new Array(length)`; all ScSpec strings are
length-capped (`SC_SPEC_DOC_LIMIT`, 80, 60). `XdrReader.advance` throws on any read
past the buffer boundary, and `XdrReader.read` returns a `subarray` view (no
per-length allocation). This closes the nested var-length / zero-width-child
CPU-amplification dimension left open by prior records, which only covered the
top-level `ScSpecEntry` loop and recursive `ScSpecTypeDef` stack depth.

## Per-Target Disposition (area_seed)

- `<anonymous>` (entry: `processSpecEntryStream` / `fromXDR` caller): bounded —
  top-level loop consumes a >=4-byte ScSpecEntry union discriminant per iteration
  or throws (prior [2]); no zero-width/infinite decode.
- `fromXDR` (sink: `xdr.ScSpecEntry.read` via `cereal.XdrReader`): bounded — all
  nested var-length fields capped (this record); reads bounds-checked and
  allocation-free; deep recursive `ScSpecTypeDef` nesting yields a catchable,
  linear-work `RangeError` already adjudicated below Medium (prior [1]).

## Evidence

- `src/contract/utils.ts:181-189` - `processSpecEntryStream` loops `ScSpecEntry.read` until `XdrReader.eof`; each entry consumes the union discriminant or throws.
- `@stellar/stellar-base lib/generated/curr_generated.js:8315-8620` - all ScSpec `varArray` fields declared with explicit small `maxLength` (12/40/50/10/1/2) and strings with explicit caps.
- `@stellar/js-xdr src/var-array.js:read` - `length > maxLength` throws before `new Array(length)`; the per-element loop reads bounds-checked children (no zero-width child in the capped ScSpec tree).
- `@stellar/js-xdr src/serialization/xdr-reader.js:advance/read` - read cursor throws on buffer overrun and returns a `subarray` view, so a large length prefix allocates nothing and cannot amplify.

## Negative Scope

- Rules out: nested var-length / zero-width-child CPU or memory amplification, length-prefix over-allocation, and uncapped-array decode at `fromXDR`/`ScSpecEntry.read` during binding generation as a Medium+ finding.
- Does not rule out: downstream type-confusion / identifier-injection in the TypeScript generators (`sanitizeIdentifier`, TypeGenerator/ClientGenerator) consuming the decoded-but-attacker-controlled spec names/types — a different sink, not this XDR-decode boundary.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-2c1fa47cdec31c940fd6e54c"
weakness = "XDR parse integrity"
record_kind = "area_seed"
path = ["<anonymous>", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["<anonymous>", "fromXDR", "src/contract/utils.ts:processSpecEntryStream"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["scspec_varlength_fields_explicitly_capped", "xdr_read_bounds_checked_alloc_free_subarray"]
rules_out = ["nested var-length / zero-width-child CPU or memory amplification and length-prefix over-allocation at fromXDR/ScSpecEntry.read during binding generation as a Medium+ finding"]
does_not_rule_out = ["downstream TypeScript-generator type-confusion or identifier-injection consuming decoded attacker-controlled spec names/types (sanitizeIdentifier/TypeGenerator), a distinct sink"]
assumptions = ["no additional assumptions beyond cited source evidence", "stellar-base ScSpec varArray/string caps and js-xdr reader semantics match the version pinned by this repo"]
mechanism_brief = "Binding generation decodes attacker-controlled XDR via processSpecEntryStream/ScSpecEntry.read; every ScSpec var-length field is hard-capped and XdrReader reads are bounds-checked and allocation-free, so no length-prefix amplification."
why_failed_brief = "All nested var-length ScSpec fields carry explicit small maxLength caps and strings are length-capped; VarArray.read rejects oversize lengths before allocation and XdrReader.read returns a bounds-checked subarray, so a malicious length prefix cannot amplify work or memory."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "bounds_cap"
guarantee = "Every ScSpec varArray declares an explicit small maxLength (12/40/50/10/1/2) and VarArray.read throws when length exceeds it before new Array(length); ScSpec strings are length-capped (SC_SPEC_DOC_LIMIT/80/60)."

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "XdrReader.advance throws on any read past the buffer boundary and XdrReader.read returns a subarray view, so a large length prefix allocates nothing."

[[blockers]]
kind = "bounds_cap"
guarantee = "Capped nested var-length fields plus allocation-free bounds-checked reads make the fromXDR/ScSpecEntry.read decode strictly linear in buffer size with no length-prefix amplification."
```
