# F915: Path blocked: RPC transaction/key XDR serialization integrity

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/915-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> k.toXDR`

Area seed (`record_kind = area_seed`) over the simulate/send/assemble serialization
cluster. The `toXDR` sinks are reached from `_simulateTransaction`
(`transaction.toXDR()`), `_sendTransaction` (`transaction.toXDR()`), and
`getLedgerEntries`/`getContractData` (`k.toXDR("base64")`); `assembleTransaction`
is the only target that adopts remote-response-derived values before serialization.

## Blocker

At every `toXDR` sink the SDK serializes an already-constructed in-memory object,
so serialization is a faithful XDR encode and introduces no integrity gap of its
own. The only attacker (remote-RPC) influence enters through `assembleTransaction`,
which adopts simulation-derived `auth`, `sorobanData`, and resource fee *before*
serialization. Those adoption points are governed by checked invariants: auth is
disregarded when caller-supplied auth already exists and is otherwise on-chain-bound
(rules_out from prior route `js-sdk-aa9b65c61d46ef89d4540f22`), the resource fee is
documented design with no SDK ground truth and is exposed for caller review, and the
fee subtraction guards double-counting and negative inclusion fees. `k.toXDR` on the
ledger-entry path serializes caller-supplied `xdr.LedgerKey` objects into the request
with no remote input at serialization time.

## Evidence

- `src/rpc/server.ts:661-669` - `_getLedgerEntries` maps caller-supplied `xdr.LedgerKey` via `k.toXDR("base64")`; keys are caller input, response handled by `parseRawLedgerEntries` (separate parse route).
- `src/rpc/server.ts:1046-1059` / `1194-1210` - `_simulateTransaction`/`_sendTransaction` serialize the caller-built (or pre-assembled) transaction via `transaction.toXDR()`; no remote value injected at the sink.
- `src/rpc/transaction.ts:100-117` - auth adoption: simulation auth is used only when caller supplied none (`existingAuth.length > 0 ? existingAuth : success.result!.auth`); matches prior on-chain-binding blocker.
- `src/rpc/transaction.ts:68-98` - fee folding subtracts an existing resourceFee only when it leaves a positive remainder, then defers to `cloneFrom`/`build` with simulation `sorobanData`.
- `src/base/transaction_builder.ts:1038-1050` - `build()` re-adds `sorobanData.resourceFee()` and enforces a `UINT32_MAX` cap, so an inflated remote resource fee throws rather than silently serializing.

## Negative Scope

- Rules out: a serialization-stage integrity break at the `toXDR`/`k.toXDR` sinks themselves (faithful XDR encode of in-memory objects; no remote-derived value mutated during serialization).
- Does not rule out: simulation-derived footprint/`sorobanData` semantics adopted by `assembleTransaction` (over-broad footprint costs fee but cannot force unintended on-chain writes — left untraced as a distinct material effect); the `getLedgerEntries`/`getContractData` *response* parse path (`parseRawLedgerEntries`), which is a different sink than this serialization route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-3504706c3cfcfc3ec6179739"
weakness = "transaction serialization integrity"
record_kind = "area_seed"
path = ["<anonymous>", "k.toXDR"]
sink = "k.toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["_simulateTransaction", "transaction.toXDR", "<anonymous>", "_sendTransaction", "k.toXDR", "assembleTransaction", "toEnvelope", "toXDR", "getLedgerEntry", "key.toXDR", "raw.toEnvelope", "getContractData"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["serialization_is_faithful_xdr_encode", "simulation_auth_only_when_caller_auth_absent", "resource_fee_uint32_capped_on_build"]
rules_out = ["serialization-stage integrity break at the toXDR/k.toXDR sinks: each sink faithfully XDR-encodes an already-constructed in-memory transaction or ledger-key object, with no remote-response-derived value mutated during serialization"]
does_not_rule_out = ["simulation-derived footprint/sorobanData semantics adopted in assembleTransaction (not fully traced as a distinct material effect)", "the getLedgerEntries/getContractData response parse path parseRawLedgerEntries, a separate sink"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "toXDR/k.toXDR sinks serialize already-built transaction and ledger-key objects; remote influence enters only via assembleTransaction's pre-serialization adoption of simulation auth/fee/sorobanData, which is guarded by caller-auth precedence, on-chain auth binding, and a UINT32_MAX fee cap."
why_failed_brief = "serialization is a faithful encode and the integrity-decision points before it are guarded or on-chain-bound; no serialization-stage break found within budget"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "assembleTransaction adopts simulation auth only when caller supplied no auth (src/rpc/transaction.ts:115); build() caps total fee including resourceFee at UINT32_MAX (src/base/transaction_builder.ts:1045)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "fee folding subtracts an existing resourceFee only when a positive inclusion fee remains, preventing double-counting (src/rpc/transaction.ts:80; src/base/transaction_builder.ts:322)"

[[blockers]]
kind = "faithful_serialization"
guarantee = "k.toXDR and transaction.toXDR encode caller-built in-memory objects with no remote-derived value injected at serialization time (src/rpc/server.ts:667,1051,1202)"
```
