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

**Source:** [src/webauth/utils.ts:104](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/webauth/utils.ts#L104)

## WebAuth.buildChallengeTx

Returns a valid {@link SEP-10}
challenge transaction which you can use for Stellar Web Authentication.

```ts
buildChallengeTx(serverKeypair: Keypair, clientAccountID: string, homeDomain: string, timeout: number = 300, networkPassphrase: string, webAuthDomain: string, memo: string | null = null, clientDomain: string | null = null, clientSigningKey: string | null = null): string
```

**Parameters**

- `serverKeypair` — Keypair for server's signing account.
- `clientAccountID` — The stellar account (G...) or muxed account
   (M...) that the wallet wishes to authenticate with the server.
- `homeDomain` — The fully qualified domain name of the service
   requiring authentication
- `timeout` — Challenge duration (default to 5 minutes).
- `networkPassphrase` — The network passphrase. If you pass this
   argument then timeout is required.
- `webAuthDomain` — The fully qualified domain name of the service
   issuing the challenge.
- `memo` — The memo to attach to the challenge transaction. The
   memo must be of type `id`. If the `clientaccountID` is a muxed account,
   memos cannot be used.
- `clientDomain` — The fully qualified domain of the client
   requesting the challenge. Only necessary when the 'client_domain'
   parameter is passed.
- `clientSigningKey` — The public key assigned to the SIGNING_KEY
   attribute specified on the stellar.toml hosted on the client domain. Only
   necessary when the 'client_domain' parameter is passed.

**Returns**

A base64 encoded string of the raw TransactionEnvelope xdr
   struct for the transaction.

**Throws**

- Will throw if `clientAccountID` is a muxed account, and `memo`
   is present.
- Will throw if `clientDomain` is provided, but
   `clientSigningKey` is missing

**Example**

```ts
import { Keypair, Networks, WebAuth } from 'stellar-sdk'

let serverKeyPair = Keypair.fromSecret("server-secret")
let challenge = WebAuth.buildChallengeTx(
   serverKeyPair,
   "client-stellar-account-id",
   "stellar.org",
   300,
   Networks.TESTNET);
```

**See also**

- {@link SEP-10: Stellar Web Auth}

**Source:** [src/webauth/challenge_transaction.ts:63](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/webauth/challenge_transaction.ts#L63)

## WebAuth.gatherTxSigners

Checks if a transaction has been signed by one or more of the given signers,
returning a list of non-repeated signers that were found to have signed the
given transaction.

```ts
gatherTxSigners(transaction: Transaction | FeeBumpTransaction, signers: string[]): string[]
```

**Parameters**

- `transaction` — The signed transaction.
- `signers` — The signer's public keys.

**Returns**

A list of signers that were found to have signed
   the transaction.

**Example**

```ts
let keypair1 = Keypair.random();
let keypair2 = Keypair.random();
const account = new StellarSdk.Account(keypair1.publicKey(), "-1");

const transaction = new TransactionBuilder(account, { fee: 100 })
   .setTimeout(30)
   .build();

transaction.sign(keypair1, keypair2)
WebAuth.gatherTxSigners(transaction, [keypair1.publicKey(), keypair2.publicKey()])
```

**Source:** [src/webauth/utils.ts:32](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/webauth/utils.ts#L32)

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

**Parameters**

- `challengeTx` — SEP0010 challenge transaction in base64.
- `serverAccountID` — The server's stellar account (public key).
- `networkPassphrase` — The network passphrase, e.g.: 'Test SDF
   Network ; September 2015' (see {@link Networks})
- `homeDomains` — The home domain that is expected
   to be included in the first Manage Data operation's string key. If an
   array is provided, one of the domain names in the array must match.
- `webAuthDomain` — The home domain that is expected to be included
   as the value of the Manage Data operation with the 'web_auth_domain' key.
   If no such operation is included, this parameter is not used.

**Returns**

The actual transaction and the
   Stellar public key (master key) used to sign the Manage Data operation,
   the matched home domain, and the memo attached to the transaction, which
   will be null if not present.

**See also**

- {@link SEP-10: Stellar Web Auth}

**Source:** [src/webauth/challenge_transaction.ts:163](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/webauth/challenge_transaction.ts#L163)

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

**Parameters**

- `challengeTx` — SEP0010 challenge transaction in base64.
- `serverAccountID` — The server's stellar account (public key).
- `networkPassphrase` — The network passphrase, e.g.: 'Test SDF
   Network ; September 2015' (see {@link Networks}).
- `signers` — The signers public keys. This list should
   contain the public keys for all signers that have signed the transaction.
- `homeDomains` — The home domain(s) that should
   be included in the first Manage Data operation's string key. Required in
   readChallengeTx().
- `webAuthDomain` — The home domain that is expected to be included
   as the value of the Manage Data operation with the 'web_auth_domain' key,
   if present. Used in readChallengeTx().

**Returns**

The list of signers public keys that have signed
   the transaction, excluding the server account ID.

**Example**

```ts
import { Networks, TransactionBuilder, WebAuth }  from 'stellar-sdk';

const serverKP = Keypair.random();
const clientKP1 = Keypair.random();
const clientKP2 = Keypair.random();

// Challenge, possibly built in the server side
const challenge = WebAuth.buildChallengeTx(
  serverKP,
  clientKP1.publicKey(),
  "SDF",
  300,
  Networks.TESTNET
);

// clock.tick(200);  // Simulates a 200 ms delay when communicating from server to client

// Transaction gathered from a challenge, possibly from the client side
const transaction = TransactionBuilder.fromXDR(challenge, Networks.TESTNET);
transaction.sign(clientKP1, clientKP2);
const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

// The result below should be equal to [clientKP1.publicKey(), clientKP2.publicKey()]
WebAuth.verifyChallengeTxSigners(
   signedChallenge,
   serverKP.publicKey(),
   Networks.TESTNET,
   threshold,
   [clientKP1.publicKey(), clientKP2.publicKey()]
);
```

**See also**

- {@link SEP-10: Stellar Web Auth}

**Source:** [src/webauth/challenge_transaction.ts:419](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/webauth/challenge_transaction.ts#L419)

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

**Parameters**

- `challengeTx` — SEP0010 challenge transaction in base64.
- `serverAccountID` — The server's stellar account (public key).
- `networkPassphrase` — The network passphrase, e.g.: 'Test SDF
   Network ; September 2015' (see {@link Networks}).
- `threshold` — The required signatures threshold for verifying
   this transaction.
- `signerSummary` — a map of all
   authorized signers to their weights. It's used to validate if the
   transaction signatures have met the given threshold.
- `homeDomains` — The home domain(s) that should
   be included in the first Manage Data operation's string key. Required in
   `verifyChallengeTxSigners() => readChallengeTx()`.
- `webAuthDomain` — The home domain that is expected to be included
   as the value of the Manage Data operation with the 'web_auth_domain' key,
   if present. Used in `verifyChallengeTxSigners() => readChallengeTx()`.

**Returns**

The list of signers public keys that have signed
   the transaction, excluding the server account ID, given that the threshold
   was met.

**Throws**

- Will throw if the collective
   weight of the transaction's signers does not meet the necessary threshold
   to verify this transaction.

**Example**

```ts
import { Networks, TransactionBuilder, WebAuth } from 'stellar-sdk';

const serverKP = Keypair.random();
const clientKP1 = Keypair.random();
const clientKP2 = Keypair.random();

// Challenge, possibly built in the server side
const challenge = WebAuth.buildChallengeTx(
  serverKP,
  clientKP1.publicKey(),
  "SDF",
  300,
  Networks.TESTNET
);

// clock.tick(200);  // Simulates a 200 ms delay when communicating from server to client

// Transaction gathered from a challenge, possibly from the client side
const transaction = TransactionBuilder.fromXDR(challenge, Networks.TESTNET);
transaction.sign(clientKP1, clientKP2);
const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

// Defining the threshold and signerSummary
const threshold = 3;
const signerSummary = [
   {
     key: this.clientKP1.publicKey(),
     weight: 1,
   },
   {
     key: this.clientKP2.publicKey(),
     weight: 2,
   },
 ];

// The result below should be equal to [clientKP1.publicKey(), clientKP2.publicKey()]
WebAuth.verifyChallengeTxThreshold(
   signedChallenge,
   serverKP.publicKey(),
   Networks.TESTNET,
   threshold,
   signerSummary
);
```

**See also**

- {@link SEP-10: Stellar Web Auth}

**Source:** [src/webauth/challenge_transaction.ts:645](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/webauth/challenge_transaction.ts#L645)

## WebAuth.verifyTxSignedBy

Verifies if a transaction was signed by the given account id.

```ts
verifyTxSignedBy(transaction: Transaction | FeeBumpTransaction, accountID: string): boolean
```

**Parameters**

- `transaction` — The signed transaction.
- `accountID` — The signer's public key.

**Returns**

Whether or not `accountID` was found to have signed the
   transaction.

**Example**

```ts
let keypair = Keypair.random();
const account = new StellarSdk.Account(keypair.publicKey(), "-1");

const transaction = new TransactionBuilder(account, { fee: 100 })
   .setTimeout(30)
   .build();

transaction.sign(keypair)
WebAuth.verifyTxSignedBy(transaction, keypair.publicKey())
```

**Source:** [src/webauth/utils.ts:94](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/webauth/utils.ts#L94)
