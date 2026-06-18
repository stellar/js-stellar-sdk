# F905: Path blocked: stellar.toml body parse/deserialization surface

**Subsystem**: stellartoml
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/stellartoml/905-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> parse`

The resolver (`src/stellartoml/index.ts`) is a thin fetch + `parse(response.data)` + return. It performs no field validation; the only resolver-side guards are the `maxContentLength` cap and a try/catch that rejects parse errors. The dispatch "remaining risk" is whether the size-bounded but attacker-controlled body yields parser state that downstream consumers (federation/web-auth) trust beyond resolver validation.

## Per-Target / Per-Angle Disposition

- **Type confusion downstream (prior [1])** — re-confirmed from source. `FederationServer` wraps `tomlObject.FEDERATION_SERVER` in `new URL(serverURL)` (server.ts:142) and then enforces `protocol === "https:"` unless `allowHttp` (server.ts:154). A non-string/odd value either coerces to a string-equivalent URL the domain owner already controls or throws `Invalid URL`. No distinct unsafe behavior.
- **Proto pollution + resource exhaustion (prior [2])** — re-confirmed. Body is capped at `STELLAR_TOML_MAX_SIZE` (index.ts:57), parse errors are caught and rejected (index.ts:69-78), and the result is a leaf return value with no accumulating sink. smol-toml `^1.6.1` guards `__proto__`.
- **Parser ambiguity via duplicate keys (NEW distinct angle, not in prior records)** — CLOSED. Runtime check confirms smol-toml rejects redefinition: a body with a repeated `FEDERATION_SERVER` key throws `Invalid TOML document: trying to redefine an already defined table or value`, which is caught at index.ts:72. No last-wins/first-wins ambiguity that could smuggle a conflicting security-relevant value past a downstream decision.
- **Web-auth consumption** — `SIGNING_KEY`/`WEB_AUTH_ENDPOINT` are caller-supplied to the SEP-10 challenge APIs (challenge_transaction.ts), not read from the `Resolver.resolve` output on this path; out of scope for this sink.

## Blocker

The parse sink adds no validation and returns a leaf object; every downstream security-relevant consumption on this route passes through a source-proven coercion/gate. `FEDERATION_SERVER` is normalized by `new URL()` and gated by an unconditional `https:` protocol check (server.ts:142,154). The body is size-capped (index.ts:57), parse errors are caught (index.ts:72), smol-toml rejects duplicate keys (verified at runtime) and guards prototype pollution. Because HTTPS authenticates the body to the domain owner, an attacker-controlled toml is the domain's own authoritative configuration; cross-domain delegation of `FEDERATION_SERVER` is by-design federation semantics, not SDK trust confusion. No size-bounded body shape produces parser state that yields a distinct unsafe SDK action.

## Evidence

- `src/stellartoml/index.ts:54-78` - fetch with `maxContentLength: STELLAR_TOML_MAX_SIZE`, then `parse(response.data)` wrapped in try/catch that rejects on parse error; result returned unvalidated.
- `src/federation/server.ts:128-134` - resolver output's `FEDERATION_SERVER` is the only field consumed; passed straight to the constructor.
- `src/federation/server.ts:142,154` - `new URL(serverURL)` coercion plus `protocol !== "https:"` gate block type-confusion and scheme-policy bypass on this path.
- smol-toml `^1.6.1` (package.json) - runtime-verified duplicate-key redefinition throws, closing the parser-ambiguity angle.

## Negative Scope

- Rules out: a size-bounded attacker-controlled stellar.toml body causing parse-integrity/parser-ambiguity, prototype pollution, type/shape confusion, or single/repeated-call resource exhaustion at the `parse` sink that yields distinct unsafe SDK behavior in federation/web-auth on this route.
- Does not rule out: the separate redirect-handling route (`<anonymous> -> get`, route_id `js-sdk-3210675ec7643a3184fe756f`) where boundedFetchAdapter follows a server-supplied scheme/host without an allowlist; that is a different sink and route_id, not the parse sink.

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
target_functions = ["src/stellartoml/index.ts:Resolver.resolve", "src/federation/server.ts:FederationServer.createForDomain"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["toml_parse_leaf_return_no_accumulating_sink", "federation_url_ctor_coercion_plus_https_gate", "smol_toml_duplicate_key_rejected", "body_size_bounded_max_content_length"]
rules_out = ["size-bounded attacker-controlled stellar.toml body at the smol-toml parse sink producing parser ambiguity, prototype pollution, type/shape confusion, or resource exhaustion that yields distinct unsafe SDK behavior in federation/web-auth on this route"]
does_not_rule_out = ["redirect-handling route get sink (route_id js-sdk-3210675ec7643a3184fe756f) following server-supplied scheme/host without allowlist", "caller-supplied SIGNING_KEY/WEB_AUTH_ENDPOINT handling in SEP-10 web-auth APIs not fed from this resolve path"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Resolver.resolve fetches a size-capped body, parses it with smol-toml inside try/catch, and returns a leaf object; the only consumed downstream field (FEDERATION_SERVER) is coerced by new URL() and gated by an https protocol check, so no parser state survives as distinct unsafe SDK action."
why_failed_brief = "parse sink is a leaf return guarded by size cap, caught parse errors, smol-toml proto/duplicate-key guards, and a downstream new URL()+https gate; no distinct unsafe behavior beyond domain owner's authoritative config."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "fetch enforces maxContentLength = STELLAR_TOML_MAX_SIZE (index.ts:57) and parse errors are caught and rejected (index.ts:69-78)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "FEDERATION_SERVER from the parsed toml is coerced by new URL() and gated by protocol === https unless allowHttp (server.ts:142,154)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "smol-toml ^1.6.1 rejects duplicate-key redefinition (runtime-verified) and guards __proto__, closing parser-ambiguity and prototype-pollution angles"

[[blockers]]
kind = "leaf_return_value"
guarantee = "parse output is a leaf object returned to the caller with no SDK-internal accumulating sink or signing/submission decision on this route"
```
