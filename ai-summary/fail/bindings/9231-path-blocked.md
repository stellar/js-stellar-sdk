# F9231: Path blocked: attacker-controlled XDR Hash decode during WASM-hash binding fetch

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/9231-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> xdr.Hash.fromXDR`

Concrete callers of the sink `getRemoteWasmFromHash -> xdr.Hash.fromXDR(hashBuffer, "raw")`:
- `fetchFromWasmHash` (developer-supplied hex hash)
- `fetchWasmFromContract` (RPC-supplied contract instance executable)

## Blocker

`xdr.Hash` is a fixed 32-byte opaque; `xdr.Hash.fromXDR(hashBuffer, "raw")`
reads exactly 32 bytes and throws on any over/under-length input. Both call
sites supply a 32-byte buffer that is already validated or structurally
guaranteed: `fetchFromWasmHash` rejects any non-32-byte buffer before the sink
(`wasm_fetcher.ts:124-129`), and `fetchWasmFromContract` passes
`instance.executable().wasmHash()`, an already XDR-decoded `xdr.Hash` whose
32-byte length was enforced when `getLedgerEntries` decoded the ledger entry.
Any decode error is caught and rethrown as `WasmFetchError`
(`wasm_fetcher.ts:55-60`), producing only a fail-closed error and no material
security effect. A malicious RPC also already controls the returned `code()`
bytes, so manipulating the hash adds no surface.

## Evidence

- `src/bindings/wasm_fetcher.ts:37` - sink `xdr.Hash.fromXDR(hashBuffer, "raw")` decodes a fixed 32-byte opaque.
- `src/bindings/wasm_fetcher.ts:124-129` - `fetchFromWasmHash` rejects any buffer whose length != 32 before the sink.
- `src/bindings/wasm_fetcher.ts:101-102` - `fetchWasmFromContract` passes `instance.executable().wasmHash()`, an already-decoded fixed-length `xdr.Hash`.
- `src/bindings/wasm_fetcher.ts:55-60` - any non-`WasmFetchError` from decode is caught and rethrown as `WasmFetchError`, fail-closed.

## Negative Scope

- Rules out: a non-32-byte or shape-confused buffer reaching `xdr.Hash.fromXDR` during remote WASM-by-hash binding fetch, and any length/shape-confusion decode-integrity effect at that sink.
- Does not rule out: distinct decode-integrity issues at sibling bindings sinks such as recursive `ScSpecTypeDef`/`ScSpecEntry` decode in `processSpecEntryStream`, or identifier-collision in generated TypeScript; those are separate routes.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-e7f284422e64462425cb9d4b"
weakness = "parse integrity of attacker-supplied XDR during binding generation"
record_kind = "area_seed"
path = ["<anonymous>", "xdr.Hash.fromXDR"]
sink = "xdr.Hash.fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/bindings/wasm_fetcher.ts:getRemoteWasmFromHash", "src/bindings/wasm_fetcher.ts:fetchFromWasmHash", "src/bindings/wasm_fetcher.ts:fetchWasmFromContract"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["hash_length_shape_validation_bypass_at_xdr_Hash_fromXDR"]
rules_out = ["non-32-byte or shape-confused buffer reaching xdr.Hash.fromXDR during remote WASM-by-hash binding fetch; both call sites supply a validated or structurally-guaranteed 32-byte hash and any decode error is caught as WasmFetchError"]
does_not_rule_out = ["recursive ScSpecTypeDef/ScSpecEntry decode at fromXDR/processSpecEntryStream", "generated TypeScript identifier collision via sanitizeIdentifier"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "WASM-hash binding fetch decodes a hash via xdr.Hash.fromXDR(hashBuffer, 'raw'); the sink is a fixed 32-byte opaque, both callers supply a length-validated or already-XDR-decoded 32-byte hash, and decode errors are caught and rethrown as WasmFetchError."
why_failed_brief = "fixed 32-byte opaque decode with both call sites supplying validated/structurally-guaranteed 32-byte input; wrong length throws fail-closed as WasmFetchError with no material effect, confirmed from source."
confidence = "high"

[[sanitizer_guarantees]]
kind = "length_check"
guarantee = "fetchFromWasmHash rejects any buffer whose length != 32 before the sink (wasm_fetcher.ts:124-129); fetchWasmFromContract supplies an already-XDR-decoded fixed-length xdr.Hash."

[[sanitizer_guarantees]]
kind = "fixed_opaque_decode"
guarantee = "xdr.Hash is a fixed 32-byte opaque; xdr.Hash.fromXDR(...,'raw') reads exactly 32 bytes and throws on any other length."

[[blockers]]
kind = "fail_closed_catch"
guarantee = "any non-WasmFetchError thrown by the decode is caught and rethrown as WasmFetchError (wasm_fetcher.ts:55-60), yielding no material security effect."
```
