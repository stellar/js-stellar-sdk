# R963: fundAddress POSTs to remote-selected friendbotUrl, bypassing the allowHttp/https policy

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/963-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the `fundAddress` outbound POST path in current source:

- `Server` constructor (`src/rpc/server.ts:170-181`) is the only place a
  scheme/`allowHttp` policy is enforced, and it is enforced solely on
  `this.serverURL`: `if (this.serverURL.protocol !== "https:" && !opts.allowHttp)`
  (server.ts:176). The `allowHttp` flag is consumed here and nowhere else.
- `createHttpClient(opts.headers)` (server.ts:175) is called with **only**
  headers; `src/rpc/axios.ts:6-14` and `createHttpClient`
  (`src/horizon/horizon_axios_client.ts:38`) take only a headers map, so
  `allowHttp` is never propagated into the HTTP client. The client therefore
  has no state with which to re-enforce a scheme policy.
- `fundAddress` (server.ts:1317-1354): after a `StrKey` check on `address`
  (server.ts:1321-1328, which constrains the address arg only), it executes
  `friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl`
  (server.ts:1330) and then
  `this.httpClient.post(\`${friendbotUrl}?addr=${encodeURIComponent(address)}\`)`
  (server.ts:1336-1338).
- `getNetwork` (server.ts:937-943) returns the raw JSON-RPC `result` via
  `jsonrpc.postObject`; `postObject` (`src/rpc/jsonrpc.ts:49-67`) returns
  `response.data.result` with no validation of `friendbotUrl` and no scheme
  check on any URL it is given.
- `buildBoundedUrl` (`src/http-client/fetch-client.ts:105-117`) only
  conditionally prefixes a `baseURL` (skipped here because the friendbot URL
  already matches `^https?:\/\//i`) and appends query params. It performs no
  `https:`/`allowHttp` enforcement, so the attacker-chosen URL flows unmodified
  into `fetch`.

`grep` over `src/http-client/`, `src/rpc/jsonrpc.ts`, and `src/rpc/server.ts`
for `allowHttp`/`protocol` confirms the constructor check (server.ts:176) is the
only scheme gate in the entire path. No blocker re-validates the friendbot URL.

## Findings

A production application that opts into the documented `allowHttp=false` default
connects to its chosen RPC server over `https:`. When it later calls
`server.fundAddress(address)` without an explicit `friendbotUrl`, the SDK pulls
`friendbotUrl` verbatim from that server's `getNetwork()` response and issues an
outbound POST to it. A malicious or compromised RPC server (remote responses are
attacker-controlled per the RPC trust model) can return
`friendbotUrl = "http://attacker.example/"` or an internal/SSRF target
(e.g. `http://169.254.169.254/...`). The SDK then:

1. issues a **plaintext HTTP** POST despite `allowHttp=false`, defeating the
   security control the caller explicitly opted into, and/or
2. issues an outbound POST to an attacker-chosen internal host (SSRF primitive
   driven entirely by a remote response).

The response `hash` is subsequently re-read via `getTransaction` on the trusted
`serverURL` (server.ts:1340), so the primary material effect is the off-policy /
plaintext / redirected outbound POST itself, not a decoded-response trust break.
This matches the objective's explicit impact category "HTTPS policy or allowHttp
gate bypass ... for Friendbot requests" at **Medium**. It is not High: the
funded address is public, no fund movement or transaction-signing decision is
corrupted, and the result hash is re-validated against the trusted server.

Novelty: prior NOT_VIABLE records on this route family (js-sdk-c92e450a,
js-sdk-3504706c, js-sdk-db5293e0) concern decoded-response leaf values
(sendTransaction status/hash, toXDR serialization, getSACBalance conversion).
None traces the `getNetwork().friendbotUrl -> httpClient.post` URL-selection
flow. This URL/scheme-selection weakness is not subsumed.

## PoC Guidance

- **Test file**: append to an existing RPC server unit test under
  `test/unit/server/` (e.g. a `fundAddress`/`requestAirdrop` spec), using the
  existing mocked-`axios`/http-client pattern — no live network.
- **Setup**: construct `new Server("https://rpc.example", {})` (default
  `allowHttp=false`). Mock the `getNetwork` JSON-RPC response so its
  `result.friendbotUrl` is `"http://attacker.example/"`.
- **Steps**: call `server.fundAddress(<valid G... address>)`; intercept the
  http client `post`.
- **Assertion**: assert the captured POST URL begins with
  `http://attacker.example/` (plaintext, off-policy) — demonstrating the
  `allowHttp=false` policy was bypassed because the friendbot URL came from the
  remote response and no scheme check was applied. Optionally assert that the
  same server rejects an `http://` `serverURL` at construction, contrasting the
  enforced vs. unenforced paths.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-c7ee0ae8709778ef50975329"
weakness = "https/allowHttp policy bypass via remote-selected friendbot URL"
record_kind = "single_path"
path = ["fundAddress", "client.post"]
sink = "client.post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/rpc/server.ts:fundAddress", "src/rpc/server.ts:getNetwork", "src/http-client/fetch-client.ts:buildBoundedUrl"]
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
rules_out = ["source trace rules out any scheme/allowHttp guard on the fundAddress friendbot path: the only check is the constructor serverURL gate (server.ts:176), allowHttp is never passed to createHttpClient (axios.ts:6), and buildBoundedUrl/jsonrpc.postObject apply no scheme check", "rules out the StrKey check (server.ts:1321) as a blocker; it constrains the address arg only, not the URL"]
does_not_rule_out = ["requestAirdrop friendbot URL sibling reviewed separately (C2)", "exact SSRF reachability of specific internal hosts depends on the deploying environment", "downstream redirect-following behavior of the http client on the attacker URL beyond the initial POST"]
assumptions = ["remote RPC responses are attacker-controlled per the rpc subsystem trust model", "caller invokes fundAddress without an explicit friendbotUrl (the default, getNetwork-discovery branch)", "caller runs the documented allowHttp=false default"]
mechanism_brief = "fundAddress POSTs to friendbotUrl taken verbatim from the remote getNetwork() result; the https/allowHttp gate is enforced only on serverURL in the constructor and allowHttp is never propagated to the http client, so a malicious RPC server can redirect the outbound POST to an http:// or internal URL."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/server.ts:Server constructor"
guarantee = "constructor https/allowHttp gate covers serverURL only (server.ts:176); StrKey check covers the address arg only (server.ts:1321); neither constrains the friendbot URL"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:buildBoundedUrl"
guarantee = "no scheme/allowHttp validation found on the friendbotUrl path in fundAddress, getNetwork, jsonrpc.postObject, buildBoundedUrl, or createHttpClient"
```
