const { expect } = require("chai");
const { spawnSync } = require("node:child_process");
const {
  contracts,
  networkPassphrase,
  rpcUrl,
  server,
  generateFundedKeypair,
  run,
  stellar,
} = require("./util");
const { Address, contract } = require("../../../lib");

async function clientFromConstructor(
  name,
  { keypair = generateFundedKeypair(), contractId } = {},
) {
  if (!contracts[name]) {
    throw new Error(
      `Contract ${name} not found. ` +
        `Pick one of: ${Object.keys(contracts).join()}`,
    );
  }
  keypair = await keypair; // eslint-disable-line no-param-reassign
  const wallet = contract.basicNodeSigner(keypair, networkPassphrase);

  const { path } = contracts[name];
  // TODO: use newer interface instead, `stellar contract info interface` (doesn't yet support xdr-base64-array output)
  const inspected = run(
    `${stellar} contract info --wasm ${path} --output xdr-base64-array`,
  ).stdout;

  let wasmHash = contracts[name].hash;
  if (!wasmHash) {
    wasmHash = run(`${stellar} contract upload --wasm ${path}`).stdout;
  }

  const deploy = await contract.Client.deploy(null, {
    networkPassphrase,
    rpcUrl,
    allowHttp: true,
    server,
    wasmHash,
    publicKey: keypair.publicKey(),
    ...wallet,
  });
  const { result: client } = await deploy.signAndSend();

  return {
    keypair,
    client,
    contractId: client.options.contractId,
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
    server,
    publicKey,
    ...wallet,
  };
  return contract.Client.from(options);
}

describe("Client", function () {
  before(async function () {
    const { client, keypair, contractId } =
      await clientFromConstructor("customTypes");
    const publicKey = keypair.publicKey();
    const addr = Address.fromString(publicKey);
    this.context = { client, publicKey, addr, contractId, keypair };
  });

  it("can be constructed with `new Client`", async function () {
    const { result } = await this.context.client.hello({ hello: "tests" });
    expect(result).to.equal("tests");
  });

  it("can be constructed with `from`", async function () {
    // objects with different constructors will not pass deepEqual check
    function constructorWorkaround(object) {
      return JSON.parse(JSON.stringify(object));
    }

    const clientFromFrom = await clientForFromTest(
      this.context.contractId,
      this.context.publicKey,
      this.context.keypair,
    );
    expect(constructorWorkaround(clientFromFrom)).to.deep.equal(
      constructorWorkaround(this.context.client),
    );
    expect(this.context.client.spec.entries).to.deep.equal(
      clientFromFrom.spec.entries,
    );
  });
});
