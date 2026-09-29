# Guide wasm fixtures

Contract wasm that guide snippets deploy in hidden setup. See "Gotchas" in [`../README.md`](../README.md) for the pattern, and [`../setup/deploy.ts`](../setup/deploy.ts) for the helper that deploys them.

## `increment.wasm`

The `increment` contract from the "Deploy the Increment Contract" tutorial, which `docs/guides/06-invoke-a-contract.md` links to. It exports one function, `increment() -> u32`, and has no constructor.

- Source: [`stellar/soroban-examples`](https://github.com/stellar/soroban-examples) at `1f5aeb53d3db5d0e61e53f59d5e6c5ab58eaf8ce`, directory `increment/`
- soroban-sdk: 27.0.6 (from that commit's `Cargo.lock`)
- Built with: `stellar contract build` in `increment/`, stellar-cli 27.0.0, rustc 1.98.1
- sha256 (also the on-chain wasm hash): `debfc66a113bf458f7b4f267089829019d459843c756977b9e3ca70bf1c95f13`

## `auth.wasm`

The `auth` contract from the Auth example, which `docs/guides/07-contract-auth.md` links to. It exports one function, `increment(user: Address, value: u32) -> u32`, which calls `user.require_auth()`. It has no constructor.

- Source: [`stellar/soroban-examples`](https://github.com/stellar/soroban-examples) at `1f5aeb53d3db5d0e61e53f59d5e6c5ab58eaf8ce`, directory `auth/`
- soroban-sdk: 27.0.6 (from that commit's `Cargo.lock`)
- Built with: `stellar contract build` in `auth/`, stellar-cli 27.0.0, rustc 1.98.1
- sha256 (also the on-chain wasm hash): `7f748d3df6596ff0a9affb707b710d30694b6ae0653f3c37eb74b656a1ca7502`

## Rebuilding

The commit is the one before soroban-examples moved to soroban-sdk v28. A contract built with a new major soroban-sdk runs only on a network at that protocol or later ([Software Versions](https://developers.stellar.org/docs/networks/software-versions)). `guides_pr.yml` pins quickstart to protocol 27. Rebuild from a newer commit only after that pin moves.

To rebuild, check out the commit, run the build command, and confirm that the sha256 matches.
