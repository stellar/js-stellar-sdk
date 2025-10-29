import { expect, beforeAll } from "vitest";
import {
  contracts,
  networkPassphrase,
  rpcUrl,
  server,
  generateFundedKeypair,
  run,
  stellar,
} from "./util";
import { Address, contract, Keypair } from "../../../lib";

let context: {
  client: any;
  publicKey: string;
  addr: any;
  contractId: string;
  keypair: any;
};

async function clientFromConstructor(
  name: keyof typeof contracts,
  { keypair = generateFundedKeypair() } = {},
) {
  if (!(name in contracts)) {
    throw new Error(
      `Contract ${name} not found. ` +
        `Pick one of: ${Object.keys(contracts).join()}`,
    );
  }
  const wallet = contract.basicNodeSigner(await keypair, networkPassphrase);

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
    wasmHash,
    publicKey: (await keypair).publicKey(),
    ...wallet,
  });
  const { result: client } = await deploy.signAndSend();

  return {
    keypair: await keypair,
    client,
    contractId: client.options.contractId,
  };
}

/**
 * Generates a Client given the contractId using the from method.
 */
function clientForFromTest(
  contractId: string,
  publicKey: string,
  keypair: Keypair,
) {
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

describe("Client", () => {
  beforeAll(async () => {
    const { client, keypair, contractId } =
      await clientFromConstructor("customTypes");
    const publicKey = keypair.publicKey();
    const addr = Address.fromString(publicKey);
    context = { client, publicKey, addr, contractId, keypair };
  });

  it("can be constructed with `new Client`", async () => {
    const { result } = await context.client.hello({ hello: "tests" });
    expect(result).toBe("tests");
  });

  it("can be constructed with `from`", async () => {
    // objects with different constructors will not pass deepEqual check
    const constructorWorkaround = (object: contract.Client) =>
      JSON.parse(JSON.stringify(object));

    const clientFromFrom = await clientForFromTest(
      context.contractId,
      context.publicKey,
      context.keypair,
    );
    expect(constructorWorkaround(clientFromFrom)).toEqual(
      constructorWorkaround(context.client),
    );
    expect(context.client.spec.entries).toEqual(clientFromFrom.spec.entries);
  });
});
