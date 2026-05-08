---
title: SEPs / Toml
---

# SEPs / Toml

## StellarToml.Api.ContractId

```ts
type ContractId = string
```

**Source:** [src/stellartoml/index.ts:101](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L101)

## StellarToml.Api.Currency

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

**Source:** [src/stellartoml/index.ts:134](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L134)

### `currency.anchor_asset`

```ts
anchor_asset?: string;
```

**Source:** [src/stellartoml/index.ts:155](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L155)

### `currency.anchor_asset_type`

```ts
anchor_asset_type?: "fiat" | "crypto" | "nft" | "stock" | "bond" | "commodity" | "realestate" | "other";
```

**Source:** [src/stellartoml/index.ts:146](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L146)

### `currency.approval_criteria`

```ts
approval_criteria?: string;
```

**Source:** [src/stellartoml/index.ts:167](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L167)

### `currency.approval_server`

```ts
approval_server?: string;
```

**Source:** [src/stellartoml/index.ts:166](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L166)

### `currency.attestation_of_reserve`

```ts
attestation_of_reserve?: string;
```

**Source:** [src/stellartoml/index.ts:156](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L156)

### `currency.attestation_of_reserve_amount`

```ts
attestation_of_reserve_amount?: string;
```

**Source:** [src/stellartoml/index.ts:157](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L157)

### `currency.attestation_of_reserve_last_audit`

```ts
attestation_of_reserve_last_audit?: string;
```

**Source:** [src/stellartoml/index.ts:158](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L158)

### `currency.code`

```ts
code?: string;
```

**Source:** [src/stellartoml/index.ts:135](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L135)

### `currency.code_template`

```ts
code_template?: string;
```

**Source:** [src/stellartoml/index.ts:136](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L136)

### `currency.collateral_address_messages`

```ts
collateral_address_messages?: string[];
```

**Source:** [src/stellartoml/index.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L164)

### `currency.collateral_address_signatures`

```ts
collateral_address_signatures?: string[];
```

**Source:** [src/stellartoml/index.ts:165](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L165)

### `currency.collateral_addresses`

```ts
collateral_addresses?: string[];
```

**Source:** [src/stellartoml/index.ts:163](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L163)

### `currency.conditions`

```ts
conditions?: string;
```

**Source:** [src/stellartoml/index.ts:142](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L142)

### `currency.desc`

```ts
desc?: string;
```

**Source:** [src/stellartoml/index.ts:141](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L141)

### `currency.display_decimals`

```ts
display_decimals?: number;
```

**Source:** [src/stellartoml/index.ts:138](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L138)

### `currency.fixed_number`

```ts
fixed_number?: number;
```

**Source:** [src/stellartoml/index.ts:143](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L143)

### `currency.image`

```ts
image?: string;
```

**Source:** [src/stellartoml/index.ts:161](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L161)

### `currency.is_asset_anchored`

```ts
is_asset_anchored?: boolean;
```

**Source:** [src/stellartoml/index.ts:145](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L145)

### `currency.is_unlimited`

```ts
is_unlimited?: boolean;
```

**Source:** [src/stellartoml/index.ts:159](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L159)

### `currency.issuer`

```ts
issuer?: string;
```

**Source:** [src/stellartoml/index.ts:137](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L137)

### `currency.max_number`

```ts
max_number?: number;
```

**Source:** [src/stellartoml/index.ts:144](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L144)

### `currency.name`

```ts
name?: string;
```

**Source:** [src/stellartoml/index.ts:140](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L140)

### `currency.redemption_instructions`

```ts
redemption_instructions?: string;
```

**Source:** [src/stellartoml/index.ts:160](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L160)

### `currency.regulated`

```ts
regulated?: boolean;
```

**Source:** [src/stellartoml/index.ts:162](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L162)

### `currency.status`

```ts
status?: "live" | "dead" | "test" | "private";
```

**Source:** [src/stellartoml/index.ts:139](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L139)

## StellarToml.Api.Documentation

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

**Source:** [src/stellartoml/index.ts:103](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L103)

### `documentation.ORG_DBA`

```ts
ORG_DBA?: string;
```

**Source:** [src/stellartoml/index.ts:105](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L105)

### `documentation.ORG_DESCRIPTION`

```ts
ORG_DESCRIPTION?: string;
```

**Source:** [src/stellartoml/index.ts:112](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L112)

### `documentation.ORG_GITHUB`

```ts
ORG_GITHUB?: string;
```

**Source:** [src/stellartoml/index.ts:120](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L120)

### `documentation.ORG_KEYBASE`

```ts
ORG_KEYBASE?: string;
```

**Source:** [src/stellartoml/index.ts:118](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L118)

### `documentation.ORG_LICENSE_NUMBER`

```ts
ORG_LICENSE_NUMBER?: string;
```

**Source:** [src/stellartoml/index.ts:109](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L109)

### `documentation.ORG_LICENSE_TYPE`

```ts
ORG_LICENSE_TYPE?: string;
```

**Source:** [src/stellartoml/index.ts:111](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L111)

### `documentation.ORG_LICENSING_AUTHORITY`

```ts
ORG_LICENSING_AUTHORITY?: string;
```

**Source:** [src/stellartoml/index.ts:110](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L110)

### `documentation.ORG_LOGO`

```ts
ORG_LOGO?: string;
```

**Source:** [src/stellartoml/index.ts:108](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L108)

### `documentation.ORG_NAME`

```ts
ORG_NAME?: string;
```

**Source:** [src/stellartoml/index.ts:104](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L104)

### `documentation.ORG_OFFICIAL_EMAIL`

```ts
ORG_OFFICIAL_EMAIL?: string;
```

**Source:** [src/stellartoml/index.ts:116](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L116)

### `documentation.ORG_PHONE_NUMBER`

```ts
ORG_PHONE_NUMBER?: string;
```

**Source:** [src/stellartoml/index.ts:107](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L107)

### `documentation.ORG_PHONE_NUMBER_ATTESTATION`

```ts
ORG_PHONE_NUMBER_ATTESTATION?: string;
```

**Source:** [src/stellartoml/index.ts:115](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L115)

### `documentation.ORG_PHYSICAL_ADDRESS`

```ts
ORG_PHYSICAL_ADDRESS?: string;
```

**Source:** [src/stellartoml/index.ts:113](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L113)

### `documentation.ORG_PHYSICAL_ADDRESS_ATTESTATION`

```ts
ORG_PHYSICAL_ADDRESS_ATTESTATION?: string;
```

**Source:** [src/stellartoml/index.ts:114](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L114)

### `documentation.ORG_SUPPORT_EMAIL`

```ts
ORG_SUPPORT_EMAIL?: string;
```

**Source:** [src/stellartoml/index.ts:117](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L117)

### `documentation.ORG_TWITTER`

```ts
ORG_TWITTER?: string;
```

**Source:** [src/stellartoml/index.ts:119](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L119)

### `documentation.ORG_URL`

```ts
ORG_URL?: string;
```

**Source:** [src/stellartoml/index.ts:106](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L106)

## StellarToml.Api.ISODateTime

```ts
type ISODateTime = string
```

**Source:** [src/stellartoml/index.ts:102](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L102)

## StellarToml.Api.Principal

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

**Source:** [src/stellartoml/index.ts:123](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L123)

### `principal.email`

```ts
email: string;
```

**Source:** [src/stellartoml/index.ts:125](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L125)

### `principal.github`

```ts
github?: string;
```

**Source:** [src/stellartoml/index.ts:126](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L126)

### `principal.id_photo_hash`

```ts
id_photo_hash?: string;
```

**Source:** [src/stellartoml/index.ts:130](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L130)

### `principal.keybase`

```ts
keybase?: string;
```

**Source:** [src/stellartoml/index.ts:127](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L127)

### `principal.name`

```ts
name: string;
```

**Source:** [src/stellartoml/index.ts:124](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L124)

### `principal.telegram`

```ts
telegram?: string;
```

**Source:** [src/stellartoml/index.ts:128](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L128)

### `principal.twitter`

```ts
twitter?: string;
```

**Source:** [src/stellartoml/index.ts:129](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L129)

### `principal.verification_photo_hash`

```ts
verification_photo_hash?: string;
```

**Source:** [src/stellartoml/index.ts:131](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L131)

## StellarToml.Api.PublicKey

```ts
type PublicKey = string
```

**Source:** [src/stellartoml/index.ts:100](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L100)

## StellarToml.Api.StellarToml

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

**Source:** [src/stellartoml/index.ts:182](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L182)

### `stellarToml.ACCOUNTS`

```ts
ACCOUNTS?: string[];
```

**Source:** [src/stellartoml/index.ts:184](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L184)

### `stellarToml.ANCHOR_QUOTE_SERVER`

```ts
ANCHOR_QUOTE_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:197](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L197)

### `stellarToml.CURRENCIES`

```ts
CURRENCIES?: Currency[];
```

**Source:** [src/stellartoml/index.ts:200](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L200)

### `stellarToml.DIRECT_PAYMENT_SERVER`

```ts
DIRECT_PAYMENT_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:196](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L196)

### `stellarToml.DOCUMENTATION`

```ts
DOCUMENTATION?: Documentation;
```

**Source:** [src/stellartoml/index.ts:198](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L198)

### `stellarToml.FEDERATION_SERVER`

```ts
FEDERATION_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:192](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L192)

### `stellarToml.HORIZON_URL`

```ts
HORIZON_URL?: string;
```

**Source:** [src/stellartoml/index.ts:194](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L194)

### `stellarToml.KYC_SERVER`

```ts
KYC_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:188](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L188)

### `stellarToml.NETWORK_PASSPHRASE`

```ts
NETWORK_PASSPHRASE?: Networks;
```

**Source:** [src/stellartoml/index.ts:185](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L185)

### `stellarToml.PRINCIPALS`

```ts
PRINCIPALS?: Principal[];
```

**Source:** [src/stellartoml/index.ts:199](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L199)

### `stellarToml.SIGNING_KEY`

```ts
SIGNING_KEY?: string;
```

**Source:** [src/stellartoml/index.ts:193](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L193)

### `stellarToml.TRANSFER_SERVER`

```ts
TRANSFER_SERVER?: string;
```

**Source:** [src/stellartoml/index.ts:187](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L187)

### `stellarToml.TRANSFER_SERVER_SEP0024`

```ts
TRANSFER_SERVER_SEP0024?: string;
```

**Source:** [src/stellartoml/index.ts:186](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L186)

### `stellarToml.URI_REQUEST_SIGNING_KEY`

```ts
URI_REQUEST_SIGNING_KEY?: string;
```

**Source:** [src/stellartoml/index.ts:195](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L195)

### `stellarToml.VALIDATORS`

```ts
VALIDATORS?: Validator[];
```

**Source:** [src/stellartoml/index.ts:201](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L201)

### `stellarToml.VERSION`

```ts
VERSION?: string;
```

**Source:** [src/stellartoml/index.ts:183](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L183)

### `stellarToml.WEB_AUTH_CONTRACT_ID`

```ts
WEB_AUTH_CONTRACT_ID?: string;
```

**Source:** [src/stellartoml/index.ts:191](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L191)

### `stellarToml.WEB_AUTH_ENDPOINT`

```ts
WEB_AUTH_ENDPOINT?: string;
```

**Source:** [src/stellartoml/index.ts:189](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L189)

### `stellarToml.WEB_AUTH_FOR_CONTRACTS_ENDPOINT`

```ts
WEB_AUTH_FOR_CONTRACTS_ENDPOINT?: string;
```

**Source:** [src/stellartoml/index.ts:190](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L190)

## StellarToml.Api.StellarTomlResolveOptions

```ts
interface StellarTomlResolveOptions {
  allowedRedirects?: number;
  allowHttp?: boolean;
  timeout?: number;
}
```

**Source:** [src/stellartoml/index.ts:94](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L94)

### `stellarTomlResolveOptions.allowedRedirects`

```ts
allowedRedirects?: number;
```

**Source:** [src/stellartoml/index.ts:97](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L97)

### `stellarTomlResolveOptions.allowHttp`

```ts
allowHttp?: boolean;
```

**Source:** [src/stellartoml/index.ts:95](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L95)

### `stellarTomlResolveOptions.timeout`

```ts
timeout?: number;
```

**Source:** [src/stellartoml/index.ts:96](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L96)

## StellarToml.Api.Url

```ts
type Url = string
```

**Source:** [src/stellartoml/index.ts:99](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L99)

## StellarToml.Api.Validator

```ts
interface Validator {
  ALIAS?: string;
  DISPLAY_NAME?: string;
  HISTORY?: string;
  HOST?: string;
  PUBLIC_KEY?: string;
}
```

**Source:** [src/stellartoml/index.ts:171](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L171)

### `validator.ALIAS`

```ts
ALIAS?: string;
```

**Source:** [src/stellartoml/index.ts:172](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L172)

### `validator.DISPLAY_NAME`

```ts
DISPLAY_NAME?: string;
```

**Source:** [src/stellartoml/index.ts:173](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L173)

### `validator.HISTORY`

```ts
HISTORY?: string;
```

**Source:** [src/stellartoml/index.ts:176](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L176)

### `validator.HOST`

```ts
HOST?: string;
```

**Source:** [src/stellartoml/index.ts:175](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L175)

### `validator.PUBLIC_KEY`

```ts
PUBLIC_KEY?: string;
```

**Source:** [src/stellartoml/index.ts:174](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L174)

## StellarToml.Resolver

Resolver allows resolving `stellar.toml` files.

```ts
class Resolver {
  constructor();
  static resolve(domain: string, opts: StellarTomlResolveOptions = {}): Promise<StellarToml>;
}
```

**Source:** [src/stellartoml/index.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L16)

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

- **`domain`** — `string` (required) — Domain to get stellar.toml file for
- **`opts`** — `StellarTomlResolveOptions` (optional) (default: `{}`) — (optional) Options object
    - `allowHttp` (optional): Allow connecting to http servers. This must be set to false in production deployments!
    - `timeout` (optional): Allow a timeout. Allows user to avoid nasty lag due to TOML resolve issue.

**Returns**

A `Promise` that resolves to the parsed stellar.toml object

**Example**

```ts
StellarSdk.StellarToml.Resolver.resolve('acme.com')
  .then(stellarToml => {
    // stellarToml in an object representing domain stellar.toml file.
  })
  .catch(error => {
    // stellar.toml does not exist or is invalid
  });
```

**See also**

- `Stellar.toml doc`

**Source:** [src/stellartoml/index.ts:38](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L38)

## StellarToml.STELLAR_TOML_MAX_SIZE

The maximum size of stellar.toml file, in bytes

```ts
const STELLAR_TOML_MAX_SIZE: number
```

**Source:** [src/stellartoml/index.ts:11](https://github.com/stellar/js-stellar-sdk/blob/master/src/stellartoml/index.ts#L11)
