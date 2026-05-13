---
title: Cross-cutting
description: Cross-cutting utilities — global configuration, BigNumber helpers, URL parsing, and shared internals.
---

# Cross-cutting

## Config

Global config class.

```ts
class Config {
  constructor();
  static getTimeout(): number;
  static isAllowHttp(): boolean;
  static setAllowHttp(value: boolean): void;
  static setDefault(): void;
  static setTimeout(value: number): void;
}
```

**Example**

```ts
import { Config } from '@stellar/stellar-sdk';
Config.setAllowHttp(true);
Config.setTimeout(5000);
```

**Example**

```ts
StellarSdk.Config.setAllowHttp(true);
StellarSdk.Config.setTimeout(5000);
```

**Source:** [src/config.ts:39](https://github.com/stellar/js-stellar-sdk/blob/master/src/config.ts#L39)

### `new Config()`

```ts
constructor();
```

### `Config.getTimeout()`

Returns the configured `timeout` flag.

```ts
static getTimeout(): number;
```

**Returns**

The timeout value.

**Source:** [src/config.ts:71](https://github.com/stellar/js-stellar-sdk/blob/master/src/config.ts#L71)

### `Config.isAllowHttp()`

Returns the configured `allowHttp` flag.

```ts
static isAllowHttp(): boolean;
```

**Returns**

The allowHttp value.

**Source:** [src/config.ts:63](https://github.com/stellar/js-stellar-sdk/blob/master/src/config.ts#L63)

### `Config.setAllowHttp(value)`

Sets `allowHttp` flag globally. When set to `true`, connections to insecure
http protocol servers will be allowed. Must be set to `false` in
production.

```ts
static setAllowHttp(value: boolean): void;
```

**Parameters**

- **`value`** — `boolean` (required)

**Source:** [src/config.ts:46](https://github.com/stellar/js-stellar-sdk/blob/master/src/config.ts#L46)

### `Config.setDefault()`

Sets all global config flags to default values.

```ts
static setDefault(): void;
```

**Source:** [src/config.ts:78](https://github.com/stellar/js-stellar-sdk/blob/master/src/config.ts#L78)

### `Config.setTimeout(value)`

Sets `timeout` flag globally. When set to anything besides 0, the request
will timeout after specified time (ms).

```ts
static setTimeout(value: number): void;
```

**Parameters**

- **`value`** — `number` (required)

**Source:** [src/config.ts:55](https://github.com/stellar/js-stellar-sdk/blob/master/src/config.ts#L55)

## Utils

Miscellaneous utilities.

```ts
class Utils {
  constructor();
  static sleep(ms: number): Promise<void>;
  static validateTimebounds(transaction: Transaction, gracePeriod: number = 0): boolean;
}
```

**Source:** [src/utils.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/utils.ts#L7)

### `new Utils()`

```ts
constructor();
```

### `Utils.sleep(ms)`

```ts
static sleep(ms: number): Promise<void>;
```

**Parameters**

- **`ms`** — `number` (required)

**Source:** [src/utils.ts:34](https://github.com/stellar/js-stellar-sdk/blob/master/src/utils.ts#L34)

### `Utils.validateTimebounds(transaction, gracePeriod)`

Verifies if the current date is within the transaction's timebounds

```ts
static validateTimebounds(transaction: Transaction, gracePeriod: number = 0): boolean;
```

**Parameters**

- **`transaction`** — `Transaction` (required) — The transaction whose timebounds will be validated.
- **`gracePeriod`** — `number` (optional) (default: `0`) — (optional) An additional window of time that should be considered valid on either end of the transaction's time range.

**Returns**

Returns true if the current time is within the transaction's [minTime, maxTime] range.

**Source:** [src/utils.ts:17](https://github.com/stellar/js-stellar-sdk/blob/master/src/utils.ts#L17)
