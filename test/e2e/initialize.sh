#!/bin/bash

# read .env file, but prefer explicitly set environment variables
IFS=$'\n'
for l in $(cat .env); do
    IFS='=' read -ra VARVAL <<< "$l"
    # If variable with such name already exists, preserves its value
    eval "export ${VARVAL[0]}=\${${VARVAL[0]}:-${VARVAL[1]}}"
done
unset IFS

# a good-enough implementation of __dirname from https://blog.daveeddy.com/2015/04/13/dirname-case-study-for-bash-and-node/
dirname="$(CDPATH= cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "###################### Initializing e2e tests ########################"

soroban="$dirname/../../target/bin/soroban"
if [[ -f "$soroban" ]]; then
  echo "Using soroban binary from ./target/bin"
else
  echo "Building pinned soroban binary"
  (cd "$dirname/../.." && cargo install_soroban)
fi

NETWORK_STATUS=$(curl -s -X POST "$SOROBAN_RPC_URL" -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "id": 8675309, "method": "getHealth" }' | sed 's/.*"status":"\(.*\)".*/\1/')

echo Network
echo "  RPC:        $SOROBAN_RPC_URL"
echo "  Passphrase: \"$SOROBAN_NETWORK_PASSPHRASE\""
echo "  Status:     $NETWORK_STATUS"

if [[ "$NETWORK_STATUS" != "healthy" ]]; then
  echo "Network is not healthy (not running?), exiting"
  exit 1
fi

# Print command before executing, from https://stackoverflow.com/a/23342259/249801
# Discussion: https://github.com/stellar/soroban-tools/pull/1034#pullrequestreview-1690667116
exe() { echo"${@/eval/}" ; "$@" ; }

function fund_all() {
  exe eval "$soroban config identity fund"
  exe eval "$soroban config identity generate alice"
  exe eval "$soroban config identity fund alice"
  exe eval "$soroban config identity generate bob"
  exe eval "$soroban config identity fund bob"
}
function upload() {
  exe eval "($soroban contract $1 --wasm $dirname/$2 --ignore-checks) > $dirname/$3"
}
function deploy() {
  exe eval "($soroban contract deploy --wasm-hash $(cat $dirname/$1) --ignore-checks) > $dirname/$2"
}
function deploy_all() {
  upload deploy  wasms/test_custom_types.wasm contract-id-custom-types.txt
  upload deploy  wasms/test_hello_world.wasm contract-id-hello-world.txt
  upload deploy  wasms/test_swap.wasm contract-id-swap.txt
  upload install wasms/test_token.wasm contract-token-hash.txt
  deploy contract-token-hash.txt contract-id-token-a.txt
  deploy contract-token-hash.txt contract-id-token-b.txt
}
function initialize() {
   exe eval "$soroban contract invoke --id $(cat $dirname/$1) -- initialize --admin $($soroban config identity address) --decimal 0 --name 'Token $2' --symbol '$2'"
}
function initialize_all() {
  initialize contract-id-token-a.txt A
  initialize contract-id-token-b.txt B
}
function generate_spec() {
  exe eval "$soroban contract inspect --wasm $dirname/wasms/$1.wasm --output xdr-base64-array > $dirname/wasms/specs/$1.json"
}
function generate_spec_all() {
  generate_spec test_custom_types
  generate_spec test_hello_world
  generate_spec test_swap
  generate_spec test_token
}
function mint() {
  exe eval "$soroban contract invoke --id $(cat $dirname/$1) -- mint --amount 2000000 --to $($soroban config identity address $2)"
}
function mint_all() {
  mint contract-id-token-a.txt alice
  mint contract-id-token-b.txt bob
}
function check_specs() {
  ls -l $dirname/wasms/specs/*.json 2> /dev/null | wc -l | xargs
}
function check_balance() {
  ls -l $dirname/contract-id-*.txt 2> /dev/null | wc -l | xargs
  if [ $? -eq 0 ]; then
    return 0
  fi
  $soroban contract invoke --id $(cat $dirname/contract-id-token-$1.txt) -- balance --id $($soroban config identity address $2) | xargs
}

if [ $(check_specs) == 4 ]; then
  ALICE_BALANCE=$(check_balance a alice)

  if [ $ALICE_BALANCE -gt 0 ]; then
    echo "Skipping initialization"
    echo "  specs generated: $(check_specs)"
    echo "  alice token A balance: $ALICE_BALANCE"
    echo "To re-initialize, delete generated files with 'yarn clean'"
    exit 0
  fi
fi

fund_all
deploy_all
initialize_all
mint_all
generate_spec_all
