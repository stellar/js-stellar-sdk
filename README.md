# Stellar JS SDK (js-stellar-sdk)

<p class="badges">
  <a href="https://badge.fury.io/js/@stellar%2Fstellar-sdk"><img src="https://badge.fury.io/js/@stellar%2Fstellar-sdk.svg" alt="npm version" height="18"></a>
  <a href="https://www.npmjs.com/package/@stellar/stellar-sdk"><img alt="Weekly Downloads" src="https://img.shields.io/npm/dw/@stellar/stellar-sdk" /></a>
  <a href="https://github.com/stellar/js-stellar-sdk/actions/workflows/tests.yml"><img alt="Test Status" src="https://github.com/stellar/js-stellar-sdk/actions/workflows/tests.yml/badge.svg" /></a>
  <a href="https://deepwiki.com/stellar/js-stellar-sdk"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" /></a>
</p>

`js-stellar-sdk` is a JavaScript library for communicating with a
[Stellar Horizon server](https://developers.stellar.org/docs/data/apis/horizon)
and [Stellar RPC](https://developers.stellar.org/docs/data/apis/rpc). While
primarily intended for applications built on Node.js or in the browser, it can
be adapted for use in other environments with some tinkering.

The library provides:

- a networking layer API for Horizon endpoints (REST-based),
- a networking layer for Soroban RPC (JSONRPC-based).
- facilities for building and signing transactions, for communicating with a
  Stellar Horizon instance, and for submitting transactions or querying network
  history.

**Jump to:**

- [Installation](#installation): details on hitting the ground running
- [Usage](#usage): links to documentation and a variety of workarounds for
  non-traditional JavaScript environments
  - [...with React Native](#usage-with-react-native)
  - [...with Expo](#usage-with-expo-managed-workflows)
  - [...with CloudFlare Workers](#usage-with-cloudflare-workers)
- [CLI](#cli): generate TypeScript bindings for Stellar smart contracts
- [Developing](#developing): contribute to the project!
- [License](#license)

## Installation

Using npm, pnpm, or yarn to include `stellar-sdk` in your own project:

```shell
npm install --save @stellar/stellar-sdk
# or
pnpm add @stellar/stellar-sdk
# or
yarn add @stellar/stellar-sdk
```

Then, require or import it in your JavaScript code:

```js
var StellarSdk = require("@stellar/stellar-sdk");
// or
import * as StellarSdk from "@stellar/stellar-sdk";
```

(Preferably, you would only import the pieces you need to enable tree-shaking
and lower your final bundle sizes.)

### Browsers

You can use a CDN:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/{version}/stellar-sdk.js"></script>
```

> **Note:** Always make sure that you are using the latest version number. They can be found on the [releases page](https://github.com/stellar/js-stellar-sdk/releases) in GitHub.

### Custom Installation

The default bundle uses a native-fetch HTTP client with no axios dependency. If
you need the axios transport (for example, to match the behavior of older SDK
versions), set the `USE_AXIOS` environment variable to `true` when building.

#### Build with Axios

```
pnpm run build:lib:axios
```

This will create `stellar-sdk-axios.js` in `dist/`. Consumers can also import
the axios-backed entry from Node via `@stellar/stellar-sdk/axios`.

### Migrating from @stellar/stellar-base

`@stellar/stellar-base` is now folded into `@stellar/stellar-sdk`. Its classes
and functions are bundled in and re-exported from the top level, so the SDK is
the only package you need.

This only matters if you import `@stellar/stellar-base` directly. If you depend
on `@stellar/stellar-sdk` and never installed the base package separately, skip
this section. The fold-in landed in `@stellar/stellar-sdk` v16.0.0; on earlier
versions the SDK still depends on the separate base package, so don't remove it
there.

To migrate:

1. Install `@stellar/stellar-sdk` if you don't already (see
   [Installation](#installation)).

2. Update your imports. The symbols you import keep their names, so a
   project-wide find and replace of `"@stellar/stellar-base"` with
   `"@stellar/stellar-sdk"` usually does it:

   ```js
   // before
   import { Keypair, TransactionBuilder, Asset } from "@stellar/stellar-base";

   // after
   import { Keypair, TransactionBuilder, Asset } from "@stellar/stellar-sdk";
   ```

3. Uninstall the base package:

   ```shell
   npm uninstall @stellar/stellar-base
   ```

Don't keep both packages installed. Two copies of the base library cause
confusing runtime errors, such as `instanceof` checks failing on values that
look correct.

## Versioning and compatibility

Always use the latest `@stellar/stellar-sdk`. The Stellar network upgrades its
protocol periodically, and an older SDK may fail to decode newer data (for
example, newer XDR). You can check the protocol a network currently runs in the
`current_protocol_version` field of its Horizon root (for example
[horizon.stellar.org](https://horizon.stellar.org/) for Mainnet; Testnet and
Futurenet expose their own).

These docs and the API reference cover the latest version only. To read docs for
an older version, find its Git tag on the
[releases page](https://github.com/stellar/js-stellar-sdk/releases) and browse
the `docs/` directory at that ref on GitHub. The release notes there mark the
breaking changes in each version.

## Usage

The usage documentation for this library lives in a handful of places:

- across the [Stellar Developer Docs](https://developers.stellar.org), which
  includes tutorials and examples, and
- on the generated [API doc site](https://stellar.github.io/js-stellar-sdk/) —
  which also publishes
  [agent-friendly bundles, raw markdown siblings, and a crawler policy](https://stellar.github.io/js-stellar-sdk/agents/)
  for AI tools. The site's URL, base path, and AI policy values live in
  [`config/site.ts`](config/site.ts).

### AI agent documentation

Agents can use the documentation bundles published on the website:

- [`llms.txt`](https://stellar.github.io/js-stellar-sdk/llms.txt) — an index of
  the guides, reference pages, and other agent-facing docs.
- [`llms-full.txt`](https://stellar.github.io/js-stellar-sdk/llms-full.txt) —
  the full documentation corpus plus the changelog in one text file.

These generated bundles are not committed to the repo. To inspect bundles for a
local branch, run `pnpm docs:llms`; the generated files are written under
`public/` for the website build.

You can also refer to:

- the [documentation](https://developers.stellar.org/docs/data/horizon) for the
  Horizon REST API (if using the `Horizon` module) and
- the [documentation](https://developers.stellar.org/docs/data/rpc) for Soroban
  RPC's API (if using the `rpc` module)

### Usage with React Native

The SDK works in React Native, but its JavaScript runtime doesn't ship a couple
of things the SDK expects from Node. You'll need to provide them in your app's
entry file:

1. **A global `Buffer`.** XDR encoding/decoding relies on `Buffer`. Install a
   polyfill and assign it to `global.Buffer`.
2. **A Web Crypto random source.** `Keypair.random()` and SEP-10 challenge
   generation call `crypto.getRandomValues()`, which React Native doesn't
   provide out of the box. Add a polyfill that registers it on the global scope,
   imported once before any SDK code runs.

Modern React Native uses Metro with autolinking, so beyond adding the two
polyfills above, no manual native linking or custom resolver config is required.

If you use Horizon streaming (`server.…().stream()`), be aware it depends on an
`EventSource`, which is now an included dependency and will work in any runtimes
that support [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch),
[ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream),
[TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder),
[URL](https://developer.mozilla.org/en-US/docs/Web/API/URL),
[Event](https://developer.mozilla.org/en-US/docs/Web/API/Event),
[MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent),
[EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget).

React Native apps using the Hermes engine may need to polyfill broken typed
array methods such as `subarray`, since this compatibility is no longer
provided by `@stellar/js-xdr`. If you run into issues, consider a polyfill such
as `@exodus/patch-broken-hermes-typed-arrays`.

#### Usage with Expo managed workflows

Expo has the same two requirements as React Native above — a global `Buffer` and
a `crypto.getRandomValues()` source. Install polyfills for both (use
`npx expo install` so versions are matched to your Expo SDK) and import them at
the top of your entry point (by default `App.js`) before any SDK code.

Once `crypto.getRandomValues()` is available, `Keypair.random()` works normally
— the manual `expo-random` workaround from older Expo SDKs is no longer needed.

#### Usage with CloudFlare Workers

The SDK defaults to a native-`fetch` HTTP client, so Horizon and RPC requests
work in the Workers runtime without an HTTP adapter. The things to watch for
are:

1. **Node compatibility.** The SDK relies on `Buffer`. Enable the
   [`nodejs_compat`](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
   flag in your `wrangler.toml` so Node built-ins are available.
2. **Streaming.** Horizon's `.stream()` depends on `EventSource`; long-lived
   streaming connections don't fit the Workers request model well, so prefer
   polling (`.call()` / `.cursor()`) for Horizon data in a Worker.

## CLI

The SDK includes a command-line tool for generating TypeScript bindings from
Stellar smart contracts. These bindings provide fully-typed client code with IDE
autocompletion and compile-time type checking.

### Running the CLI

```shell
# Using npx (no installation required)
npx @stellar/stellar-sdk generate [options]

# Or if installed globally
stellar-js generate [options]
```

### Generating Bindings

You can generate bindings from three different sources:

#### From a local WASM file

```shell
npx @stellar/stellar-sdk generate \
  --wasm ./path/to/wasm_file/my_contract.wasm \
  --output-dir ./my-contract-client \
  --contract-name my-contract
```

#### From a WASM hash on the network

```shell
# testnet, futurenet, and localnet have default RPC URLs
npx @stellar/stellar-sdk generate \
  --wasm-hash <hex-encoded-hash> \
  --network testnet \
  --output-dir ./my-contract-client \
  --contract-name my-contract
```

#### From a deployed contract ID

```shell
npx @stellar/stellar-sdk generate \
  --contract-id CABC...XYZ \
  --network testnet \
  --output-dir ./my-contract-client
```

#### With custom RPC server options

For mainnet or when connecting to RPC servers that require authentication:

```shell
# Mainnet requires --rpc-url (no default)
npx @stellar/stellar-sdk generate \
  --contract-id CABC...XYZ \
  --rpc-url https://my-rpc-provider.com \
  --network mainnet \
  --output-dir ./my-contract-client

# With custom timeout and headers for authenticated RPC servers
npx @stellar/stellar-sdk generate \
  --contract-id CABC...XYZ \
  --rpc-url https://my-rpc-server.com \
  --network mainnet \
  --output-dir ./my-contract-client \
  --timeout 30000 \
  --headers '{"Authorization": "Bearer my-token"}'

# localnet with default RPC URL auto-enables --allow-http
npx @stellar/stellar-sdk generate \
  --contract-id CABC...XYZ \
  --network localnet \
  --output-dir ./my-contract-client

# When overriding the default URL, you must specify --allow-http if using HTTP
npx @stellar/stellar-sdk generate \
  --contract-id CABC...XYZ \
  --rpc-url http://my-local-server:8000/rpc \
  --network localnet \
  --output-dir ./my-contract-client \
  --allow-http
```

### CLI Options

| Option                   | Description                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `--wasm <path>`          | Path to a local WASM file                                                                       |
| `--wasm-hash <hash>`     | Hex-encoded hash of WASM blob on the network                                                    |
| `--contract-id <id>`     | Contract ID of a deployed contract                                                              |
| `--rpc-url <url>`        | Stellar RPC server URL (has defaults for testnet/futurenet/localnet, required for mainnet)      |
| `--network <network>`    | Network to use: `testnet`, `mainnet`, `futurenet`, or `localnet` (required for network sources) |
| `--output-dir <dir>`     | Output directory for generated bindings (required)                                              |
| `--contract-name <name>` | Name for the generated package (derived from filename if not provided)                          |
| `--overwrite`            | Overwrite existing files in the output directory                                                |
| `--allow-http`           | Allow insecure HTTP connections to RPC server (default: false)                                  |
| `--timeout <ms>`         | RPC request timeout in milliseconds                                                             |
| `--headers <json>`       | Custom headers as JSON object (e.g., `'{"Authorization": "Bearer token"}'`)                     |

#### Default RPC URLs

When using `--network`, the CLI provides default RPC URLs for most networks:

| Network     | Default RPC URL                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `testnet`   | `https://soroban-testnet.stellar.org`                                                                              |
| `futurenet` | `https://rpc-futurenet.stellar.org`                                                                                |
| `localnet`  | `http://localhost:8000/rpc` (auto-enables `--allow-http` only when using default URL)                              |
| `mainnet`   | None - you must provide `--rpc-url` ([find providers](https://developers.stellar.org/docs/data/rpc/rpc-providers)) |

### Generated Output

The CLI generates a complete npm package structure:

```
my-contract-client/
├── src/
│   ├── index.ts      # Barrel exports
│   ├── client.ts     # Typed Client class with contract methods
│   └── types.ts      # TypeScript interfaces for contract types
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

### Using Generated Bindings

After generating, you can use the bindings in your project:

```typescript
import { Client } from "./my-contract-client";

const client = new Client({
  contractId: "CABC...XYZ",
  networkPassphrase: Networks.TESTNET,
  rpcUrl: "https://soroban-testnet.stellar.org",
  publicKey: keypair.publicKey(),
  ...basicNodeSigner(keypair, Networks.TESTNET),
});

// Fully typed method calls with IDE autocompletion
const result = await client.transfer({
  from: "GABC...",
  to: "GDEF...",
  amount: 1000n,
});
```

## Developing

So you want to contribute to the library: welcome! Whether you're working on a
fork or want to make an upstream request, the dev-test loop is pretty
straightforward.

1. Clone the repo:

```shell
git clone https://github.com/stellar/js-stellar-sdk.git
```

2. Install Node

Because we support the oldest maintenance version of Node, please install and
develop on the version pinned in [`.nvmrc`](.nvmrc) (currently Node 22) so you
don't get surprised when your code works locally but breaks in CI.

Here's how to install `nvm` if you haven't: https://github.com/creationix/nvm

```shell
nvm install
```

If you work on several projects that use different Node versions, you might it
helpful to install this automatic version manager:
https://github.com/wbyoung/avn

3. Enable Corepack

```shell
corepack enable
```

4. Install dependencies inside js-stellar-sdk folder:

```shell
cd js-stellar-sdk
pnpm install
```

5. Observe the project's code style

While you're making changes, make sure to run the linter to catch any linting
errors (in addition to making sure your text editor supports ESLint) and conform
to the project's code style.

```shell
pnpm run fmt
```

### Building

You can build the developer version (unoptimized, commented, with source maps,
etc.) or the production bundles:

```shell
pnpm run build
# or
pnpm run build:prod
```

### Testing

To run all tests:

```shell
pnpm run test
```

To run a specific set of tests:

```shell
pnpm run test:node
pnpm run test:browser
pnpm run test:integration
```

To generate and check the documentation site:

```shell
# generate the docs site (reference pages, llms bundles, and the Astro site under dist/site)
pnpm run docs

# preview the built site in a browser
pnpm docs:preview

# the preview server prints the local URL (default http://localhost:4321)

# for a live-reloading dev server instead, use:
pnpm docs:dev
```

### Publishing

For information on how to contribute or publish new versions of this software to
`npm`, please refer to our
[contribution guide](https://github.com/stellar/js-stellar-sdk/blob/master/CONTRIBUTING.md).

## Miscellaneous

### License

js-stellar-sdk is licensed under an Apache-2.0 license. See the
[LICENSE](https://github.com/stellar/js-stellar-sdk/blob/master/LICENSE) file
for details.
