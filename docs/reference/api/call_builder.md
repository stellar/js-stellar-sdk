---
title: CallBuilder
---

## Overview

`CallBuilder` is a class that allows specificity and flexibility when querying the Horizon server.  By using the [Builder Pattern](https://en.wikipedia.org/wiki/Builder_pattern), `CallBuilder` provides methods that can be chained together to generate a query.


## Options

| Method | Param Type | Description |
| --- | --- | --- |
| `limit(limit)` | `integer` | Limits the number of returned resources to the given `limit`.|
| `cursor("token")` | `string` | Return only resources after the given paging token. |
| `order({"asc" or "desc"})` | `string` |  Order the returned collection in "asc" or "desc" order. |
| `call()` | | Triggers a HTTP Request to the Horizon server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).|
| `stream({options})` | object of [properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Properties) | Creates an `EventSource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `EventSource`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). Stream connection timeout is configurable through `options.reconnectTimeout` in  ms, default is 15 seconds. |



## Examples

Let's say you want to look at 20 transactions for an account with the address "GSDEF".  You don't want the latest 20; instead, you want the 20 after the paging token "2354-4".  Finally, you want the server response to be returned in the form of a `Promise`.

So, you take the [`server` object](./server.md) and start with

```js
server.transactions()
```

which returns a `TransactionCallBuilder`, an extension of the `CallBuilder` class.

Then you specify the address you want with `.forAccount()`, a method provided by `TransactionCallBuilder`.

```js
server.transactions()
  .forAccount("GSDEF")
```

You want only 20 transactions, so you can chain `.limit("20")`.  But you also want only transactions after a particular paging token, so you add `.cursor("2354-4")`.  Order doesn't matter with the `limit()`, `cursor()`, and `order()` methods.

```js
server.transactions()
  .forAccount("GSDEF")
  .limit("20")
  .cursor("2354-4")
```

Finally, you want to trigger a HTTP request.  Only `call()` and `stream(options)` does that.  You want the result to be a `Promise`, so you choose `call()`.

```js
server.transactions()
  .forAccount("GSDEF")
  .limit("20")
  .cursor("2354-4")
  .call()
```

