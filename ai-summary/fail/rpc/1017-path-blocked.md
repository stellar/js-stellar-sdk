# F1017: Path blocked: Claimable-balance / contract-wasm RPC buffer decode

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/1017-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`getClaimableBalance -> from`

Area seed; sibling targets `getClaimableBalance`, `getContractWasmByHash`,
`getContractWasmByContractId`, and the shared `parseRawLedgerEntries` decode
were all traced for a remote-bytes-into-`Buffer.from`/`fromXDR` buffer-decode
integrity weakness.

## Blocker

On every target the `Buffer.from` sink consumes only the **caller-supplied**
identifier/hash string, not remote response bytes: `getClaimableBalance`
decodes the caller `id` via `StrKey.decodeClaimableBalance` / `fromXDR(id,...)`
(server.ts:313-328), and `getContractWasmByHash` hits `Buffer.from(wasmHash,
format)` only on the `typeof wasmHash === "string"` branch with a caller string
and caller-chosen `format` (server.ts:600-603). Remote response bytes are
XDR-decoded exactly once in `parseRawLedgerEntries` (parsers.ts:149-150) and
reach the helpers only as already-structured objects through union accessors
(`.wasmHash()` server.ts:568, `.claimableBalance()` server.ts:339), bypassing
`Buffer.from`. A wrong-arm union value throws in the accessor rather than
producing a mis-shaped buffer. The one genuine remote-bytes weakness on this
sink (returned wasm not verified against the requested hash) is already
recorded VIABLE (js-sdk-0283c3ca) and is not re-reported.

## Evidence

- `src/rpc/server.ts:308-343` - `getClaimableBalance` Buffer.from operands are the caller `id` (StrKey decode / hex fromXDR); remote value arrives via `entry.val.claimableBalance()` predecoded.
- `src/rpc/server.ts:596-620` - `getContractWasmByHash` only calls `Buffer.from` on a caller string; remote wasm bytes returned directly as `.contractCode().code()` (already-decoded Buffer), no `Buffer.from`.
- `src/rpc/server.ts:551-570` - `getContractWasmByContractId` derives `wasmHash` from remote response via `.wasmHash()` (predecoded Buffer) and passes it straight through, skipping the `Buffer.from` branch.
- `src/rpc/parsers.ts:135-156` - `parseRawLedgerEntries` performs the single remote-bytes XDR decode (`LedgerEntryData.fromXDR(rawEntry.xdr,"base64")`); downstream helpers consume the typed object, not raw bytes.
- `src/rpc/server.ts:672-680` - `getLedgerEntry` funnels all three helpers through `parseRawLedgerEntries`, confirming the shared predecoded boundary.

## Negative Scope

- Rules out: remote RPC response bytes reaching a `Buffer.from`/`fromXDR` buffer-decode sink on `getClaimableBalance` / `getContractWasmByHash` / `getContractWasmByContractId` to construct a wrong-shaped ledger-key or hash buffer.
- Does not rule out: the already-VIABLE missing `sha256(returned_wasm)==requested_wasmHash` content-integrity weakness on returned wasm bytes (js-sdk-0283c3ca); and an unbounded single-response wasm/ledger-entry size on `.contractCode().code()` (server.ts:618) with no documented SDK size cap, which was not measured here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-2a92c91d0e625f07fc4bf775"
weakness = "buffer_decode"
record_kind = "area_seed"
path = ["getClaimableBalance", "from"]
sink = "from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["src/rpc/server.ts:getClaimableBalance", "src/rpc/server.ts:getContractWasmByHash", "src/rpc/server.ts:getContractWasmByContractId", "src/rpc/parsers.ts:parseRawLedgerEntries"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["caller_string_decode_strkey_or_fixed_opaque_validated", "remote_bytes_arrive_predecoded_xdr_not_buffer_from"]
rules_out = ["remote RPC response bytes reaching Buffer.from/fromXDR on getClaimableBalance/getContractWasmByHash/getContractWasmByContractId to produce a wrong-shaped ledger-key or hash buffer"]
does_not_rule_out = ["missing sha256(returned_wasm)==requested_wasmHash content-integrity check already recorded VIABLE js-sdk-0283c3ca", "unbounded single-response wasm/ledger-entry size at contractCode().code() server.ts:618 with no documented SDK cap"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "All Buffer.from sinks on the claimable-balance/contract-wasm lookup helpers consume caller-supplied identifier/hash strings; remote response bytes are XDR-decoded once in parseRawLedgerEntries and reach the helpers only as typed objects via union accessors, bypassing Buffer.from."
why_failed_brief = "remote bytes never reach a buffer-construction sink; they arrive predecoded, and the only genuine remote-bytes integrity weakness is already VIABLE elsewhere"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "remote ledger-entry bytes are XDR-decoded by parseRawLedgerEntries (parsers.ts:149-150) before reaching any lookup helper; helpers consume typed union accessors, not raw buffers"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "Buffer.from in getContractWasmByHash (server.ts:600-603) and StrKey/fromXDR decode in getClaimableBalance (server.ts:313-328) operate only on caller-supplied strings, not remote response data"

[[blockers]]
kind = "data_flow"
guarantee = "no source path was found by which remote RPC response bytes reach Buffer.from/fromXDR as raw bytes on these helpers; union accessors throw on wrong arm rather than mis-shaping a buffer"
```
