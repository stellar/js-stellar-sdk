const { expect } = require("chai");
const { Address, contract, hash } = require("../../../lib");
const { installContract, rpcUrl, networkPassphrase } = require("./util");
const { basicNodeSigner } = require("../../../lib/contract");

const INIT_VALUE = 42;

describe("contract with constructor args", function () {
  before(async function () {
    const { wasmHash, keypair } = await installContract("constructorArgs");
    this.context = { wasmHash, keypair };
  });

  it("can be instantiated when deployed", async function () {
    const tx = await contract.Client.deploy(
      { counter: INIT_VALUE },
      {
        networkPassphrase,
        rpcUrl,
        allowHttp: true,
        wasmHash: this.context.wasmHash,
        publicKey: this.context.keypair.publicKey(),
        ...basicNodeSigner(this.context.keypair, networkPassphrase),
      },
    );
    const { result: client } = await tx.signAndSend();
    const t = await client.counter();
    expect(t.result, INIT_VALUE);
  });

  it("fails deploy if not given arguments", async function () {
    const tx = await contract.Client.deploy(null, {
      networkPassphrase,
      rpcUrl,
      allowHttp: true,
      wasmHash: this.context.wasmHash,
      publicKey: this.context.keypair.publicKey(),
      ...basicNodeSigner(this.context.keypair, networkPassphrase),
    });
    expect(tx.signAndSend().then((t) => t.result)).to.eventually.throw();
  });
});
