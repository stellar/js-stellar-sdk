# F926: Path blocked: remote WASM-hash fetch decodes attacker XDR via fromXDR

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/926-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`getRemoteWasmFromHash -> fromXDR`

Area seed targets: `getRemoteWasmFromHash`, `xdr.Hash.fromXDR`, `fromXDR`
(spec/WASM decode), `<anonymous>`. Trust boundary
`contract_spec_or_rpc_server`, auth none, protocol phase binding generation.

## Blocker

The repo-local decoders on this route are bounds-checked and advance-or-throw,
so an untrusted RPC/contract returning malformed bytes produces a thrown
`WasmFetchError`/decode error rather than a material wrong-result or unbounded
decode. `xdr.Hash.fromXDR(hashBuffer,"raw")` decodes a fixed 32-byte opaque;
`parseWasmCustomSections` guards every read with an `offset+length >
byteLength` overflow check and caps LEB128 at 32 bits; the section loop strictly
advances each iteration so it cannot spin; `processSpecEntryStream` reads each
`xdr.ScSpecEntry` via a union discriminant that consumes >=4 bytes or throws,
so no zero-width/infinite loop exists. The only material weaknesses on this
exact sink — missing sha256/hash-equality verification of returned WASM bytes,
and downstream UDT name collision / no de-dup in type generation — are already
VIABLE prior findings, not distinct new vulnerabilities.

## Evidence

- `src/bindings/wasm_fetcher.ts:37` - `xdr.Hash.fromXDR(hashBuffer,"raw")` fixed 32-byte opaque; over/under length throws (prior [2] NOT_VIABLE).
- `src/bindings/wasm_fetcher.ts:53-54` - returns `contractCode.code()` bytes with no size or hash-integrity check (already VIABLE prior [1]; not re-reported).
- `src/contract/utils.ts:110-115` - `read()` throws "Buffer overflow" on any out-of-range slice, bounding every section/name/payload read.
- `src/contract/utils.ts:128-138` - `readVarUint32` throws once shift reaches 32 bits, capping section/name lengths.
- `src/contract/utils.ts:145-172` - section loop advances `offset=start+sectionLength` after consuming >=2 header bytes, so it always progresses and exits on oversized lengths.
- `src/contract/utils.ts:181-189` - `processSpecEntryStream` loops `xdr.ScSpecEntry.read` which reads a >=4-byte union discriminant (advance-or-throw); count bounded by buffer length.
- `src/contract/spec.ts:520-537` - Buffer/string constructor routes both through `processSpecEntryStream`; no decode-time integrity check added here.

## Negative Scope

- Rules out: a distinct XDR decode-integrity or decode-bounds vulnerability at the `fromXDR` sink (`xdr.Hash.fromXDR`, `parseWasmCustomSections`, `processSpecEntryStream`/`ScSpecEntry.read`) producing a material wrong-result or infinite/zero-width decode loop from attacker-controlled WASM/spec bytes.
- Does not rule out: (a) missing WASM-bytes hash/integrity verification (prior VIABLE route_id js-sdk-0283c3cad484b8dcb342fe0f); (b) downstream UDT name collision / no de-dup in TypeGenerator (prior VIABLE); (c) unbounded WASM/spec response size driving dev-time binding-generation memory/CPU growth — left open but assessed local-only/dev-time (below Medium floor), RPC `getLedgerEntries` response-size handling not traced within budget.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-a0f8ceeb9ef88e7b53029acf"
weakness = "XDR decode of attacker-controlled bytes"
record_kind = "area_seed"
path = ["getRemoteWasmFromHash", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["getRemoteWasmFromHash", "xdr.Hash.fromXDR", "parseWasmCustomSections", "processSpecEntryStream"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["xdr_decode_bounds_guarded_on_remote_wasm_spec"]
rules_out = ["distinct decode-integrity or decode-bounds vuln at the fromXDR sink for remote WASM/spec bytes during binding generation"]
does_not_rule_out = ["missing sha256/hash-equality verification of returned WASM bytes (prior VIABLE)", "downstream UDT name collision / no de-dup in TypeGenerator (prior VIABLE)", "unbounded WASM/spec response size resource growth, dev-time only"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Remote WASM-hash fetch feeds attacker bytes into Hash.fromXDR, parseWasmCustomSections, and ScSpecEntry decode; all repo-local decoders are bounds-checked and advance-or-throw, so malformed bytes throw rather than yield a distinct material decode-integrity effect."
why_failed_brief = "decode sinks are bounds-guarded and advance-or-throw; the only material weaknesses on this sink are already VIABLE prior findings, so no distinct vuln remains at fromXDR."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "utils.ts:110-115 read() throws on any out-of-range slice and readVarUint32 caps lengths at 32 bits, bounding every WASM section/name/payload read"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "wasm_fetcher.ts:37 xdr.Hash.fromXDR decodes a fixed 32-byte opaque; over/under length throws WasmFetchError"

[[blockers]]
kind = "invariant"
guarantee = "utils.ts:145-172 section loop advances >=2 header bytes per iteration and utils.ts:181-189 ScSpecEntry union read consumes >=4-byte discriminant or throws, so the decode cannot infinite-loop or process a zero-width entry"
```
