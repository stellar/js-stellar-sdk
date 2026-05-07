---
title: SEPs / Federation
category: SEPs / Federation
---

# SEPs / Federation

## Federation.Api.Options

Options for configuring connections to federation servers. You can also use {@link Config} class to set this globally.

```ts
interface Options
```

**Source:** [src/federation/api.ts:25](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/federation/api.ts#L25)

## Federation.Api.Record

Record returned from a federation server.

```ts
interface Record
```

**Source:** [src/federation/api.ts:7](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/federation/api.ts#L7)

## Federation.FEDERATION_RESPONSE_MAX_SIZE

The maximum size of response from a federation server

```ts
const FEDERATION_RESPONSE_MAX_SIZE: number
```

**Source:** [src/federation/server.ts:14](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/federation/server.ts#L14)

## Federation.Server

Federation.Server handles a network connection to a
[federation server](https://developers.stellar.org/docs/learn/encyclopedia/federation)
instance and exposes an interface for requests to that instance.

```ts
class Server
```

**Source:** [src/federation/server.ts:25](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/federation/server.ts#L25)
