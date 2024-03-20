Copy-pasted `.wasm` files (for now!)
====================================

These are built versions of contracts with source code that currently live in
the `test-wasms` directory within soroban-tools. Even there, they are mostly
copy-pasted contracts from `soroban-examples`.

It would probably be best to include `soroban-examples` as a git submodule,
then directly rely on the contracts we want to test against. No more
copy-pasting! But until we can all agree on such an approach, maybe this is
good enough?

Soon the CLI will have a `soroban init` command that allows setting up a new
Cargo workspace and may allow specifying which example contracts to put in it.
If the git submodule is controversial, then we could use that new `init`
command instead.
