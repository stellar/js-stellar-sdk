# F003: Unbounded response-array / nested ScVal decode cost

**Date**: 2026-06-17
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/001-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The absence of an SDK-side count/depth cap is real:

- `src/rpc/parsers.ts:106-121` — `parseRawEvents` maps over an uncapped
  `events[]`, and for each event maps `topic[]` through `xdr.ScVal.fromXDR` and
  decodes `value` via `xdr.ScVal.fromXDR`. No length limit.
- `src/rpc/parsers.ts:46-53` — `parseTransactionInfo` maps `contractEventsXdr`
  (array-of-arrays) and `transactionEventsXdr`, each calling `fromXDR`, with no
  count limit.

No SDK-side length or recursion-depth bound is applied in `parsers.ts` before
decode. The only bound is the HTTP response body.

## Why It Failed

1. **No amplification within `src/`.** The decode work is linear in the size of
   the response the SDK has already received and `JSON.parse`-d. To force N
   units of XDR decode work, the attacker must already have transmitted ~N bytes
   of base64 in the JSON body, which the transport layer accepted and the JSON
   parser already walked at O(N). There is no small-input -> large-work
   amplification in the SDK code: the cost is proportional to bytes the attacker
   already paid to send and that were already processed upstream. This is
   ordinary linear parsing, not material resource exhaustion beyond what
   receiving any large response already costs.

2. **The only amplification path is external and unverified.** The
   stack-overflow claim (small base64 -> deep `ScVal` Vec/Map nesting -> deep
   recursion) depends entirely on the recursion behavior of the `js-xdr`
   decoder, which lives outside `src/` (it is the `xdr.*.fromXDR`
   implementation, not SDK code). The hypothesis itself rates this low
   confidence and flags it unverified. A dependency-internal recursion bound
   without a repo-specific reachable exploit in `src/` is out of scope per the
   objective ("pure dependency CVEs without a repo-specific reachable exploit
   path").

Linear-in-already-received-bytes decode does not meet the Medium "bounded but
material resource exhaustion / not bounded by documented SDK limits" bar,
because the cost is bounded by and proportional to the response the SDK already
accepted and JSON-parsed.

## What This Rules Out

Per-element `fromXDR` decoding of uncapped response arrays in `parseRawEvents`
and `parseTransactionInfo` (`parsers.ts`) as a stand-alone material DoS in
`src/`: the work is linear in the already-received, already-JSON-parsed response
body, with no in-`src/` amplification.

## What This Does Not Rule Out

- A confirmed recursion-depth/stack-overflow bug in the `js-xdr`
  `ScVal.fromXDR` decoder itself, if it were brought in scope with a
  repo-specific reachable trace.
- Simulation fee inflation (C1) and auth injection (C2) on the assembly path.
- A distinct correctness bug (not exhaustion) in event/transaction-info
  decoding for a specific malformed-but-decodable response shape.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-aa9b65c61d46ef89d4540f22"
weakness = "Untrusted XDR Decode"
record_kind = "single_path"
path = ["parseRawEvents", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "resource_exhaustion"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/rpc/parsers.ts:parseRawEvents", "src/rpc/parsers.ts:parseTransactionInfo"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["linear_cost_no_src_amplification", "recursion_depth_claim_external_to_src_and_out_of_scope"]
rules_out = ["per-element fromXDR decoding of uncapped response arrays in parseRawEvents/parseTransactionInfo as a stand-alone material DoS in src/: the work is linear in the already-received and already-JSON-parsed response body with no in-src amplification"]
does_not_rule_out = ["a confirmed recursion-depth/stack-overflow bug inside the js-xdr ScVal.fromXDR decoder if brought in scope with a repo-specific reachable trace", "simulation fee inflation (C1)", "auth injection (C2)", "a correctness (non-exhaustion) bug in event/transaction-info decoding for a malformed-but-decodable response"]
assumptions = ["the response body is received and JSON.parse-d before parsers.ts iterates it, so XDR decode cost is proportional to bytes already transmitted and processed", "xdr.*.fromXDR is implemented in the external js-xdr dependency, not in src/"]
mechanism_brief = "Uncapped response arrays and nested ScVal are decoded per element with no SDK count/depth limit, but the cost is linear in the already-received/JSON-parsed body and the only amplification (deep-recursion stack overflow) is in the external js-xdr decoder, out of scope."
why_failed_brief = "no in-src amplification (work linear in already-received, already-JSON-parsed bytes); the deep-recursion stack-overflow claim depends on external js-xdr behavior, out of scope and unverified; below the Medium materiality bar."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "upstream_bound"
source = "src/rpc/parsers.ts:parseRawEvents"
guarantee = "decode iterates a response already received and JSON.parse-d, so XDR decode cost is linear in and bounded by bytes the attacker already transmitted and that were already processed upstream"

[[blockers]]
kind = "out_of_scope"
source = "src/rpc/parsers.ts:parseRawEvents"
guarantee = "the only small-input-to-large-work amplification (deep ScVal recursion / stack overflow) is internal to the external js-xdr fromXDR implementation, not src/, with no repo-specific reachable exploit established"
```
