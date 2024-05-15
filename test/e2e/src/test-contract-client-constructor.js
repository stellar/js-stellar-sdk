const test = require("ava");
const { spawnSync } = require("node:child_process");
const {
  contracts,
  networkPassphrase,
  rpcUrl,
  friendbotUrl,
} = require("./util");
const { Address, contract, Keypair } = require("../../..");

async function generateFundedKeypair() {
  const keypair = Keypair.random();
  await fetch(`${friendbotUrl}/friendbot?addr=${keypair.publicKey()}`);
  return keypair;
}

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

test.before(async (t) => {
  const { client, keypair, contractId } =
    await clientFromConstructor("customTypes");
  const publicKey = keypair.publicKey();
  const addr = Address.fromString(publicKey);
  t.context = { client, publicKey, addr, contractId, keypair }; // eslint-disable-line no-param-reassign
});

test("hello from constructor", async (t) => {
  const { result } = await t.context.client.hello({ hello: "tests" });
  t.is(result, "tests");
});

test("from", async (t) => {
  // objects with different constructors will not pass deepEqual check
  function constructorWorkaround(object) {
    return JSON.parse(JSON.stringify(object));
  }

  const clientFromFrom = await clientForFromTest(
    t.context.contractId,
    t.context.publicKey,
    t.context.keypair,
  );
  t.deepEqual(
    constructorWorkaround(clientFromFrom),
    constructorWorkaround(t.context.client),
  );
  t.deepEqual(t.context.client.spec.entries, clientFromFrom.spec.entries);
});
