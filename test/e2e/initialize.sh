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

# Use global stellar in CI, local build for development
if [[ -n "$GITHUB_ACTIONS" ]]; then
    stellar="stellar"
    echo "Using global stellar command (CI environment)"
else
    stellar="$dirname/../../target/bin/stellar"
    echo "Using local stellar binary for development"
    if [[ -f "$stellar" ]]; then
      current=$($stellar --version | head -n 1 | cut -d ' ' -f 2)
      desired=$(cat .cargo/config.toml | grep -oE -- "--version\s+\S+" | awk '{print $2}')
      if [[ "$current" != "$desired" ]]; then
        echo "Current pinned stellar binary: $current. Desired: $desired. Building stellar binary."
        (cd "$dirname/../.." && cargo install_stellar)
      else
        echo "Using stellar binary from ./target/bin"
      fi
      else
        echo "Building pinned stellar binary"
        (cd "$dirname/../.." && cargo install_stellar)
    fi
fi


NETWORK_STATUS=$(curl -s -X POST "$STELLAR_RPC_URL" -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "id": 8675309, "method": "getHealth" }' | sed -n 's/.*"status":\s*"\([^"]*\)".*/\1/p')

echo Network
echo "  RPC:        $STELLAR_RPC_URL"
echo "  Passphrase: \"$STELLAR_NETWORK_PASSPHRASE\""
echo "  Status:     $NETWORK_STATUS"

if [[ "$NETWORK_STATUS" != "healthy" ]]; then
  echo "Network is not healthy (not running?), exiting"
  exit 1
fi

$stellar keys generate $STELLAR_ACCOUNT
$stellar keys fund $STELLAR_ACCOUNT



# retrieve the contracts using stellar contract init then build them if they dont already exist
# Define directory and WASM file paths
target_dir="$dirname/test-contracts/target/wasm32v1-none/release"
contracts_dir="$dirname/test-contracts"
wasm_files=(
    "custom_types.wasm"
    "atomic_swap.wasm"
    "token.wasm"
    "increment.wasm"
    "needs_a_signature.wasm"
    "this_one_signs.wasm"
)

get_test_contracts_git_hash() {
    git ls-files -s "$contracts_dir" | cut -d ' ' -f 2
}

# Get the current git hash
current_hash=$(get_test_contracts_git_hash)

# Check if a stored hash exists
hash_file="$dirname/.last_build_hash"
if [ -f "$hash_file" ]; then
    stored_hash=$(cat "$hash_file")
else
    stored_hash=""
fi

# Check if all WASM files exist and if the git hash has changed
all_exist=true
for wasm_file in "${wasm_files[@]}"; do
    if [ ! -f "$target_dir/$wasm_file" ]; then
    all_exist=false
        break
    fi
done

# If any WASM file is missing or the git hash has changed, initialize and build the contracts
if [ "$all_exist" = false ] || [ "$current_hash" != "$stored_hash" ]; then
    echo "WASM files are missing or contracts have been updated. Initializing and building contracts..."
    # Change directory to test-contracts and build the contracts
    cd "$dirname/test-contracts" || { echo "Failed to change directory!"; exit 1; }
    $stellar contract build
    # Save git hash to file
    echo "$current_hash" > "$hash_file"
else
    echo "All WASM files are present and up to date."
fi
