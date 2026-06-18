# F007C1: Multiple contractspecv0 custom sections silently truncated to first

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/007-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The decode mechanism is exactly as described and is source-confirmed:

- `src/contract/utils.ts:162-164` — `parseWasmCustomSections` accumulates
  same-named custom sections: `sections.set(name, (sections.get(name) || []).concat(payload))`.
  `payload` is a `Uint8Array`; `Array.prototype.concat` does not spread a typed
  array (no `Symbol.isConcatSpreadable`), so a repeated section name yields
  `[payload0, payload1, ...]`.
- `src/contract/wasm_spec_parser.ts:10-16` — `specFromWasm` reads
  `customData.get("contractspecv0")` and returns `Buffer.from(xdrSections[0])`.
  Only index 0 is decoded; later same-named sections are discarded with no error.
- `src/bindings/generator.ts:125-128` — `fromWasm` builds the entire generator
  interface model from `new Spec(specFromWasm(wasmBuffer))`, i.e. from that single
  first-section buffer.

So a crafted WASM carrying two or more `contractspecv0` custom sections has every
section after the first dropped from the generated bindings. The mechanism is real.

## Why It Failed

The truncation produces **no material security effect beyond capability the
attacker already holds**, so it does not meet the Medium severity floor.

1. **The attacker already controls section 0 entirely.** The only way to trigger
   the truncation is to supply attacker-controlled WASM bytes (malicious RPC
   server returning unverified bytes, or a malicious contract author). Under that
   exact threat model the attacker already fully controls the content of the
   first `contractspecv0` section. Splitting a spec across sections and having the
   trailing ones dropped grants no misrepresentation power the attacker does not
   already have by writing the desired (misleading) spec directly into section 0.
   The simplest equivalent attack needs no second section at all — which means the
   truncation adds nothing the prior `no byte/hash verification` finding does not
   already cover.

2. **No honest producer emits multiple `contractspecv0` sections.** Canonical
   soroban tooling emits a single `contractspecv0` custom section, so no benign
   contract's complete spec is silently truncated. There is no innocent victim
   whose full interface is lost: the only inputs that trigger the path are
   hostile, and for hostile inputs item (1) applies.

3. **The concrete failure modes are non-deceptive.** Dropping trailing sections
   can only (a) omit functions/types — which the developer observes as absent
   methods on the typed client, not as a deceptive interface, or (b) leave a
   function in section 0 referencing a UDT defined only in a dropped section,
   producing a *dangling type reference* that fails TypeScript compilation. A
   broken build is loud/fail-safe, not a silent misrepresentation that drives
   unsafe signing or submission.

This is a correctness/robustness divergence from full-stream consumers, but it
is informational/Low in security terms (out of scope), and its only exploitable
condition (attacker-controlled bytes) is subsumed by the already-reported
no-hash-verification trust gap.

## What This Rules Out

The "multiple/split `contractspecv0` sections silently truncated to the first"
path, on the `fromWasmHash -> specFromWasm -> Buffer.from(xdrSections[0]) -> new Spec`
route, is ruled out as an independent Medium+ finding: the truncation grants no
misrepresentation capability beyond attacker control of section 0, and no honest
producer triggers it.

## What This Does Not Rule Out

- A spec-content vs WASM-code mismatch caused by unverified returned bytes
  remains a real defect, already covered by the prior VIABLE no-hash-verification
  finding (different route, separate report).
- UDT name collision / shadowing in `TypeGenerator` remains covered by the prior
  VIABLE finding.
- Distinct decode-integrity defects inside a *single* `contractspecv0` section
  (e.g. structural confusion within one valid section) are not assessed here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-45bef61cba5cce008f254c75"
weakness = "buffer decode / encoding integrity"
record_kind = "single_path"
path = ["fetchFromWasmHash", "specFromWasm", "Buffer.from"]
sink = "Buffer.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["src/contract/wasm_spec_parser.ts:specFromWasm", "src/contract/utils.ts:parseWasmCustomSections"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["truncation_grants_no_capability_beyond_attacker_controlled_section0", "no_honest_producer_emits_multiple_contractspecv0_sections"]
rules_out = ["silent truncation of trailing contractspecv0 sections grants no misrepresentation capability beyond the attacker's existing full control of section 0", "no benign/canonical producer emits multiple contractspecv0 sections, so no innocent complete spec is truncated"]
does_not_rule_out = ["spec-vs-code mismatch from unverified returned bytes (covered by prior no-hash-verification VIABLE finding)", "UDT name collision/shadowing in TypeGenerator (covered by prior VIABLE finding)", "decode-integrity defects within a single contractspecv0 section"]
assumptions = ["triggering the path requires attacker-controlled WASM bytes per the contract_spec_or_rpc_server trust boundary", "canonical soroban tooling emits a single contractspecv0 custom section"]
mechanism_brief = "parseWasmCustomSections concatenates same-named sections into a list but specFromWasm decodes only xdrSections[0]; later contractspecv0 sections are dropped. Real mechanism but no security-relevant misrepresentation: attacker already controls section 0 and honest producers emit one section; failure modes are missing methods or a fail-safe TS compile error."
why_failed_brief = "truncation adds no capability beyond attacker control of section 0 already established; no honest victim; failure modes non-deceptive; below Medium floor and subsumed by prior no-hash-verification trust gap."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/utils.ts:parseWasmCustomSections"
guarantee = "read() bounds-checks every slice and TextDecoder fatal:true rejects bad UTF-8 names, but neither validates section count/completeness; multiple contractspecv0 sections are accepted and accumulated"

[[blockers]]
kind = "scope_threshold"
source = "src/contract/wasm_spec_parser.ts:specFromWasm"
guarantee = "truncation only triggers under attacker-controlled bytes where section 0 is already fully attacker-defined, so it yields no material security effect distinct from the already-reported no-hash-verification finding"
```
