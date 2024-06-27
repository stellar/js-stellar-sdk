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
  current=$($soroban --version | head -n 1 | cut -d ' ' -f 2)
  desired=$(cat .cargo/config.toml | grep -oE -- "--version\s+\S+" | awk '{print $2}')
  if [[ "$current" != "$desired" ]]; then
    echo "Current pinned soroban binary: $current. Desired: $desired. Building soroban binary."
    (cd "$dirname/../.." && cargo install_soroban)
  else
    echo "Using soroban binary from ./target/bin"
  fi
else
  echo "Building pinned soroban binary"
  (cd "$dirname/../.." && cargo install_soroban)
fi

NETWORK_STATUS=$(curl -s -X POST "$SOROBAN_RPC_URL" -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "id": 8675309, "method": "getHealth" }' | sed -n 's/.*"status":\s*"\([^"]*\)".*/\1/p')

echo Network
echo "  RPC:        $SOROBAN_RPC_URL"
echo "  Passphrase: \"$SOROBAN_NETWORK_PASSPHRASE\""
echo "  Status:     $NETWORK_STATUS"

if [[ "$NETWORK_STATUS" != "healthy" ]]; then
  echo "Network is not healthy (not running?), exiting"
  exit 1
fi

$soroban keys generate $SOROBAN_ACCOUNT

# retrieve the contracts using soroban contract init then build them if they dont already exist
# Define directory and WASM file paths
target_dir="$dirname/test-contracts/target/wasm32-unknown-unknown/release"
wasm_files=(
    "soroban_custom_types_contract.wasm"
    "soroban_atomic_swap_contract.wasm"
    "soroban_token_contract.wasm"
    "soroban_increment_contract.wasm"
    "hello_world.wasm"
)

# Check if all WASM files exist
all_exist=true
for wasm_file in "${wasm_files[@]}"; do
    if [ ! -f "$target_dir/$wasm_file" ]; then
        all_exist=false
        break
    fi
done

# If any WASM file is missing, initialize and build the contracts
if [ "$all_exist" = false ]; then
    echo "One or more WASM files are missing. Initializing and building contracts..."
    
    # Initialize contracts
    $soroban contract init "$dirname/test-contracts" --with-example increment custom_types atomic_swap token
    
    # Change directory to test-contracts and build the contracts
    cd "$dirname/test-contracts" || { echo "Failed to change directory!"; exit 1; }
    $soroban contract build
else
    echo "All WASM files are present."
fi
