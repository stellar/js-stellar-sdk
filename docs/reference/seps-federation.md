---
title: SEPs / Federation
---

# SEPs / Federation

## Federation.Api.Options

Options for configuring connections to federation servers. You can also use `Config` class to set this globally.

```ts
interface Options {
  allowHttp?: boolean;
  timeout?: number;
}
```

**Source:** [src/federation/api.ts:25](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/api.ts#L25)

### `options.allowHttp`

Allow connecting to http servers, default: `false`. This must be set to false in production deployments!

```ts
allowHttp?: boolean;
```

**Source:** [src/federation/api.ts:29](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/api.ts#L29)

### `options.timeout`

Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.

```ts
timeout?: number;
```

**Source:** [src/federation/api.ts:33](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/api.ts#L33)

## Federation.Api.Record

Record returned from a federation server.

```ts
interface Record {
  account_id: string;
  memo?: string;
  memo_type?: string;
}
```

**Source:** [src/federation/api.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/api.ts#L7)

### `record.account_id`

The Stellar public key resolved from the federation lookup

```ts
account_id: string;
```

**Source:** [src/federation/api.ts:11](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/api.ts#L11)

### `record.memo`

The memo value, if any, required to send payments to this user

```ts
memo?: string;
```

**Source:** [src/federation/api.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/api.ts#L19)

### `record.memo_type`

The type of memo, if any, required to send payments to this user

```ts
memo_type?: string;
```

**Source:** [src/federation/api.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/api.ts#L15)

## Federation.FEDERATION_RESPONSE_MAX_SIZE

The maximum size of response from a federation server

```ts
const FEDERATION_RESPONSE_MAX_SIZE: number
```

**Source:** [src/federation/server.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/server.ts#L14)

## Federation.Server

Federation.Server handles a network connection to a
[federation server](https://developers.stellar.org/docs/learn/encyclopedia/federation)
instance and exposes an interface for requests to that instance.

```ts
class Server {
  constructor(serverURL: string, domain: string, opts: Options = {});
  static createForDomain(domain: string, opts: Options = {}): Promise<FederationServer>;
  static resolve(value: string, opts: Options = {}): Promise<Record>;
  resolveAccountId(accountId: string): Promise<Record>;
  resolveAddress(address: string): Promise<Record>;
  resolveTransactionId(transactionId: string): Promise<Record>;
}
```

**Source:** [src/federation/server.ts:25](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/server.ts#L25)

### `new Server(serverURL, domain, opts)`

```ts
constructor(serverURL: string, domain: string, opts: Options = {});
```

**Parameters**

- **`serverURL`** — `string` (required)
- **`domain`** — `string` (required)
- **`opts`** — `Options` (optional) (default: `{}`)

**Source:** [src/federation/server.ts:145](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/server.ts#L145)

### `Server.createForDomain(domain, opts)`

Creates a `FederationServer` instance based on information from
[stellar.toml](https://developers.stellar.org/docs/issuing-assets/publishing-asset-info)
file for a given domain.

If `stellar.toml` file does not exist for a given domain or it does not
contain information about a federation server Promise will reject.

```ts
static createForDomain(domain: string, opts: Options = {}): Promise<FederationServer>;
```

**Parameters**

- **`domain`** — `string` (required) — Domain to get federation server for
- **`opts`** — `Options` (optional) (default: `{}`) — (optional) Options object

**Returns**

A promise that resolves to the federation record

**Throws**

- Will throw an error if the domain's stellar.toml file does not contain a federation server field.

**Example**

```ts
StellarSdk.FederationServer.createForDomain('acme.com')
  .then(federationServer => {
    // federationServer.resolveAddress('bob').then(...)
  })
  .catch(error => {
    // stellar.toml does not exist or it does not contain information about federation server.
  });
```

**See also**

- <a href="https://developers.stellar.org/docs/issuing-assets/publishing-asset-info" target="_blank">Stellar.toml doc</a>

**Source:** [src/federation/server.ts:132](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/server.ts#L132)

### `Server.resolve(value, opts)`

A helper method for handling user inputs that contain `destination` value.
It accepts two types of values:

* For Stellar address (ex. `bob*stellar.org`) it splits Stellar address and then tries to find information about
federation server in `stellar.toml` file for a given domain. It returns a `Promise` which resolves if federation
server exists and user has been found and rejects in all other cases.
* For Account ID (ex. `GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS`) it returns a `Promise` which
resolves if Account ID is valid and rejects in all other cases. Please note that this method does not check
if the account actually exists in a ledger.

```ts
static resolve(value: string, opts: Options = {}): Promise<Record>;
```

**Parameters**

- **`value`** — `string` (required) — Stellar Address (ex. `bob*stellar.org`)
- **`opts`** — `Options` (optional) (default: `{}`) — (optional) Options object

**Returns**

A promise that resolves to the federation record

**Throws**

- Will throw an error if the provided account ID is not a valid Ed25519 public key.

**Example**

```ts
StellarSdk.FederationServer.resolve('bob*stellar.org')
 .then(federationRecord => {
   // {
   //   account_id: 'GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS',
   //   memo_type: 'id',
   //   memo: 100
   // }
 });
```

**See also**

- - <a href="https://developers.stellar.org/docs/learn/encyclopedia/federation" target="_blank">Federation doc</a>
 - <a href="https://developers.stellar.org/docs/issuing-assets/publishing-asset-info" target="_blank">Stellar.toml doc</a>

**Source:** [src/federation/server.ts:71](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/server.ts#L71)

### `server.resolveAccountId(accountId)`

Given an account ID, get their federation record if the user was found

```ts
resolveAccountId(accountId: string): Promise<Record>;
```

**Parameters**

- **`accountId`** — `string` (required) — Account ID (ex. `GBYNR2QJXLBCBTRN44MRORCMI4YO7FZPFBCNOKTOBCAAFC7KC3LNPRYS`)

**Returns**

A promise that resolves to the federation record

**Throws**

- Will throw an error if the federation server returns an invalid memo value.
- Will throw an error if the federation server's response exceeds the allowed maximum size.
- Will throw an error if the server query fails with an improper response.

**See also**

- <a href="https://developers.stellar.org/docs/encyclopedia/federation" target="_blank">Federation doc</a>

**Source:** [src/federation/server.ts:202](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/server.ts#L202)

### `server.resolveAddress(address)`

Get the federation record if the user was found for a given Stellar address

```ts
resolveAddress(address: string): Promise<Record>;
```

**Parameters**

- **`address`** — `string` (required) — Stellar address (ex. `bob*stellar.org`). If `FederationServer` was instantiated with `domain` param only username (ex. `bob`) can be passed.

**Returns**

A promise that resolves to the federation record

**Throws**

- Will throw an error if the federated address does not contain a domain, or if the server object was not instantiated with a `domain` parameter

**See also**

- <a href="https://developers.stellar.org/docs/encyclopedia/federation" target="_blank">Federation doc</a>

**Source:** [src/federation/server.ts:174](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/server.ts#L174)

### `server.resolveTransactionId(transactionId)`

Given a transactionId, get the federation record if the sender of the transaction was found

```ts
resolveTransactionId(transactionId: string): Promise<Record>;
```

**Parameters**

- **`transactionId`** — `string` (required) — Transaction ID (ex. `3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889`)

**Returns**

A promise that resolves to the federation record

**Throws**

- Will throw an error if the federation server returns an invalid memo value.
- Will throw an error if the federation server's response exceeds the allowed maximum size.
- Will throw an error if the server query fails with an improper response.

**See also**

- <a href="https://developers.stellar.org/docs/glossary/federation/" target="_blank">Federation doc</a>

**Source:** [src/federation/server.ts:219](https://github.com/stellar/js-stellar-sdk/blob/master/src/federation/server.ts#L219)
