# F982: Path blocked: SEP-10 challenge transaction signing surface

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/982-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> sign` (area seed: `<anonymous>`, `sign`, `transaction.sign`, `buildChallengeTx`)

## Blocker

The build-side `sign` sink signs the server's own freshly-constructed challenge, which is structurally non-submittable and non-authenticating on its own. `buildChallengeTx` creates `new Account(serverKeypair.publicKey(), "-1")`, so the built transaction has sequence 0 (`challenge_transaction.ts:79`), and only `serverKeypair` signs it (`:130`). Attacker-influenced fields (`clientAccountID`, `memo`, `homeDomain`, `webAuthDomain`, `clientDomain`, `clientSigningKey`) are placed only as structured manage-data/source/memo material; they cannot make the signature bind a submittable or pre-authenticated transaction. SEP-10 authentication is only granted after the separate verify path, which independently re-checks every binding: `sequence !== 0` (`:200`), `source !== serverAccountID` (`:207`), FeeBumpTransaction rejection (`:192`), base64-48 value (`:278`), memo/muxed exclusivity (`:231`), and manageData type (`:244`). I re-derived each guard from current source rather than from prior memory; none can be bypassed by the attacker-influenced build inputs.

## Evidence

- `src/webauth/challenge_transaction.ts:79,129-130` - server builds a sequence-0 transaction and applies only its own signature; output is a non-submittable challenge artifact.
- `src/webauth/challenge_transaction.ts:198-211` - verify path enforces sequence==0 and source==serverAccountID, so a server-signed challenge cannot be reused as a submittable/different transaction.
- `src/webauth/challenge_transaction.ts:230-282` - verify path re-validates memo/muxed exclusivity, manageData type, and 48-byte base64 value, so attacker-influenced build fields cannot smuggle a divergent binding past authentication.

## Negative Scope

- Rules out: attacker-influenced challenge fields (domains, memos, client/muxed accounts, clientSigningKey) reaching the build-side `sign`/`transaction.sign` sink in a way that makes `buildChallengeTx` sign a materially-wrong, submittable, or pre-authenticated transaction.
- Does not rule out: a distinct verify-side weakness in `verifyChallengeTxSigners`/`verifyChallengeTxThreshold` weight/threshold accounting beyond the signer-count invariant, which is a different sink and not exercised at this build-side signing surface.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-21ec7ae7ad0f3e8358ab8493"
weakness = "authorization integrity / transaction signing"
record_kind = "area_seed"
path = ["<anonymous>", "sign"]
sink = "sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "transaction_signing"
target_functions = ["<anonymous>", "sign", "transaction.sign", "buildChallengeTx"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_unverified_until_checked"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["server_signed_challenge_nonsubmittable_seq_zero", "verify_side_reenforces_all_structured_bindings"]
rules_out = ["attacker-influenced clientAccountID/memo/homeDomain/webAuthDomain/clientDomain/clientSigningKey making the build-side sign sink produce a materially-wrong, submittable, or pre-authenticated SEP-10 challenge"]
does_not_rule_out = ["distinct weight/threshold accounting weakness in verifyChallengeTxThreshold beyond the signer-count invariant"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Build-side sign applies only the server signature over a sequence-0 non-submittable challenge; attacker-influenced fields are structured-only and are independently re-validated by the verify path (seq==0, source==server, FeeBump reject, base64-48, memo/muxed, manageData)."
why_failed_brief = "Server signs its own non-submittable seq-0 challenge; verify path re-enforces every binding, so attacker-influenced build inputs cannot make the sign sink authenticate a wrong/submittable transaction."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readChallengeTx enforces sequence==0, source==serverAccountID, rejects FeeBumpTransaction, requires 48-byte base64 value, and rejects memo on muxed clientAccountID (challenge_transaction.ts:192-282)"

[[blockers]]
kind = "design_invariant"
guarantee = "buildChallengeTx signs a sequence-0 (Account seq '-1') transaction with only the server key (challenge_transaction.ts:79,130), so the build-side sign output is non-submittable and non-authenticating until the separate verify path validates a client signature"
```
