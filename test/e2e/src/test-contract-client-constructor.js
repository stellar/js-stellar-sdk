const { expect } = require("chai");
const { spawnSync } = require("node:child_process");
const {
  contracts,
  networkPassphrase,
  rpcUrl,
  generateFundedKeypair,
} = require("./util");
const { Address, contract } = require("../../..");

/**
 * Generates a Client for the contract with the given name.
 * Also generates a new account to use as as the keypair of this contract. This
 * account is funded by friendbot. You can pass in an account to re-use the
 * same account with multiple contract clients.
 *
 * By default, will re-deploy the contract every time. Pass in the same
 * `contractId` again if you want to re-use the a contract instance.
 */
async function clientFromConstructor(
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

  const { path } = contracts[name];
  const xdr = JSON.parse(
    spawnSync(
      "./target/bin/soroban",
      ["contract", "inspect", "--wasm", path, "--output", "xdr-base64-array"],
      { shell: true, encoding: "utf8" },
    ).stdout.trim(),
  );

  const spec = new contract.Spec(xdr);
  let wasmHash = contracts[name].hash;
  if (!wasmHash) {
    wasmHash = spawnSync(
      "./target/bin/soroban",
      ["contract", "install", "--wasm", path],
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

  const client = new contract.Client(spec, {
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
  };
}

/**
 * Generates a Client given the contractId using the from method.
 */
async function clientForFromTest(contractId, publicKey, keypair) {
  keypair = await keypair; // eslint-disable-line no-param-reassign
  const wallet = contract.basicNodeSigner(keypair, networkPassphrase);
  const options = {
    networkPassphrase,
    contractId,
    rpcUrl,
    allowHttp: true,
    publicKey,
    ...wallet,
  };
  return contract.Client.from(options);
}

describe('Contract Tests', function() {
  let context = {};

  before(async function() {
    const { client, keypair, contractId } =
      await clientFromConstructor("customTypes");
    const publicKey = keypair.publicKey();
    const addr = Address.fromString(publicKey);
    context = { client, publicKey, addr, contractId, keypair };
  });

  it("hello from constructor", async function() {
    const { result } = await context.client.hello({ hello: "tests" });
    expect(result).to.equal("tests");
  });

  it("from", async function() {
    // objects with different constructors will not pass deepEqual check
    function constructorWorkaround(object) {
      return JSON.parse(JSON.stringify(object));
    }

    const clientFromFrom = await clientForFromTest(
      context.contractId,
      context.publicKey,
      context.keypair,
    );
    expect(constructorWorkaround(clientFromFrom)).to.deep.equal(
      constructorWorkaround(context.client),
    );
    expect(context.client.spec.entries).to.deep.equal(clientFromFrom.spec.entries);
  });
});
