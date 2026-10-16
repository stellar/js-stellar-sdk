---
title: SEPs / Toml
description: Parse and validate stellar.toml files per SEP-1, including issuer metadata and currency descriptors.
---

# SEPs / Toml

## StellarToml.Resolver

Resolver allows resolving `stellar.toml` files.

```ts
class Resolver {
  constructor();
  static resolve(domain: string, opts: StellarTomlResolveOptions = {}): Promise<StellarToml>;
}
```

**Source:** [src/stellartoml/index.ts:30](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L30)

### `new Resolver()`

```ts
constructor();
```

### `Resolver.resolve(domain, opts)`

Returns a parsed `stellar.toml` file for a given domain.

```ts
static resolve(domain: string, opts: StellarTomlResolveOptions = {}): Promise<StellarToml>;
```

**Parameters**

- **`domain`** — `string` (required) — Domain to get stellar.toml file for. Must be a host name with an optional port; surrounding whitespace and a trailing `/` are ignored.
- **`opts`** — `StellarTomlResolveOptions` (optional) (default: `{}`) — (optional) Options object
    - `allowHttp` (optional): Allow connecting to http servers. This must be set to false in production deployments!
    - `timeout` (optional): Allow a timeout. Allows user to avoid nasty lag due to TOML resolve issue.
    - `allowedRedirects` (optional): The number of redirects to follow, as 0 or a whole number up to `Number.MAX_SAFE_INTEGER`, default: 0. Outside Node, the SDK relies on the runtime to refuse redirects. In a browser, the Fetch build cannot count redirects, so a value above 0 follows up to the browser's own limit. The Axios build in a browser, and both builds in React Native, follow redirects whatever this value is.

**Returns**

A `Promise` that resolves to the parsed stellar.toml object

**Throws**

- `Error` if `domain` is not a plain host name, or `allowedRedirects` is not valid, before any request is made

**Example**

```ts
StellarSdk.StellarToml.Resolver.resolve('acme.com')
  .then(stellarToml => {
    // stellarToml in an object representing domain stellar.toml file.
  })
  .catch(error => {
    // domain is invalid, or stellar.toml does not exist or is invalid
  });
```

**See also**

- `Stellar.toml doc`

**Source:** [src/stellartoml/index.ts:54](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L54)

## StellarToml.STELLAR_TOML_MAX_SIZE

The maximum size of stellar.toml file, in bytes

```ts
const STELLAR_TOML_MAX_SIZE: number
```

**Source:** [src/stellartoml/index.ts:12](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L12)

## Types

### StellarToml.Api.ContractId

```ts
type ContractId = string
```

**Source:** [src/stellartoml/index.ts:143](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L143)

### StellarToml.Api.Currency

```ts
interface Currency {
  anchor_asset?: string;
  anchor_asset_type?: "fiat" | "crypto" | "nft" | "stock" | "bond" | "commodity" | "realestate" | "other";
  approval_criteria?: string;
  approval_server?: string;
  attestation_of_reserve?: string;
  attestation_of_reserve_amount?: string;
  attestation_of_reserve_last_audit?: string;
  code?: string;
  code_template?: string;
  collateral_address_messages?: string[];
  collateral_address_signatures?: string[];
  collateral_addresses?: string[];
  conditions?: string;
  desc?: string;
  display_decimals?: number;
  fixed_number?: number;
  image?: string;
  is_asset_anchored?: boolean;
  is_unlimited?: boolean;
  issuer?: string;
  max_number?: number;
  name?: string;
  redemption_instructions?: string;
  regulated?: boolean;
  status?: "live" | "dead" | "test" | "private";
}
```

**Source:** [src/stellartoml/index.ts:176](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L176)

#### `currency.anchor_asset`

```ts
anchor_asset?: string;
```

**Source:** [src/stellartoml/index.ts:197](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L197)

#### `currency.anchor_asset_type`

```ts
anchor_asset_type?: "fiat" | "crypto" | "nft" | "stock" | "bond" | "commodity" | "realestate" | "other";
```

**Source:** [src/stellartoml/index.ts:188](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L188)

#### `currency.approval_criteria`

```ts
approval_criteria?: string;
```

**Source:** [src/stellartoml/index.ts:209](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L209)

#### `currency.approval_server`

```ts
approval_server?: string;
```

**Source:** [src/stellartoml/index.ts:208](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L208)

#### `currency.attestation_of_reserve`

```ts
attestation_of_reserve?: string;
```

**Source:** [src/stellartoml/index.ts:198](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L198)

#### `currency.attestation_of_reserve_amount`

```ts
attestation_of_reserve_amount?: string;
```

**Source:** [src/stellartoml/index.ts:199](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L199)

#### `currency.attestation_of_reserve_last_audit`

```ts
attestation_of_reserve_last_audit?: string;
```

**Source:** [src/stellartoml/index.ts:200](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L200)

#### `currency.code`

```ts
code?: string;
```

**Source:** [src/stellartoml/index.ts:177](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L177)

#### `currency.code_template`

```ts
code_template?: string;
```

**Source:** [src/stellartoml/index.ts:178](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L178)

#### `currency.collateral_address_messages`

```ts
collateral_address_messages?: string[];
```

**Source:** [src/stellartoml/index.ts:206](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L206)

#### `currency.collateral_address_signatures`

```ts
collateral_address_signatures?: string[];
```

**Source:** [src/stellartoml/index.ts:207](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L207)

#### `currency.collateral_addresses`

```ts
collateral_addresses?: string[];
```

**Source:** [src/stellartoml/index.ts:205](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L205)

#### `currency.conditions`

```ts
conditions?: string;
```

**Source:** [src/stellartoml/index.ts:184](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L184)

#### `currency.desc`

```ts
desc?: string;
```

**Source:** [src/stellartoml/index.ts:183](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L183)

#### `currency.display_decimals`

```ts
display_decimals?: number;
```

**Source:** [src/stellartoml/index.ts:180](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L180)

#### `currency.fixed_number`

```ts
fixed_number?: number;
```

**Source:** [src/stellartoml/index.ts:185](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L185)

#### `currency.image`

```ts
image?: string;
```

**Source:** [src/stellartoml/index.ts:203](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L203)

#### `currency.is_asset_anchored`

```ts
is_asset_anchored?: boolean;
```

**Source:** [src/stellartoml/index.ts:187](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L187)

#### `currency.is_unlimited`

```ts
is_unlimited?: boolean;
```

**Source:** [src/stellartoml/index.ts:201](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L201)

#### `currency.issuer`

```ts
issuer?: string;
```

**Source:** [src/stellartoml/index.ts:179](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L179)

#### `currency.max_number`

```ts
max_number?: number;
```

**Source:** [src/stellartoml/index.ts:186](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L186)

#### `currency.name`

```ts
name?: string;
```

**Source:** [src/stellartoml/index.ts:182](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L182)

#### `currency.redemption_instructions`

```ts
redemption_instructions?: string;
```

**Source:** [src/stellartoml/index.ts:202](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L202)

#### `currency.regulated`

```ts
regulated?: boolean;
```

**Source:** [src/stellartoml/index.ts:204](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L204)

#### `currency.status`

```ts
status?: "live" | "dead" | "test" | "private";
```

**Source:** [src/stellartoml/index.ts:181](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L181)

### StellarToml.Api.Documentation

```ts
interface Documentation {
  ORG_DBA?: string;
  ORG_DESCRIPTION?: string;
  ORG_GITHUB?: string;
  ORG_KEYBASE?: string;
  ORG_LICENSE_NUMBER?: string;
  ORG_LICENSE_TYPE?: string;
  ORG_LICENSING_AUTHORITY?: string;
  ORG_LOGO?: string;
  ORG_NAME?: string;
  ORG_OFFICIAL_EMAIL?: string;
  ORG_PHONE_NUMBER?: string;
  ORG_PHONE_NUMBER_ATTESTATION?: string;
  ORG_PHYSICAL_ADDRESS?: string;
  ORG_PHYSICAL_ADDRESS_ATTESTATION?: string;
  ORG_SUPPORT_EMAIL?: string;
  ORG_TWITTER?: string;
  ORG_URL?: string;
}
```

**Source:** [src/stellartoml/index.ts:145](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L145)

#### `documentation.ORG_DBA`

```ts
ORG_DBA?: string;
```

**Source:** [src/stellartoml/index.ts:147](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L147)

#### `documentation.ORG_DESCRIPTION`

```ts
ORG_DESCRIPTION?: string;
```

**Source:** [src/stellartoml/index.ts:154](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L154)

#### `documentation.ORG_GITHUB`

```ts
ORG_GITHUB?: string;
```

**Source:** [src/stellartoml/index.ts:162](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L162)

#### `documentation.ORG_KEYBASE`

```ts
ORG_KEYBASE?: string;
```

**Source:** [src/stellartoml/index.ts:160](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L160)

#### `documentation.ORG_LICENSE_NUMBER`

```ts
ORG_LICENSE_NUMBER?: string;
```

**Source:** [src/stellartoml/index.ts:151](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L151)

#### `documentation.ORG_LICENSE_TYPE`

```ts
ORG_LICENSE_TYPE?: string;
```

**Source:** [src/stellartoml/index.ts:153](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L153)

#### `documentation.ORG_LICENSING_AUTHORITY`

```ts
ORG_LICENSING_AUTHORITY?: string;
```

**Source:** [src/stellartoml/index.ts:152](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L152)

#### `documentation.ORG_LOGO`

```ts
ORG_LOGO?: string;
```

**Source:** [src/stellartoml/index.ts:150](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L150)

#### `documentation.ORG_NAME`

```ts
ORG_NAME?: string;
```

**Source:** [src/stellartoml/index.ts:146](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L146)

#### `documentation.ORG_OFFICIAL_EMAIL`

```ts
ORG_OFFICIAL_EMAIL?: string;
```

**Source:** [src/stellartoml/index.ts:158](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L158)

#### `documentation.ORG_PHONE_NUMBER`

```ts
ORG_PHONE_NUMBER?: string;
```

**Source:** [src/stellartoml/index.ts:149](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L149)

#### `documentation.ORG_PHONE_NUMBER_ATTESTATION`

```ts
ORG_PHONE_NUMBER_ATTESTATION?: string;
```

**Source:** [src/stellartoml/index.ts:157](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L157)

#### `documentation.ORG_PHYSICAL_ADDRESS`

```ts
ORG_PHYSICAL_ADDRESS?: string;
```

**Source:** [src/stellartoml/index.ts:155](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L155)

#### `documentation.ORG_PHYSICAL_ADDRESS_ATTESTATION`

```ts
ORG_PHYSICAL_ADDRESS_ATTESTATION?: string;
```

**Source:** [src/stellartoml/index.ts:156](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L156)

#### `documentation.ORG_SUPPORT_EMAIL`

```ts
ORG_SUPPORT_EMAIL?: string;
```

**Source:** [src/stellartoml/index.ts:159](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L159)

#### `documentation.ORG_TWITTER`

```ts
ORG_TWITTER?: string;
```

**Source:** [src/stellartoml/index.ts:161](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L161)

#### `documentation.ORG_URL`

```ts
ORG_URL?: string;
```

**Source:** [src/stellartoml/index.ts:148](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L148)

### StellarToml.Api.ISODateTime

```ts
type ISODateTime = string
```

**Source:** [src/stellartoml/index.ts:144](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L144)

### StellarToml.Api.Principal

```ts
interface Principal {
  email: string;
  github?: string;
  id_photo_hash?: string;
  keybase?: string;
  name: string;
  telegram?: string;
  twitter?: string;
  verification_photo_hash?: string;
}
```

**Source:** [src/stellartoml/index.ts:165](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L165)

#### `principal.email`

```ts
email: string;
```

**Source:** [src/stellartoml/index.ts:167](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L167)

#### `principal.github`

```ts
github?: string;
```

**Source:** [src/stellartoml/index.ts:168](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L168)

#### `principal.id_photo_hash`

```ts
id_photo_hash?: string;
```

**Source:** [src/stellartoml/index.ts:172](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L172)

#### `principal.keybase`

```ts
keybase?: string;
```

**Source:** [src/stellartoml/index.ts:169](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L169)

#### `principal.name`

```ts
name: string;
```

**Source:** [src/stellartoml/index.ts:166](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L166)

#### `principal.telegram`

```ts
telegram?: string;
```

**Source:** [src/stellartoml/index.ts:170](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L170)

#### `principal.twitter`

```ts
twitter?: string;
```

**Source:** [src/stellartoml/index.ts:171](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L171)

#### `principal.verification_photo_hash`

```ts
verification_photo_hash?: string;
```

**Source:** [src/stellartoml/index.ts:173](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L173)

### StellarToml.Api.PublicKey

```ts
type PublicKey = string
```

**Source:** [src/stellartoml/index.ts:142](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L142)

### StellarToml.Api.StellarToml

```ts
interface StellarToml {
  ACCOUNTS?: string[];
  ANCHOR_QUOTE_SERVER?: string;
  CURRENCIES?: Currency[];
  DIRECT_PAYMENT_SERVER?: string;
  DOCUMENTATION?: Documentation;
  FEDERATION_SERVER?: string;
  HORIZON_URL?: string;
  KYC_SERVER?: string;
  NETWORK_PASSPHRASE?: Networks;
  PRINCIPALS?: Principal[];
  SIGNING_KEY?: string;
  TRANSFER_SERVER?: string;
  TRANSFER_SERVER_SEP0024?: string;
  URI_REQUEST_SIGNING_KEY?: string;
  VALIDATORS?: Validator[];
  VERSION?: string;
  WEB_AUTH_CONTRACT_ID?: string;
  WEB_AUTH_ENDPOINT?: string;
  WEB_AUTH_FOR_CONTRACTS_ENDPOINT?: string;
}
```

**Source:** [src/stellartoml/index.ts:224](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L224)

#### `stellarToml.ACCOUNTS`

```ts
ACCOUNTS?: string[];
```

**Source:** [src/stellartoml/index.ts:226](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L226)

#### `stellarToml.ANCHOR_QUOTE_SERVER`

```ts
ANCHOR_QUOTE_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:239](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L239)

#### `stellarToml.CURRENCIES`

```ts
CURRENCIES?: Currency[];
```

**Source:** [src/stellartoml/index.ts:242](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L242)

#### `stellarToml.DIRECT_PAYMENT_SERVER`

```ts
DIRECT_PAYMENT_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:238](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L238)

#### `stellarToml.DOCUMENTATION`

```ts
DOCUMENTATION?: Documentation;
```

**Source:** [src/stellartoml/index.ts:240](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L240)

#### `stellarToml.FEDERATION_SERVER`

```ts
FEDERATION_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:234](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L234)

#### `stellarToml.HORIZON_URL`

```ts
HORIZON_URL?: string;
```

**Source:** [src/stellartoml/index.ts:236](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L236)

#### `stellarToml.KYC_SERVER`

```ts
KYC_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:230](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L230)

#### `stellarToml.NETWORK_PASSPHRASE`

```ts
NETWORK_PASSPHRASE?: Networks;
```

**Source:** [src/stellartoml/index.ts:227](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L227)

#### `stellarToml.PRINCIPALS`

```ts
PRINCIPALS?: Principal[];
```

**Source:** [src/stellartoml/index.ts:241](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L241)

#### `stellarToml.SIGNING_KEY`

```ts
SIGNING_KEY?: string;
```

**Source:** [src/stellartoml/index.ts:235](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L235)

#### `stellarToml.TRANSFER_SERVER`

```ts
TRANSFER_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:229](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L229)

#### `stellarToml.TRANSFER_SERVER_SEP0024`

```ts
TRANSFER_SERVER_SEP0024?: string;
```

**Source:** [src/stellartoml/index.ts:228](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L228)

#### `stellarToml.URI_REQUEST_SIGNING_KEY`

```ts
URI_REQUEST_SIGNING_KEY?: string;
```

**Source:** [src/stellartoml/index.ts:237](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L237)

#### `stellarToml.VALIDATORS`

```ts
VALIDATORS?: Validator[];
```

**Source:** [src/stellartoml/index.ts:243](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L243)

#### `stellarToml.VERSION`

```ts
VERSION?: string;
```

**Source:** [src/stellartoml/index.ts:225](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L225)

#### `stellarToml.WEB_AUTH_CONTRACT_ID`

```ts
WEB_AUTH_CONTRACT_ID?: string;
```

**Source:** [src/stellartoml/index.ts:233](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L233)

#### `stellarToml.WEB_AUTH_ENDPOINT`

```ts
WEB_AUTH_ENDPOINT?: string;
```

**Source:** [src/stellartoml/index.ts:231](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L231)

#### `stellarToml.WEB_AUTH_FOR_CONTRACTS_ENDPOINT`

```ts
WEB_AUTH_FOR_CONTRACTS_ENDPOINT?: string;
```

**Source:** [src/stellartoml/index.ts:232](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L232)

### StellarToml.Api.StellarTomlResolveOptions

```ts
interface StellarTomlResolveOptions {
  allowedRedirects?: number;
  allowHttp?: boolean;
  timeout?: number;
}
```

**Source:** [src/stellartoml/index.ts:136](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L136)

#### `stellarTomlResolveOptions.allowedRedirects`

```ts
allowedRedirects?: number;
```

**Source:** [src/stellartoml/index.ts:139](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L139)

#### `stellarTomlResolveOptions.allowHttp`

```ts
allowHttp?: boolean;
```

**Source:** [src/stellartoml/index.ts:137](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L137)

#### `stellarTomlResolveOptions.timeout`

```ts
timeout?: number;
```

**Source:** [src/stellartoml/index.ts:138](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L138)

### StellarToml.Api.Url

```ts
type Url = string
```

**Source:** [src/stellartoml/index.ts:141](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L141)

### StellarToml.Api.Validator

```ts
interface Validator {
  ALIAS?: string;
  DISPLAY_NAME?: string;
  HISTORY?: string;
  HOST?: string;
  PUBLIC_KEY?: string;
}
```

**Source:** [src/stellartoml/index.ts:213](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L213)

#### `validator.ALIAS`

```ts
ALIAS?: string;
```

**Source:** [src/stellartoml/index.ts:214](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L214)

#### `validator.DISPLAY_NAME`

```ts
DISPLAY_NAME?: string;
```

**Source:** [src/stellartoml/index.ts:215](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L215)

#### `validator.HISTORY`

```ts
HISTORY?: string;
```

**Source:** [src/stellartoml/index.ts:218](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L218)

#### `validator.HOST`

```ts
HOST?: string;
```

**Source:** [src/stellartoml/index.ts:217](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L217)

#### `validator.PUBLIC_KEY`

```ts
PUBLIC_KEY?: string;
```

**Source:** [src/stellartoml/index.ts:216](https://github.com/stellar/js-stellar-sdk/blob/main/src/stellartoml/index.ts#L216)
