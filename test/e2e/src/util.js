const { spawnSync } = require("node:child_process");
const { contract, Keypair } = require("../../../lib/default");

const basePath = `${__dirname}/../test-contracts/target/wasm32-unknown-unknown/release`;
const contracts = {
  customTypes: {
    hash: spawnSync(
      "./target/bin/soroban",
      [
        "contract",
        "install",
        "--wasm",
        `${basePath}/soroban_custom_types_contract.wasm`,
      ],
      { shell: true, encoding: "utf8" },
    ).stdout.trim(),
    path: `${basePath}/soroban_custom_types_contract.wasm`,
  },
  helloWorld: {
    hash: spawnSync(
      "./target/bin/soroban",
      ["contract", "install", "--wasm", `${basePath}/hello_world.wasm`],
      { shell: true, encoding: "utf8" },
    ).stdout.trim(),
    path: `${basePath}/hello_world.wasm`,
  },
  increment: {
    hash: spawnSync(
      "./target/bin/soroban",
      [
        "contract",
        "install",
        "--wasm",
        `${basePath}/soroban_increment_contract.wasm`,
      ],
      { shell: true, encoding: "utf8" },
    ).stdout.trim(),
    path: `${basePath}/soroban_increment_contract.wasm`,
  },
  swap: {
    hash: spawnSync(
      "./target/bin/soroban",
      [
        "contract",
        "install",
        "--wasm",
        `${basePath}/soroban_atomic_swap_contract.wasm`,
      ],
      { shell: true, encoding: "utf8" },
    ).stdout.trim(),
    path: `${basePath}/soroban_atomic_swap_contract.wasm`,
  },
  token: {
    hash: spawnSync(
      "./target/bin/soroban",
      [
        "contract",
        "install",
        "--wasm",
        `${basePath}/soroban_token_contract.wasm`,
      ],
      { shell: true, encoding: "utf8" },
    ).stdout.trim(),
    path: `${basePath}/soroban_token_contract.wasm`,
  },
};
module.exports.contracts = contracts;

const rpcUrl =
  process.env.SOROBAN_RPC_URL ?? "http://localhost:8000/soroban/rpc";
module.exports.rpcUrl = rpcUrl;
const networkPassphrase =
  process.env.SOROBAN_NETWORK_PASSPHRASE ??
  "Standalone Network ; February 2017";
module.exports.networkPassphrase = networkPassphrase;
const friendbotUrl =
  process.env.SOROBAN_FRIENDBOT_URL ?? "http://localhost:8000/friendbot";
module.exports.friendbotUrl = friendbotUrl;

async function generateFundedKeypair() {
  const keypair = Keypair.random();
  await fetch(
    friendbotUrl === "https://friendbot.stellar.org"
      ? `${friendbotUrl}/?addr=${keypair.publicKey()}`
      : `${friendbotUrl}/friendbot?addr=${keypair.publicKey()}`,
  );
  return keypair;
}
module.exports.generateFundedKeypair = generateFundedKeypair;

/**
 * Generates a Client for the contract with the given name.
 * Also generates a new account to use as as the keypair of this contract. This
 * account is funded by friendbot. You can pass in an account to re-use the
 * same account with multiple contract clients.
 *
 * By default, will re-deploy the contract every time. Pass in the same
 * `contractId` again if you want to re-use the a contract instance.
 */
async function clientFor(
  name,
  { keypair = generateFundedKeypair(), contractId } = {},
) {
  if (!contracts[name]) {
    throw new Error(
      `Contract ${name} not found. ` +
        `Pick one of: ${Object.keys(contracts).join(", ")}`,
    );
  }

  keypair = await keypair; // eslint-disable-line no-param-reassign
  const wallet = contract.basicNodeSigner(keypair, networkPassphrase);

  let wasmHash = contracts[name].hash;
  if (!wasmHash) {
    wasmHash = spawnSync(
      "./target/bin/soroban",
      ["contract", "install", "--wasm", contracts[name].path],
      { shell: true, encoding: "utf8" },
    ).stdout.trim();
  }

  // TODO: do this with js-stellar-sdk, instead of shelling out to the CLI
  contractId =
    contractId ??
    spawnSync(
      "./target/bin/soroban",
      [
        // eslint-disable-line no-param-reassign
        "contract",
        "deploy",
        "--source",
        keypair.secret(),
        "--wasm-hash",
        wasmHash,
      ],
      { shell: true, encoding: "utf8" },
    ).stdout.trim();

  const client = await contract.Client.fromWasmHash(
    wasmHash,
    {
      networkPassphrase,
      contractId,
      rpcUrl,
      allowHttp: true,
      publicKey: keypair.publicKey(),
      ...wallet,
    },
    "hex",
  );
  return {
    keypair,
    client,
    contractId,
  };
}
module.exports.clientFor = clientFor;
