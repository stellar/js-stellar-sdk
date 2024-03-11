const { spawnSync } = require('node:child_process')
const { ContractSpec, Keypair } = require('../../..')
const {
  ContractClient,
  BasicNodeSigner,
} = require('../../../lib/contract_client')

const contracts = {
  customTypes: {
    hash: spawnSync("./target/bin/soroban", ["contract", "install", "--wasm", `${__dirname}/../wasms/test_custom_types.wasm`], { shell: true, encoding: "utf8" }).stdout.trim(),
    xdr: JSON.parse(spawnSync("./target/bin/soroban", ["contract", "inspect", "--wasm", `${__dirname}/../wasms/test_custom_types.wasm`, "--output", "xdr-base64-array"], { shell: true, encoding: "utf8" }).stdout.trim()),
  },
  helloWorld: {
    hash: spawnSync("./target/bin/soroban", ["contract", "install", "--wasm", `${__dirname}/../wasms/test_hello_world.wasm`], { shell: true, encoding: "utf8" }).stdout.trim(),
    xdr: JSON.parse(spawnSync("./target/bin/soroban", ["contract", "inspect", "--wasm", `${__dirname}/../wasms/test_hello_world.wasm`, "--output", "xdr-base64-array"], { shell: true, encoding: "utf8" }).stdout.trim()),
  },
  swap: {
    hash: spawnSync("./target/bin/soroban", ["contract", "install", "--wasm", `${__dirname}/../wasms/test_swap.wasm`], { shell: true, encoding: "utf8" }).stdout.trim(),
    xdr: JSON.parse(spawnSync("./target/bin/soroban", ["contract", "inspect", "--wasm", `${__dirname}/../wasms/test_swap.wasm`, "--output", "xdr-base64-array"], { shell: true, encoding: "utf8" }).stdout.trim()),
  },
  token: {
    hash: spawnSync("./target/bin/soroban", ["contract", "install", "--wasm", `${__dirname}/../wasms/test_token.wasm`], { shell: true, encoding: "utf8" }).stdout.trim(),
    xdr: JSON.parse(spawnSync("./target/bin/soroban", ["contract", "inspect", "--wasm", `${__dirname}/../wasms/test_token.wasm`, "--output", "xdr-base64-array"], { shell: true, encoding: "utf8" }).stdout.trim()),
  },
};
module.exports.contracts = contracts

const rpcUrl = process.env.SOROBAN_RPC_URL ?? "http://localhost:8000/soroban/rpc";
module.exports.rpcUrl = rpcUrl
const networkPassphrase = process.env.SOROBAN_NETWORK_PASSPHRASE ?? "Standalone Network ; February 2017";
module.exports.networkPassphrase = networkPassphrase
const friendbotUrl = process.env.SOROBAN_FRIENDBOT_URL ?? "http://localhost:8000/friendbot";
module.exports.friendbotUrl = friendbotUrl

async function generateFundedKeypair() {
  const keypair = Keypair.random()
  await fetch(`${friendbotUrl}/friendbot?addr=${keypair.publicKey()}`)
  return keypair
};
module.exports.generateFundedKeypair = generateFundedKeypair

/**
 * Generates a ContractClient for the contract with the given name.
 * Also generates a new account to use as as the keypair of this contract. This
 * account is funded by friendbot. You can pass in an account to re-use the
 * same account with multiple contract clients.
 *
 * By default, will re-deploy the contract every time. Pass in the same
 * `contractId` again if you want to re-use the a contract instance.
 */
async function clientFor(contract, { keypair = generateFundedKeypair(), contractId } = {}) {
  if (!contracts[contract]) {
    throw new Error(
      `Contract ${contract} not found. ` +
      `Pick one of: ${Object.keys(contracts).join(", ")}`
    )
  }

  keypair = await keypair // eslint-disable-line no-param-reassign
  const wallet = new BasicNodeSigner(keypair, networkPassphrase)

  const spec = new ContractSpec(contracts[contract].xdr)

  const wasmHash = contracts[contract].hash;
  if (!wasmHash) {
    throw new Error(`No wasm hash found for \`contracts[${contract}]\`! ${JSON.stringify(contracts[contract], null, 2)}`)
  }

  // TODO: do this with js-stellar-sdk, instead of shelling out to the CLI
  contractId = contractId ?? spawnSync("./target/bin/soroban", [ // eslint-disable-line no-param-reassign
    "contract",
    "deploy",
    "--source",
    keypair.secret(),
    "--wasm-hash",
    wasmHash,
  ], { shell: true, encoding: "utf8" }).stdout.trim();

  const client = new ContractClient(spec, {
    networkPassphrase,
    contractId,
    rpcUrl,
    allowHttp: true,
    publicKey: keypair.publicKey(),
    ...wallet,
  });
  return {
    keypair,
    client,
    contractId,
  }
}
module.exports.clientFor = clientFor
