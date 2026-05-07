---
title: SEPs / WebAuth
category: SEPs / WebAuth
---

# SEPs / WebAuth

## WebAuth.ChallengeTxDetails

A parsed and validated challenge transaction, and some of its constituent details.

```ts
type ChallengeTxDetails = unknown
```

**Source:** [src/webauth/utils.ts:104](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/webauth/utils.ts#L104)

## WebAuth.buildChallengeTx

Returns a valid {@link SEP-10}
challenge transaction which you can use for Stellar Web Authentication.

```ts
buildChallengeTx(serverKeypair: Keypair, clientAccountID: string, homeDomain: string, timeout: number = 300, networkPassphrase: string, webAuthDomain: string, memo: string | null = null, clientDomain: string | null = null, clientSigningKey: string | null = null): string
```

**Source:** [src/webauth/challenge_transaction.ts:63](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/webauth/challenge_transaction.ts#L63)

## WebAuth.gatherTxSigners

Checks if a transaction has been signed by one or more of the given signers,
returning a list of non-repeated signers that were found to have signed the
given transaction.

```ts
gatherTxSigners(transaction: Transaction | FeeBumpTransaction, signers: string[]): string[]
```

**Source:** [src/webauth/utils.ts:32](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/webauth/utils.ts#L32)

## WebAuth.readChallengeTx

Reads a SEP-10 challenge transaction and returns the decoded transaction and
client account ID contained within.

It also verifies that the transaction has been signed by the server.

It does not verify that the transaction has been signed by the client or that
any signatures other than the server's on the transaction are valid. Use one
of the following functions to completely verify the transaction:

- {@link WebAuth.verifyChallengeTxThreshold}
- {@link WebAuth.verifyChallengeTxSigners}

```ts
readChallengeTx(challengeTx: string, serverAccountID: string, networkPassphrase: string, homeDomains: string | string[], webAuthDomain: string): { clientAccountID: string; matchedHomeDomain: string; memo: string | null; tx: Transaction }
```

**Source:** [src/webauth/challenge_transaction.ts:163](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/webauth/challenge_transaction.ts#L163)

## WebAuth.verifyChallengeTxSigners

Verifies that for a SEP 10 challenge transaction all signatures on the
transaction are accounted for. A transaction is verified if it is signed by
the server account, and all other signatures match a signer that has been
provided as an argument (as the accountIDs list). Additional signers can be
provided that do not have a signature, but all signatures must be matched to
a signer (accountIDs) for verification to succeed. If verification succeeds,
a list of signers that were found is returned, not including the server
account ID.

Signers that are not prefixed as an address/account ID strkey (G...) will be
ignored.

Errors will be raised if:
- The transaction is invalid according to
{@link WebAuth.readChallengeTx}.
- No client signatures are found on the transaction.
- One or more signatures in the transaction are not identifiable as the
server account or one of the signers provided in the arguments.

```ts
verifyChallengeTxSigners(challengeTx: string, serverAccountID: string, networkPassphrase: string, signers: string[], homeDomains: string | string[], webAuthDomain: string): string[]
```

**Source:** [src/webauth/challenge_transaction.ts:419](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/webauth/challenge_transaction.ts#L419)

## WebAuth.verifyChallengeTxThreshold

Verifies that for a SEP-10 challenge transaction all signatures on the
transaction are accounted for and that the signatures meet a threshold on an
account. A transaction is verified if it is signed by the server account, and
all other signatures match a signer that has been provided as an argument,
and those signatures meet a threshold on the account.

Signers that are not prefixed as an address/account ID strkey (G...) will be
ignored.

Errors will be raised if:
- The transaction is invalid according to
{@link WebAuth.readChallengeTx}.
- No client signatures are found on the transaction.
- One or more signatures in the transaction are not identifiable as the
server account or one of the signers provided in the arguments.
- The signatures are all valid but do not meet the threshold.

```ts
verifyChallengeTxThreshold(challengeTx: string, serverAccountID: string, networkPassphrase: string, threshold: number, signerSummary: AccountRecordSigners[], homeDomains: string | string[], webAuthDomain: string): string[]
```

**Source:** [src/webauth/challenge_transaction.ts:645](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/webauth/challenge_transaction.ts#L645)

## WebAuth.verifyTxSignedBy

Verifies if a transaction was signed by the given account id.

```ts
verifyTxSignedBy(transaction: Transaction | FeeBumpTransaction, accountID: string): boolean
```

**Source:** [src/webauth/utils.ts:94](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/webauth/utils.ts#L94)
