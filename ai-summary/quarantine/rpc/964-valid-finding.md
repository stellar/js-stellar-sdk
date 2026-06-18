# R964: requestAirdrop POSTs to remote-selected friendbotUrl, bypassing the allowHttp/https policy

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/963-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the `requestAirdrop` outbound POST path in current source; it is the
sibling of the `fundAddress` path reviewed under C1 (R963) and shares the exact
same uncovered transport selection:

- `requestAirdrop` (server.ts:1239-1281) executes
  `friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl`
  (server.ts:1244) and then
  `this.httpClient.post(\`${friendbotUrl}?addr=${encodeURIComponent(account)}\`)`
  (server.ts:1250-1252).
- `getNetwork` (server.ts:937-943) returns the raw JSON-RPC `result` via
  `jsonrpc.postObject` (`src/rpc/jsonrpc.ts:49-67`) with no validation of
  `friendbotUrl`.
- The only scheme/`allowHttp` gate in the class is the constructor check on
  `serverURL` (server.ts:176); `allowHttp` is never propagated to the http
  client (`createHttpClient` takes only headers — `src/rpc/axios.ts:6-14`).
- `buildBoundedUrl` (`src/http-client/fetch-client.ts:105-117`) applies no
  scheme/`allowHttp` enforcement; the attacker-chosen URL (already matching
  `^https?:\/\//i`) flows unmodified into `fetch`.
- The 400-error branch (server.ts:1271-1278) only re-loads the account on
  `createAccountAlreadyExist` and does not validate or constrain the URL.

`requestAirdrop` is marked `@deprecated` (server.ts:1225-1226) in favor of
`fundAddress`, but it remains a live exported production method on `Server` and
is fully reachable, so the transport flaw is real on this entrypoint too.

## Findings

Identical impact to C1/R963 on the deprecated-but-exported `requestAirdrop`
entrypoint: an application running the documented `allowHttp=false` default,
calling `server.requestAirdrop(address)` without an explicit `friendbotUrl`
against a malicious or compromised RPC server, will POST to an attacker-chosen
`friendbotUrl` from that server's `getNetwork()` response. The attacker can
return `http://attacker.example/` (plaintext, defeating `allowHttp=false`) or an
internal SSRF target, with no scheme re-validation anywhere on the path.

This matches the objective impact category "HTTPS policy or allowHttp gate
bypass ... for Friendbot requests" at **Medium**. Per the review procedure a
finding is not rejected for being a deprecated API: the export is reachable and
the code genuinely deviates from the expected `allowHttp` behavior. C1 (R963) is
the non-deprecated equivalent and carries the primary severity; this record
documents the sibling so the route is fully accounted for.

Novelty: same as R963 — no prior record (js-sdk-c92e450a, js-sdk-3504706c,
js-sdk-db5293e0) covers the `getNetwork().friendbotUrl -> httpClient.post`
URL-selection flow; those concern decoded-response leaf values only.

## PoC Guidance

- **Test file**: append to an existing RPC server unit test under
  `test/unit/server/` using the mocked http-client pattern — no live network.
- **Setup**: `new Server("https://rpc.example", {})` (default `allowHttp=false`);
  mock `getNetwork` so `result.friendbotUrl = "http://attacker.example/"`.
- **Steps**: call `server.requestAirdrop(<valid G... address>)`; intercept the
  http client `post`.
- **Assertion**: assert the captured POST URL begins with
  `http://attacker.example/`, demonstrating the `allowHttp=false` policy was
  bypassed via the remote-selected friendbot URL with no scheme check.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-c7ee0ae8709778ef50975329"
weakness = "https/allowHttp policy bypass via remote-selected friendbot URL (requestAirdrop sibling)"
record_kind = "single_path"
path = ["requestAirdrop", "client.post"]
sink = "client.post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/rpc/server.ts:requestAirdrop", "src/rpc/server.ts:getNetwork"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = ["https_allowhttp_policy"]
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace rules out any scheme/allowHttp guard on the requestAirdrop friendbot path: only the constructor serverURL gate exists (server.ts:176), allowHttp is never passed to createHttpClient (axios.ts:6), and buildBoundedUrl/jsonrpc.postObject apply no scheme check", "rules out the 400-error branch (server.ts:1271) as a blocker; it re-loads the account and never validates the URL"]
does_not_rule_out = ["fundAddress friendbot URL sibling reviewed separately (C1/R963)", "exact SSRF reachability of specific internal hosts depends on the deploying environment", "downstream redirect-following behavior of the http client on the attacker URL beyond the initial POST"]
assumptions = ["remote RPC responses are attacker-controlled per the rpc subsystem trust model", "caller invokes requestAirdrop without an explicit friendbotUrl (the default, getNetwork-discovery branch)", "caller runs the documented allowHttp=false default", "the @deprecated requestAirdrop export remains reachable in production builds"]
mechanism_brief = "requestAirdrop POSTs to friendbotUrl taken verbatim from the remote getNetwork() result with no scheme/allowHttp re-validation; same uncovered transport path as fundAddress, on a deprecated-but-exported entrypoint."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/server.ts:Server constructor"
guarantee = "constructor https/allowHttp gate covers serverURL only (server.ts:176); nothing re-checks the requestAirdrop friendbot URL"

[[blockers]]
kind = "not_found"
source = "src/rpc/server.ts:requestAirdrop"
guarantee = "no scheme/allowHttp validation found on the requestAirdrop friendbotUrl path; the 400-error branch (server.ts:1271) does not constrain the URL"
```
