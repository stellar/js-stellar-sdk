# F921: Path blocked: RPC Buffer.from buffer-decode across claimable-balance and wasm-hash entries

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/921-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`getClaimableBalance -> Buffer.from` (area seed; siblings `getContractWasmByHash`, `getContractWasmByContractId`, `<anonymous>`)

## Blocker

The seed premise — remote-response identifier/hash bytes reaching `Buffer.from` without length/shape validation — does not hold on this route. Every `Buffer.from` decode in this sibling set is fed by **caller-supplied** input, not remote response. In `getClaimableBalance` (server.ts:308-343) the only `Buffer.from` is the constant `"\x00\x00\x00"` version pad; `id` flows through `StrKey.decodeClaimableBalance` or `xdr.ClaimableBalanceId.fromXDR`, both of which validate/throw on malformed input. In `getContractWasmByHash` (server.ts:596-621) `Buffer.from(wasmHash, format)` runs only for a caller string; a wrong-length hash buffer is a fixed-opaque `Hash` field and throws at `k.toXDR("base64")` encode in `_getLedgerEntries` (server.ts:661-670) before any remote round-trip. The remote-derived hash in `getContractWasmByContractId` (server.ts:551-570) arrives already XDR-decoded as a `Buffer` via `.wasmHash()` and bypasses `Buffer.from` entirely.

## Evidence

- `src/rpc/server.ts:308-343` - `getClaimableBalance` decodes caller-supplied `id`; `Buffer.from` is only the constant version pad; StrKey/fromXDR validate shape.
- `src/rpc/server.ts:596-621` - `getContractWasmByHash` calls `Buffer.from` only on a caller string; remote `wasmHash` (Buffer) skips it; result fed to fixed-opaque `LedgerKeyContractCode.hash`.
- `src/rpc/server.ts:551-570` - `getContractWasmByContractId` derives `wasmHash` from remote response as an already-XDR-typed `Buffer`, passed directly without `Buffer.from`.

## Negative Scope

- Rules out: remote-response identifier/hash bytes reaching a `Buffer.from` decode that produces a wrong-shaped ledger-key/hash buffer on the claimable-balance and contract-wasm-hash entry points (remote bytes arrive pre-decoded as XDR Buffers; caller-string decodes are StrKey/fixed-opaque validated and throw on malformed length).
- Does not rule out: (a) the absence of a sha256-vs-requested-hash check on `getContractWasmByHash`/`getContractWasmByContractId` return values (a malicious RPC server can return wasm bytes not matching the requested hash) — a content-integrity weakness distinct from buffer-decode, related to prior VIABLE route `js-sdk-f7107932d67c6535c2ca097a` on `wasm_fetcher.ts`; (b) the unanchored regexes `/[a-f0-9]{72}/i` and `/[a-f0-9]{64}/i` at server.ts:325,327 accepting an `id` that merely contains a hex run, a caller-input parser-ambiguity below the Medium floor.

## Per-Target Disposition

- `getClaimableBalance`: caller-supplied `id`; `Buffer.from` is a constant; StrKey/fromXDR validate. No remote-fed decode. Blocked.
- `getContractWasmByHash`: `Buffer.from` only on caller string; wrong length throws at fixed-opaque XDR encode. Remote path skips `Buffer.from`. Blocked for buffer-decode; content-hash gap left open in `does_not_rule_out`.
- `getContractWasmByContractId`: remote `wasmHash` arrives as XDR-typed Buffer; no `Buffer.from`. Blocked.
- `<anonymous>`: no distinct `Buffer.from` decode sink surfaced beyond the above on this route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-07f16dc9add83b62527fdaf9"
weakness = "encoding / buffer-decode integrity"
record_kind = "area_seed"
path = ["getClaimableBalance", "Buffer.from"]
sink = "Buffer.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["getClaimableBalance", "Buffer.from", "getContractWasmByHash", "getContractWasmByContractId"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["remote_bytes_do_not_reach_buffer_from_arrive_predecoded_xdr", "caller_string_decode_strkey_or_fixed_opaque_validated"]
rules_out = ["remote-response identifier/hash bytes reaching Buffer.from to produce a wrong-shaped ledger-key or hash buffer on getClaimableBalance / getContractWasmByHash / getContractWasmByContractId"]
does_not_rule_out = ["missing sha256-vs-requested-hash verification of wasm bytes returned by getContractWasmByHash/getContractWasmByContractId (content-integrity, see route js-sdk-f7107932d67c6535c2ca097a)", "unanchored hex regex at server.ts:325,327 accepting caller id containing a hex run (caller-input parser ambiguity, below Medium)"]
assumptions = ["LedgerKeyContractCode.hash is a fixed 32-byte opaque XDR field whose encode rejects wrong-length buffers", "no additional assumptions beyond cited source evidence"]
mechanism_brief = "Buffer.from decodes in the claimable-balance and contract-wasm-hash entry points are fed only by caller-supplied input (or a constant pad); remote-derived hash bytes arrive already XDR-decoded as Buffers and bypass Buffer.from, and wrong-length caller buffers throw at StrKey validation or fixed-opaque XDR encode."
why_failed_brief = "remote bytes never reach Buffer.from on this route; caller-string decodes are StrKey/fixed-opaque validated, so no buffer-decode integrity break is reachable from the remote trust boundary"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "getClaimableBalance validates id via StrKey.isValidClaimableBalance / xdr.ClaimableBalanceId.fromXDR, which throw on malformed shape; Buffer.from there is only a constant version pad"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "wrong-length wasm hash buffer is a fixed-opaque Hash field and throws at k.toXDR(\"base64\") encode in _getLedgerEntries before any remote round-trip"

[[blockers]]
kind = "trust_boundary"
guarantee = "remote-response wasm hash arrives already XDR-decoded as a Buffer via .wasmHash() and is passed directly to getContractWasmByHash, never reaching Buffer.from"
```
