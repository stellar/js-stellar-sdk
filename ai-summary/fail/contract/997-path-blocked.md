# F997: Path blocked: Contract WASM/spec ingestion via Client.fromWasm

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/997-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`from -> Client.fromWasm`

Area seed sibling set traced: `from`, `fromWasmHash`, `Client.fromWasm`,
`specFromWasmHash`, `Spec.fromWasm`, `specFromWasm`, `parseWasmCustomSections`,
`processSpecEntryStream`.

## Blocker

Every materially-significant weakness reachable through the `fromWasm` parse
cluster is already recorded VIABLE by prior memory, and the WASM custom-section
parser itself is source-confirmed robust, so no *distinct* unreported
vulnerability survives. The core integrity gap — `getContractWasmByHash`
returns `contractCode().code()` with no `sha256(wasm)==wasmHash` comparison
before spec decode — is already VIABLE under `js-sdk-d6ede4f50f471c78ff302843`.
The spec-driven `Client` constructor identifier collision / field shadowing is
already VIABLE under `js-sdk-310bbe7b42cb719afc52c1fd` and
`js-sdk-764db1ecd1a0b26cd4288e42`. The parser (`parseWasmCustomSections`) is
bounds-checked, offset-monotonic (≥2 bytes consumed per section header), caps
LEB128 at 5 bytes with `>>>0`, decodes the section name with `fatal:true`
UTF-8, and proves payload length non-negative before `read()`; DoS/amplification
is already blocked high (prior) and deep-recursion crash is below-Medium.

## Per-Target Disposition

- `getContractWasmByHash` / `Client.fromWasmHash` / `specFromWasmHash`
  (`src/contract/client.ts:10-23,148-166`, `src/rpc/server.ts:596-621`):
  no-hash-verification integrity gap already VIABLE
  (`js-sdk-d6ede4f50f471c78ff302843`). Not re-reported. No distinct second
  weakness: the fetched bytes flow straight to `Spec.fromWasm` with no other
  trust decision on this path.
- `Client.from` (`client.ts:188-199`): fetches wasm by contractId via RPC;
  identical trust-the-RPC model, fully subsumed by the same VIABLE record's
  `application_input_or_remote_rpc_server` scope.
- `Client.fromWasm` / `Spec.fromWasm` / `specFromWasm`
  (`client.ts:176-179`, `spec.ts:504-507`, `wasm_spec_parser.ts:8-17`):
  forwarders into the parser; `specFromWasm` uses only `xdrSections[0]`, but
  with the wasm fully attacker-controlled (no hash check) section selection adds
  no independent material effect.
- `parseWasmCustomSections` (`utils.ts:98-175`): robust; see Evidence.
- `processSpecEntryStream` (`utils.ts:181-189`): strict `XdrReader` +
  `ScSpecEntry.read` until eof; malformed/truncated streams throw rather than
  silently mis-decode. Type-confusion in the *decoded* spec values is a
  different route family (`js-sdk-6ddf125939e0256890e41b49`,
  `js-sdk-a7b32e6177a6e7a129c7468b`), not the parse cluster.

## Evidence

- `src/contract/utils.ts:110-115` - `read(length)` throws "Buffer overflow"
  when `offset + length > buffer.byteLength`; every byte access is bounds-checked.
- `src/contract/utils.ts:128-138` - `readVarUint32` caps shift at `>=32`
  (max 5 bytes) and returns `value >>> 0`, bounding section/name lengths to
  unsigned 32-bit with no negative or oversized accumulation leaking out.
- `src/contract/utils.ts:145-171` - main loop advances `offset = start + sectionLength`
  where `start` is already past the ≥2-byte header, so offset is strictly
  monotonic (no rewind / infinite loop); confirms prior O(n) no-amplification.
- `src/contract/utils.ts:154-167` - payload length `sectionLength-(offset-start)`
  is proven `>=0` by the `offset+nameLen <= start+sectionLength` guard, and the
  name is decoded with `fatal:true` (invalid UTF-8 swallowed, section dropped).
- `src/rpc/server.ts:596-621` (per prior `js-sdk-d6ede4f50f471c78ff302843`) -
  presence check + direct return of `contractCode().code()`, no hash compare.

## Negative Scope

- Rules out: a distinct memory-safety / unbounded-resource / silent
  integrity-corruption bug in `parseWasmCustomSections`, `specFromWasm`, or
  `processSpecEntryStream` beyond the already-recorded prior findings.
- Does not rule out: the already-VIABLE no-`wasmHash`-verification integrity gap
  (`js-sdk-d6ede4f50f471c78ff302843`); the already-VIABLE spec-driven `Client`
  constructor identifier collision / field shadowing
  (`js-sdk-310bbe7b42cb719afc52c1fd`, `js-sdk-764db1ecd1a0b26cd4288e42`);
  type-confusion in the native-conversion route family on the decoded spec.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "Contract spec/WASM deserialization integrity"
record_kind = "area_seed"
path = ["from", "Client.fromWasm"]
sink = "Client.fromWasm"
sink_role = "contract_wasm_parse"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "contract_wasm_parse"
target_functions = ["from", "Client.fromWasm", "fromWasm", "specFromWasmHash", "Spec.fromWasm", "fromWasmHash", "specFromWasm", "parseWasmCustomSections", "processSpecEntryStream"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["fromwasm_parse_cluster_no_distinct_parse_bug", "wasm_custom_section_parser_bounds_checked_monotonic"]
rules_out = ["No distinct memory-safety, unbounded-resource, or silent integrity-corruption bug exists in parseWasmCustomSections/specFromWasm/processSpecEntryStream beyond prior records: read() is bounds-checked (utils.ts:110-115), LEB128 is 5-byte capped with >>>0 (utils.ts:128-138), offset is strictly monotonic (utils.ts:145-171), payload length is proven non-negative and name UTF-8 is fatal-decoded (utils.ts:154-167)."]
does_not_rule_out = ["already-VIABLE no-sha256(wasm)==wasmHash verification gap js-sdk-d6ede4f50f471c78ff302843", "already-VIABLE spec-driven Client constructor identifier collision/field shadowing js-sdk-310bbe7b42cb719afc52c1fd and js-sdk-764db1ecd1a0b26cd4288e42", "type-confusion in native-conversion route family on decoded spec values js-sdk-6ddf125939e0256890e41b49 / js-sdk-a7b32e6177a6e7a129c7468b"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "The fromWasm parse cluster's material weaknesses are all already recorded VIABLE (no-hash-verification, constructor identifier collision) or NOT_VIABLE (parse DoS/recursion). Source trace of the WASM custom-section parser confirms it is bounds-checked, offset-monotonic, LEB128-capped, fatal-UTF-8 and strict-XDR, leaving no distinct unreported parse-level vulnerability."
why_failed_brief = "no distinct unreported vulnerability in the parse cluster; core integrity gap already VIABLE under js-sdk-d6ede4f50f471c78ff302843 and parser source-confirmed robust"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "parseWasmCustomSections read() bounds-checks every access against buffer.byteLength (utils.ts:110-115) and advances offset monotonically by >=2 bytes per section header (utils.ts:145-171)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readVarUint32 caps LEB128 at 5 bytes (shift>=32 throws) and returns value>>>0, and section name is decoded with fatal:true UTF-8 (utils.ts:128-167)"

[[blockers]]
kind = "duplicate_prior_viable"
guarantee = "core integrity gap (no sha256(wasm)==wasmHash check before spec decode) already recorded VIABLE under js-sdk-d6ede4f50f471c78ff302843; not re-reported"

[[blockers]]
kind = "duplicate_prior_viable"
guarantee = "spec-driven Client constructor identifier collision/field shadowing already recorded VIABLE under js-sdk-310bbe7b42cb719afc52c1fd and js-sdk-764db1ecd1a0b26cd4288e42"
```
