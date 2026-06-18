# F002: Path blocked: remote stellar.toml body parse boundary

**Subsystem**: stellartoml
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/stellartoml/002-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> parse`

The seed is an area_seed with targets `<anonymous>` and `parse`. The
`<anonymous>` target is the `.then((response) => { parse(response.data) })`
closure in `Resolver.resolve`; it resolves to the same `parse` boundary, so
both targets share one source-backed blocker set. The sink `parse` is
`smol-toml@1.6.1`'s `parse` decoding the size-bounded, attacker-controlled
remote TOML body.

## Blocker

The decode at the `parse` sink is bounded and prototype-pollution-safe on every
dimension a remote body can exploit. smol-toml 1.6.1 neutralizes `__proto__`
keys with `Object.defineProperty` (creating a benign own data property instead
of invoking the prototype setter) on both the table path (parse.js:56) and the
inline-table path (struct.js:134); `constructor`/`prototype` segments are
shadowed by own properties created via `t[k] = {}`, so neither reaches
`Object.prototype`. Recursion is capped by `maxDepth = 1000` in `extractValue`
(extract.js:44), which throws before deep nesting can exhaust the JS stack
(~1000 levels ≈ a few thousand frames, below Node's default limit). The body is
size-bounded before it ever reaches `parse`: `readBodyBounded` enforces
`maxContentLength = STELLAR_TOML_MAX_SIZE` (100 KiB) via the `content-length`
header check and a streamed running-total abort (fetch-client.ts:157-181).
Parsing ~100 KiB with smol-toml is linear with O(1)-amortized object insertion;
no attacker-controlled equivalence class forces quadratic/expensive bucketing,
and each `resolve` call is a one-shot promise with no accumulating sink, so
repetition adds no unbounded resource. The decoded object's downstream
type-trust is not a property of this sink, and the genuine integrity risk
(scheme/host downgrade following a server `Location`) lives on the distinct
`get` route, not `parse`.

## Evidence

- `node_modules/smol-toml@1.6.1/dist/parse.js:56-58` - table-path `__proto__` key handled with `Object.defineProperty(t, k, {...})`, preventing prototype mutation.
- `node_modules/smol-toml@1.6.1/dist/struct.js:134-135` - inline-table `__proto__` key handled the same way; `constructor`/`prototype` are shadowed via `t[k] = {}`.
- `node_modules/smol-toml@1.6.1/dist/extract.js:43-54` and `parse.js:96` - `extractValue` enforces `maxDepth` (default 1000, SDK does not override) and throws at depth 0, bounding recursion.
- `src/http-client/fetch-client.ts:153-192` - `readBodyBounded` enforces `maxContentLength` via header and streamed running-total before the body reaches `parse`.
- `src/stellartoml/index.ts:54-79` - `get(..., { maxContentLength: STELLAR_TOML_MAX_SIZE })` then `parse(response.data)`; parse errors are caught and rejected, not propagated as a crash.

## Negative Scope

- Rules out: prototype pollution, deep-nesting stack exhaustion, and unbounded body-size resource exhaustion at the `smol-toml.parse` decode of the remote stellar.toml body.
- Does not rule out: the scheme/host-downgrade redirect route at the `get` sink (route_id js-sdk-3210675ec7643a3184fe756f, distinct sink, already tracked VIABLE); downstream type/shape confusion where web-auth/federation consumers read `SIGNING_KEY`/`WEB_AUTH_ENDPOINT`/`FEDERATION_SERVER`/`TRANSFER_SERVER` from the decoded object without re-validating type, which is a distinct downstream consumer sink rather than this parse boundary.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "stellartoml"
route_id = "js-sdk-cf63bb7d677c95e5892218bb"
weakness = "parse integrity"
record_kind = "area_seed"
path = ["<anonymous>", "parse"]
sink = "parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["src/stellartoml/index.ts:Resolver.resolve", "smol-toml:parse", "src/http-client/fetch-client.ts:readBodyBounded"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["proto_pollution_blocked_defineproperty", "recursion_depth_capped", "body_size_bounded_streamed"]
rules_out = ["smol-toml 1.6.1 guards __proto__ via Object.defineProperty on both table (parse.js:56) and inline-table (struct.js:134) paths and shadows constructor/prototype with own properties, so a remote TOML body cannot pollute Object.prototype at the parse sink", "extractValue enforces maxDepth=1000 (extract.js:44) and throws before stack exhaustion, bounding nesting DoS", "readBodyBounded enforces maxContentLength=STELLAR_TOML_MAX_SIZE via header and streamed running-total (fetch-client.ts:157-181) so parse input is size-bounded to ~100KiB with linear, O(1)-amortized parsing"]
does_not_rule_out = ["scheme/host downgrade redirect at the get sink (route_id js-sdk-3210675ec7643a3184fe756f)", "downstream type/shape confusion in web-auth/federation consumers reading SIGNING_KEY/WEB_AUTH_ENDPOINT/FEDERATION_SERVER from the decoded object without type re-validation"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Remote stellar.toml body decoded by smol-toml 1.6.1 parse; checked for prototype pollution, deep-nesting stack DoS, and unbounded-size resource exhaustion."
why_failed_brief = "smol-toml guards __proto__ via defineProperty and shadows constructor/prototype; extractValue caps recursion at maxDepth 1000; readBodyBounded enforces 100KiB cap streamily, so parse input is bounded with linear parsing and no proto pollution."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "proto_guard"
guarantee = "smol-toml 1.6.1 defines __proto__ keys as own data properties via Object.defineProperty (parse.js:56, struct.js:134) and shadows constructor/prototype, blocking Object.prototype pollution from the remote TOML body"

[[sanitizer_guarantees]]
kind = "depth_bound"
guarantee = "extractValue throws at depth 0 with maxDepth default 1000 (extract.js:44, parse.js:96), bounding recursion below stack-exhaustion"

[[sanitizer_guarantees]]
kind = "size_bound"
guarantee = "readBodyBounded enforces maxContentLength=STELLAR_TOML_MAX_SIZE (100KiB) via content-length header and streamed running-total abort before parse (fetch-client.ts:157-181)"

[[blockers]]
kind = "size_cap"
guarantee = "parse input is bounded to ~100KiB; smol-toml parsing is linear with O(1)-amortized object insertion and resolve is a one-shot promise with no accumulating sink, so single-call or repeated-call resource exhaustion stays below Medium"
```
