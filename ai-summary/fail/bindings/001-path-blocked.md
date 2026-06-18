# F001: Path blocked: Remote WASM-by-hash fetch xdr.Hash.fromXDR decode

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/001-path-seed.md
**Verdict**: NOT_VIABLE
**Hypothesis by**: claude-opus-4-8, high

## Path Checked

`getRemoteWasmFromHash -> xdr.Hash.fromXDR`

## Blocker

`xdr.Hash.fromXDR(hashBuffer, "raw")` (src/bindings/wasm_fetcher.ts:37) is a
fixed 32-byte opaque decode, and both — and the only two — call sites supply a
buffer that is already exactly 32 bytes. The string-hash caller
`fetchFromWasmHash` validates `Buffer.from(wasmHash,"hex").length !== 32` and
throws before the decode (lines 125-128). The contract-instance caller
`fetchWasmFromContract` passes `instance.executable().wasmHash()` (line 101-102),
an `xdr.Hash` already decoded as a fixed 32-byte opaque from the
`ScContractInstance`. A wrong-length buffer can only raise a `WasmFetchError`
that is caught and rethrown (lines 55-60, 135-139); there is no length/shape
confusion with a material security effect at this sink.

## Per-target Disposition (area_seed)

- `getRemoteWasmFromHash`: private, only two internal callers; both feed a
  validated/structural 32-byte hash. No external/unguarded caller.
- `xdr.Hash.fromXDR` / `fromXDR`: fixed-32 opaque decode; over/under-length
  input throws and is caught. No silent type/shape confusion exploitable here.
- `<anonymous>`: no distinct anonymous decode site found on this path.

## Evidence

- `src/bindings/wasm_fetcher.ts:29-39` - `getRemoteWasmFromHash` builds the
  ledger key with `xdr.Hash.fromXDR(hashBuffer, "raw")`; sink consumes the
  passed buffer only.
- `src/bindings/wasm_fetcher.ts:124-132` - `fetchFromWasmHash` enforces exactly
  32-byte length before calling `getRemoteWasmFromHash`.
- `src/bindings/wasm_fetcher.ts:101-102` - `fetchWasmFromContract` passes a
  decoded fixed-32 `executable().wasmHash()` into the same function.

## Negative Scope

- Rules out: length/shape-validation bypass at `xdr.Hash.fromXDR` during remote
  WASM-by-hash fetch (both call sites supply guaranteed 32-byte input).
- Does not rule out: the attacker-controlled WASM **bytes** returned by
  `server.getLedgerEntries` (wasm_fetcher.ts:42,54,84) flowing downstream into
  spec extraction / TypeScript binding generation (distinct route family,
  partially covered by prior VIABLE spec-decode findings on
  js-sdk-26a2c419baf9cb084b019288); and unbounded WASM size from a malicious
  RPC response copied at `Buffer.from(contractCode.code())` (line 54) as a
  downstream resource concern.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-0283c3cad484b8dcb342fe0f"
weakness = "XDR decode integrity"
record_kind = "area_seed"
path = ["getRemoteWasmFromHash", "xdr.Hash.fromXDR"]
sink = "xdr.Hash.fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["getRemoteWasmFromHash", "xdr.Hash.fromXDR", "<anonymous>", "fromXDR"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["hash_length_shape_validation_bypass_at_xdr_Hash_fromXDR"]
rules_out = ["xdr.Hash.fromXDR receives a non-32-byte or shape-confused buffer during remote WASM-by-hash fetch; both call sites supply a validated or structurally-guaranteed 32-byte hash"]
does_not_rule_out = ["attacker-controlled WASM bytes from getLedgerEntries flowing into spec/TypeScript binding generation", "unbounded WASM size from a malicious RPC response copied at Buffer.from(contractCode.code())"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Remote WASM-by-hash fetch builds a LedgerKey via xdr.Hash.fromXDR; both callers pass an exactly-32-byte hash (length-validated string path or decoded fixed-32 opaque from contract instance)."
why_failed_brief = "Sink decodes a fixed 32-byte opaque; string caller validates length to 32 before the call and contract-instance caller passes an already-decoded 32-byte Hash, so no length/shape confusion with material effect; wrong length only throws a caught WasmFetchError."
confidence = "high"

[[sanitizer_guarantees]]
kind = "length_check"
guarantee = "fetchFromWasmHash rejects any hex hash not decoding to exactly 32 bytes before getRemoteWasmFromHash (wasm_fetcher.ts:125-128)"

[[sanitizer_guarantees]]
kind = "type_invariant"
guarantee = "fetchWasmFromContract passes executable().wasmHash(), a fixed 32-byte opaque already decoded from ScContractInstance (wasm_fetcher.ts:101-102)"

[[blockers]]
kind = "fixed_width_decode"
guarantee = "xdr.Hash.fromXDR decodes a fixed 32-byte opaque; over/under-length input throws and is caught/rethrown as WasmFetchError, yielding no material security effect"
```
