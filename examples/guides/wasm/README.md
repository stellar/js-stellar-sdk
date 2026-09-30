# Guide wasm fixtures

Contract wasm that guide snippets deploy in hidden setup. See "Gotchas" in [`../README.md`](../README.md) for the pattern, and [`../setup/deploy.ts`](../setup/deploy.ts) for the helper that deploys them.

## `increment.wasm`

The `increment` contract from the "Deploy the Increment Contract" tutorial, which `docs/guides/06-invoke-a-contract.md` links to. It exports one function, `increment() -> u32`, and has no constructor.

- Source: [`stellar/soroban-examples`](https://github.com/stellar/soroban-examples) at `01a9a33dfd4078ea507d6c606906a88370186a6b`, directory `increment/`
- soroban-sdk: 28.0.0 (from that commit's `Cargo.lock`)
- Built with: `stellar contract build` in `increment/`, stellar-cli 28.1.0, rustc 1.98.1
- sha256 (also the on-chain wasm hash): `36bc3b311c3780c847e5724d9dc0d5f160af22d476535a2881ea9155d2049dce`

## `auth.wasm`

The `auth` contract from the Auth example, which `docs/guides/07-contract-auth.md` links to. It exports one function, `increment(user: Address, value: u32) -> u32`, which calls `user.require_auth()`. It has no constructor.

- Source: [`stellar/soroban-examples`](https://github.com/stellar/soroban-examples) at `01a9a33dfd4078ea507d6c606906a88370186a6b`, directory `auth/`
- soroban-sdk: 28.0.0 (from that commit's `Cargo.lock`)
- Built with: `stellar contract build` in `auth/`, stellar-cli 28.1.0, rustc 1.98.1
- sha256 (also the on-chain wasm hash): `cae53933dc47d5c3a77dda027c2e50aeadc2fb2f5721770b164a3901111542c8`

## Rebuilding

The commit is the one where soroban-examples moved to soroban-sdk v28. A contract built with a new major soroban-sdk runs only on a network at that protocol or later ([Software Versions](https://developers.stellar.org/docs/networks/software-versions)). `guides_pr.yml` pins quickstart to protocol 28. Rebuild from a soroban-sdk v29 commit only after that pin moves to 29.

To rebuild, check out the commit, run the build command, and confirm that the sha256 matches.
