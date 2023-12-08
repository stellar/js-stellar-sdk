Contract Specs, soon to be obsolete
===================================

Ok, so if you read the README in the parent directory, you know that we are currently including WASM files in this project because we don't yet have a good way of including the original Rust projects from which those WASM files are generated.

We also don't yet have a way to fetch the XDR contract spec from deployed contracts, using stellar-sdk. Instead, we need to generate JSON files from the WASM files using the CLI (`soroban contract inspect`; see [initialize.sh](../../initialize.sh)).

In the future, we can use something like `wasm-walrus-tools` to fetch the XDR contract spec from deployed contracts, and we won't need this directory anymore.

These JSON files are generated automatically by the `initialize.sh` script, and are not included in the git repository.
