# E2E Tests

End-to-end tests for the Stellar JavaScript SDK, testing contract interactions against a live Stellar network.

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) with the `wasm32v1-none` target
- A running Stellar RPC node (local or remote)

## Test Contracts

The test contracts are managed as a **git submodule** in the `test-contracts/` directory. 

### Initial Setup

After cloning the repository, initialize the submodule:

```bash
git submodule update --init --recursive
```

### Updating Contracts

To pull the latest changes from the test contracts repository:

```bash
git submodule update --remote test-contracts
```

## Environment Configuration

The tests read configuration from a `.env` file in this directory. Create one with the following variables:

```bash
STELLAR_RPC_URL=http://localhost:8000/soroban/rpc
STELLAR_NETWORK_PASSPHRASE="Standalone Network ; February 2017"
STELLAR_ACCOUNT=test-account
```

Environment variables set explicitly will take precedence over `.env` file values.

## Running the Tests

From the repository root:

```bash
# Run all e2e tests
pnpm run test:e2e

# Run with coverage
pnpm run test:e2e

# Run without eval (stricter CSP mode)
pnpm run test:e2e:noeval

# Update snapshots (when binding changes are expected)
pnpm run test:e2e -- --update
```

The test runner will automatically:

1. Install/verify the pinned `stellar` CLI binary (for local development)
2. Check network health
3. Generate and fund a test account
4. Build the test contracts if needed (or if they've changed)

## Test Structure

| Test File | Description |
|-----------|-------------|
| `bindings.test.ts` | Tests for generated contract bindings |
| `cli.test.ts` | Tests for CLI integration |
| `constructor-args.test.ts` | Tests for contract constructor arguments |
| `contract-client-constructor.test.ts` | Tests for contract client construction |
| `custom-types.test.ts` | Tests for custom Soroban types |
| `methods-as-args.test.ts` | Tests for passing methods as arguments |
| `non-invoker-signing-by-contracts.test.ts` | Tests for contract-based signing |
| `swap.test.ts` | Tests for atomic swap contracts |

## Contract Build Caching

The initialization script tracks changes to the test contracts via git hash. Contracts are only rebuilt when:

- Any required WASM file is missing
- The git hash of `test-contracts/` has changed

The build hash is stored in `.last_build_hash` (git-ignored).

## Troubleshooting

### Network not healthy

Ensure your Stellar RPC node is running and accessible at the URL specified in your `.env` file.

### Submodule issues

If the test contracts are missing or outdated:

```bash
git submodule update --init --recursive
```

### Contract build failures

Ensure you have Rust installed with the WASM target:

```bash
rustup target add wasm32v1-none
```
