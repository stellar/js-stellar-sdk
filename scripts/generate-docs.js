#!/usr/bin/env node

/**
 * Documentation Generation Script for @stellar/stellar-sdk
 *
 * This script generates comprehensive documentation for all exported
 * functions, classes, interfaces, and types from the library.
 *
 * Usage:
 *   node scripts/generate-docs.js [--format html|markdown|both] [--json]
 *
 * Options:
 *   --format    Output format: 'markdown' (default), 'html', or 'both'
 *   --json      Also generate a JSON representation of the API
 *   --help      Show help message
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs", "api");

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  format: "markdown",
  json: false,
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--format" && args[i + 1]) {
    options.format = args[i + 1];
    i++;
  } else if (args[i] === "--json") {
    options.json = true;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Documentation Generation Script for @stellar/stellar-sdk

Usage:
  node scripts/generate-docs.js [options]

Options:
  --format <type>   Output format: 'markdown' (default), 'html', or 'both'
  --json            Also generate a JSON representation of the API
  --help, -h        Show this help message

Examples:
  node scripts/generate-docs.js                     # Generate Markdown docs
  node scripts/generate-docs.js --format html       # Generate HTML docs
  node scripts/generate-docs.js --format both       # Generate both formats
  node scripts/generate-docs.js --json              # Include JSON API output
`);
    process.exit(0);
  }
}

/**
 * Ensure the docs directory exists
 */
function ensureDocsDir(dir = DOCS_DIR) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Clean the docs directory
 */
function cleanDocs() {
  if (fs.existsSync(DOCS_DIR)) {
    fs.rmSync(DOCS_DIR, { recursive: true, force: true });
  }
  ensureDocsDir();
}

/**
 * Generate HTML documentation using TypeDoc
 */
function generateHtmlDocs() {
  console.log("\n📄 Generating HTML documentation...");

  const outputDir =
    options.format === "both" ? path.join(DOCS_DIR, "html") : DOCS_DIR;

  const typedocArgs = [
    "--options",
    path.join(ROOT_DIR, "typedoc.html.json"),
    "--out",
    outputDir,
  ];

  if (options.json && options.format !== "both") {
    typedocArgs.push("--json", path.join(outputDir, "api.json"));
  }

  try {
    execSync(`npx typedoc ${typedocArgs.join(" ")}`, {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
    console.log(`✅ HTML documentation generated in ${outputDir}`);
    return true;
  } catch (error) {
    console.error("❌ Error generating HTML documentation:", error.message);
    return false;
  }
}

/**
 * Generate Markdown documentation using TypeDoc with markdown plugin
 */
function generateMarkdownDocs() {
  console.log("\n📝 Generating Markdown documentation...");

  const outputDir =
    options.format === "both" ? path.join(DOCS_DIR, "markdown") : DOCS_DIR;

  const typedocArgs = [
    "--options",
    path.join(ROOT_DIR, "typedoc.json"),
    "--out",
    outputDir,
  ];

  if (options.json) {
    typedocArgs.push("--json", path.join(outputDir, "api.json"));
  }

  try {
    execSync(`npx typedoc ${typedocArgs.join(" ")}`, {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
    console.log(`✅ Markdown documentation generated in ${outputDir}`);
    return true;
  } catch (error) {
    console.error("❌ Error generating Markdown documentation:", error.message);
    return false;
  }
}

/**
 * Generate a summary index of all exports
 */
function generateExportsSummary() {
  console.log("\n📋 Generating exports summary...");

  const summaryPath = path.join(DOCS_DIR, "EXPORTS.md");
  const summary = `# @stellar/stellar-sdk - Exported API Summary

This document provides an overview of all functions, classes, interfaces, and types
exported by the @stellar/stellar-sdk library.

Generated: ${new Date().toISOString()}

## Table of Contents

- [Main Exports](#main-exports)
- [Horizon Module](#horizon-module)
- [RPC Module](#rpc-module)
- [Contract Module](#contract-module)
- [Federation Module](#federation-module)
- [WebAuth Module](#webauth-module)
- [StellarToml Module](#stellartoml-module)
- [Errors](#errors)
- [Utilities](#utilities)
- [Re-exports from stellar-base](#re-exports-from-stellar-base)

---

## Main Exports

The main entry point (\`@stellar/stellar-sdk\`) exports the following:

### Configuration
- \`Config\` - Global SDK configuration (HTTP settings, timeouts)
- \`Utils\` - Utility functions (validateTimebounds, sleep)

### Namespaces
- \`Horizon\` - Horizon REST API client and types
- \`rpc\` - Soroban RPC client and types
- \`contract\` - Smart contract interaction tools
- \`Federation\` - Federation protocol (SEP-2)
- \`WebAuth\` - Web authentication (SEP-10)
- \`StellarToml\` - stellar.toml resolution (SEP-1)
- \`Friendbot\` - Testnet account funding

---

## Horizon Module

Import: \`import { Horizon } from '@stellar/stellar-sdk'\`

### Classes
- \`Server\` (HorizonServer) - Main Horizon API client
- \`AccountResponse\` - Account query response wrapper

### Call Builders (Query Builders)
- \`AccountCallBuilder\` - Query accounts
- \`AssetsCallBuilder\` - Query assets
- \`ClaimableBalanceCallBuilder\` - Query claimable balances
- \`EffectCallBuilder\` - Query effects
- \`LedgerCallBuilder\` - Query ledgers
- \`LiquidityPoolCallBuilder\` - Query liquidity pools
- \`OfferCallBuilder\` - Query offers
- \`OperationCallBuilder\` - Query operations
- \`OrderbookCallBuilder\` - Query orderbooks
- \`PathCallBuilder\` - Query payment paths
- \`PaymentCallBuilder\` - Query payments
- \`StrictReceivePathCallBuilder\` - Strict receive path queries
- \`StrictSendPathCallBuilder\` - Strict send path queries
- \`TradeAggregationCallBuilder\` - Query trade aggregations
- \`TradesCallBuilder\` - Query trades
- \`TransactionCallBuilder\` - Query transactions
- \`FriendbotBuilder\` - Friendbot funding requests

### Functions
- \`getCurrentServerTime()\` - Get current server time

### Types & Interfaces
- \`ServerApi\` namespace - Server response types
- \`HorizonApi\` namespace - API interface definitions

---

## RPC Module

Import: \`import { rpc } from '@stellar/stellar-sdk'\` or \`import { Server } from '@stellar/stellar-sdk/rpc'\`

### Classes
- \`Server\` (RpcServer) - Soroban RPC client

### Enums
- \`Durability\` - Contract data durability (Temporary, Persistent)

### Functions
- \`parseRawSimulation()\` - Parse raw simulation response
- \`parseRawEvents()\` - Parse raw events

### Sleep Strategies
- \`BasicSleepStrategy\` - Simple retry delay
- \`LinearSleepStrategy\` - Linear backoff retry

### Types & Interfaces
- \`Api\` namespace - RPC API types
- \`SleepStrategy\` - Retry strategy function type

---

## Contract Module

Import: \`import { contract } from '@stellar/stellar-sdk'\` or \`import { Client } from '@stellar/stellar-sdk/contract'\`

### Classes
- \`Client\` - Smart contract client
- \`AssembledTransaction<T>\` - Transaction builder for contract calls
- \`SentTransaction<T>\` - Sent transaction tracker
- \`Spec\` - Contract specification parser
- \`BasicNodeSigner\` - Node.js transaction signer

### Error Classes
- \`ExpiredStateError\`
- \`InvalidClientRequestError\`
- \`NeedsMoreSignaturesError\`
- \`NoSignerError\`
- \`SimulationFailedError\`
- \`UserRejectedError\`

### Types & Interfaces
- \`ClientOptions\` - Client configuration
- \`MethodOptions\` - Contract method options
- \`Result<T, E>\` - Rust-style result type
- \`Union<T>\` - Tagged union type

### Numeric Types
- \`i32\`, \`i64\`, \`i128\`, \`i256\` - Signed integers
- \`u32\`, \`u64\`, \`u128\`, \`u256\` - Unsigned integers
- \`Timepoint\`, \`Duration\` - Time types

### Callback Types
- \`SignTransaction\` - Transaction signing callback
- \`SignAuthEntry\` - Auth entry signing callback

---

## Federation Module

Import: \`import { Federation } from '@stellar/stellar-sdk'\`

### Classes
- \`Server\` (FederationServer) - Federation protocol client

### Constants
- \`FEDERATION_RESPONSE_MAX_SIZE\` - Maximum response size

### Types
- \`Api\` namespace - Federation API types

---

## WebAuth Module

Import: \`import { WebAuth } from '@stellar/stellar-sdk'\`

### Functions
- Challenge transaction utilities (SEP-10)

### Error Classes
- \`InvalidChallengeError\`

---

## StellarToml Module

Import: \`import { StellarToml } from '@stellar/stellar-sdk'\`

### Classes
- \`Resolver\` - stellar.toml file resolver

### Constants
- \`STELLAR_TOML_MAX_SIZE\` - Maximum TOML file size

### Types
- \`Api.StellarToml\` - stellar.toml structure

---

## Errors

Import: \`import { NetworkError, NotFoundError, ... } from '@stellar/stellar-sdk'\`

### Error Classes
- \`NetworkError\` - Network connection errors
- \`NotFoundError\` - 404 responses
- \`BadRequestError\` - 400 responses
- \`BadResponseError\` - Malformed server responses
- \`AccountRequiresMemoError\` - Missing memo requirement

---

## Utilities

### Config Class
\`\`\`typescript
Config.setAllowHttp(allow: boolean): void
Config.isAllowHttp(): boolean
Config.setTimeout(timeout: number): void
Config.getTimeout(): number
Config.setDefault(): void
\`\`\`

### Utils Class
\`\`\`typescript
Utils.validateTimebounds(transaction, gracePeriod?): boolean
Utils.sleep(ms: number): Promise<void>
\`\`\`

---

## Re-exports from stellar-base

The SDK re-exports everything from \`@stellar/stellar-base\`, including:

### Transaction Building
- \`TransactionBuilder\`
- \`Transaction\`
- \`FeeBumpTransaction\`
- \`Operation\` (with all operation types)
- \`Memo\`

### Accounts & Keys
- \`Keypair\`
- \`Account\`
- \`MuxedAccount\`

### Assets
- \`Asset\`
- \`LiquidityPoolAsset\`
- \`LiquidityPoolId\`

### Cryptography
- \`StrKey\` - Stellar key encoding
- \`hash\` - SHA256 hashing
- \`sign\`, \`verify\` - Ed25519 signatures

### Network
- \`Networks\` - Network passphrases

### XDR Types
- \`xdr\` - Full XDR type definitions
- Various XDR helpers

### Soroban
- \`Address\`
- \`Contract\`
- \`SorobanDataBuilder\`
- \`scValToBigInt\`, \`nativeToScVal\`, etc.

---

For detailed API documentation, see the generated docs in the respective format directories.
`;

  fs.writeFileSync(summaryPath, summary);
  console.log(`✅ Exports summary generated: ${summaryPath}`);
}

/**
 * Count generated files
 */
function countGeneratedFiles() {
  let count = 0;
  function countDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        countDir(path.join(dir, entry.name));
      } else {
        count++;
      }
    }
  }
  countDir(DOCS_DIR);
  return count;
}

/**
 * Main documentation generation function
 */
function generateDocs() {
  console.log("\n========================================");
  console.log("@stellar/stellar-sdk Documentation Generator");
  console.log("========================================");
  console.log(`Format: ${options.format}`);
  console.log(`Include JSON: ${options.json}`);

  cleanDocs();

  let success = true;

  switch (options.format) {
    case "html":
      success = generateHtmlDocs();
      break;
    case "markdown":
      success = generateMarkdownDocs();
      break;
    case "both":
      ensureDocsDir(path.join(DOCS_DIR, "html"));
      ensureDocsDir(path.join(DOCS_DIR, "markdown"));
      success = generateHtmlDocs() && generateMarkdownDocs();
      break;
    default:
      console.error(`❌ Unknown format: ${options.format}`);
      process.exit(1);
  }

  if (success) {
    generateExportsSummary();

    const fileCount = countGeneratedFiles();

    console.log("\n========================================");
    console.log("✅ Documentation generated successfully!");
    console.log(`📁 Output directory: ${DOCS_DIR}`);
    console.log(`📄 Total files generated: ${fileCount}`);
    console.log("========================================\n");
  } else {
    console.error("\n❌ Documentation generation failed!");
    process.exit(1);
  }
}

// Main execution
generateDocs();
