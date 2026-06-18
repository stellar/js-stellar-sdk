# F9189: Path blocked: attacker-controlled XDR decode during binding generation

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/9189-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> fromXDR` (area seed; targets `<anonymous>`, `fromXDR`, `xdr.Hash.fromXDR`)

## Per-Target Disposition

- **`xdr.Hash.fromXDR`** (`src/bindings/wasm_fetcher.ts:37`): a fixed `Opaque(32)`
  decode of `hashBuffer` for `"raw"`. The only two producers are safe.
  `fetchFromWasmHash` decodes a caller-supplied hex string and rejects anything
  whose byte length is not exactly 32 *before* the decode
  (`wasm_fetcher.ts:124-128`). `fetchWasmFromContract` passes
  `instance.executable().wasmHash()` (`wasm_fetcher.ts:101-102`), which is
  already a validated 32-byte `xdr.Hash` read from the remote ledger entry, so
  re-decoding through `xdr.Hash.fromXDR` only re-validates the fixed length. A
  fixed-opaque `fromXDR` throws on any non-32-byte input and on trailing bytes,
  and the surrounding `try/catch` wraps the throw in `WasmFetchError`
  (`wasm_fetcher.ts:55-60`). Fail-closed; no parse-integrity or bounds bypass.

- **`fromXDR` / spec-stream decode** (`<anonymous>` -> spec parsing): re-proven
  from source. `parseWasmCustomSections` advances at least 2 bytes per loop
  iteration (1-byte `sectionId` + >=1-byte LEB128 `sectionLength`) and then
  jumps `offset = start + sectionLength`; the `read()` helper has an explicit
  `offset + length > buffer.byteLength` bound check
  (`src/contract/utils.ts:110-115,145-172`). `processSpecEntryStream` reads
  `xdr.ScSpecEntry` until `XdrReader.eof`; each entry consumes a >=4-byte union
  discriminant or throws (`src/contract/utils.ts:181-189`). No infinite loop,
  no zero-width entry, no out-of-bounds read. This re-confirms prior record
  `js-sdk-a0f8ceeb9ef88e7b53029acf` from current source.

## Blocker

Every decode sink reachable from binding generation is bounded and fail-closed.
`xdr.Hash.fromXDR` is a fixed 32-byte opaque whose two producers each guarantee
or re-validate the length, so a wrong length throws a caught `WasmFetchError`
rather than mis-decoding. The WASM custom-section scanner advances a strictly
positive number of bytes per iteration and bounds every `read`, and the
`ScSpecEntry` stream reader consumes a discriminant-bearing union per entry or
throws, so the decode terminates without an infinite loop, zero-width entry, or
OOB access. The only decode dimension left open beyond prior memory — recursive
decode of self-referential `ScSpecTypeDef` (Vec/Map/Tuple/Option/Result) and the
mirrored recursion in `parseTypeFromTypeDef` — does only linear work in input
size and terminates in a catchable `RangeError`, i.e. fail-closed below the
Medium floor.

## Evidence

- `src/bindings/wasm_fetcher.ts:35-39` - `xdr.Hash.fromXDR(hashBuffer,"raw")` is a fixed 32-byte opaque decode.
- `src/bindings/wasm_fetcher.ts:124-128` - caller-supplied hash rejected unless byte length is exactly 32 before decode.
- `src/bindings/wasm_fetcher.ts:101-102,55-60` - contract-path hash is an already-validated `xdr.Hash`; any decode throw is caught and wrapped.
- `src/contract/utils.ts:110-115,145-172` - bounds-checked `read`; section loop advances >=2 bytes/iteration and jumps to section end.
- `src/contract/utils.ts:181-189` - `ScSpecEntry.read` loop bounded by `XdrReader.eof`; each entry consumes a discriminant or throws.
- `src/bindings/utils.ts:101-201` - `parseTypeFromTypeDef` recursion on nested type defs is linear and terminates (catchable stack overflow only).

## Negative Scope

- Rules out: a distinct decode-integrity, decode-bounds, infinite-loop,
  zero-width-entry, or fixed-opaque length-confusion vulnerability at the
  `fromXDR` / `xdr.Hash.fromXDR` sinks reachable during binding generation.
- Does not rule out: (a) downstream type-generator identifier collision / type
  misrepresentation from sanitized attacker UDT names (covered by prior
  `js-sdk-764db1ecd1a0b26cd4288e42` and `js-sdk-310bbe7b42cb719afc52c1fd`);
  (b) catchable stack-overflow DoS from recursive nested `ScSpecTypeDef` decode,
  which is linear-work and fail-closed (below Medium).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-2c1fa47cdec31c940fd6e54c"
weakness = "parse integrity of decoded XDR"
record_kind = "area_seed"
path = ["<anonymous>", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["<anonymous>", "fromXDR", "xdr.Hash.fromXDR"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["xdr_decode_bounds_guarded_on_remote_wasm_spec", "fixed_opaque_length_validated_on_hash_decode"]
rules_out = ["distinct decode-integrity, decode-bounds, infinite-loop, zero-width-entry, or fixed-opaque length-confusion vuln at fromXDR/xdr.Hash.fromXDR sinks reachable during binding generation"]
does_not_rule_out = ["downstream type-generator identifier collision / type misrepresentation from sanitized attacker UDT names", "catchable linear-work stack-overflow DoS from recursive nested ScSpecTypeDef decode (below Medium)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Binding generation decodes attacker XDR via xdr.Hash.fromXDR (fixed 32-byte opaque, length-validated), the WASM custom-section scanner (bounds-checked, >=2 bytes/iter), and ScSpecEntry stream reads (discriminant-consuming or throw); all decode sinks are bounded and fail-closed."
why_failed_brief = "All reachable decode sinks are bounded and fail-closed; only open dimension is a catchable linear-work recursion DoS below the Medium severity floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "length_validation"
guarantee = "xdr.Hash.fromXDR is a fixed Opaque(32); producers validate or pre-validate 32-byte length and any wrong length throws a caught WasmFetchError (wasm_fetcher.ts:37,124-128,101-102)"

[[sanitizer_guarantees]]
kind = "bounds_check"
guarantee = "parseWasmCustomSections read() enforces offset+length<=byteLength and the section loop advances >=2 bytes per iteration (contract/utils.ts:110-115,145-172)"

[[blockers]]
kind = "decode_terminates"
guarantee = "processSpecEntryStream reads ScSpecEntry until XdrReader.eof; each entry consumes a >=4-byte discriminant union or throws, so no zero-width/infinite decode (contract/utils.ts:181-189)"
```
