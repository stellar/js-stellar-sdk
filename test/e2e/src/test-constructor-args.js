const { expect } = require("chai");
const { Address, contract, hash } = require("../../../lib");
const { installContract, rpcUrl, networkPassphrase } = require("./util");
const { basicNodeSigner } = require("../../../lib/contract");

describe("Constructor Args", function () {
  before(async function () {
    const { wasmHash, keypair } = await installContract("constructorArgs");
    this.context = { wasmHash, keypair };
  });

  it("does things", async function () {
    expect(this.context.wasmHash).not.to.be.empty;
    const tx = await contract.Client.deploy(
      { counter: 42 },
      {
        networkPassphrase,
        rpcUrl,
        allowHttp: true,
        wasmHash: this.context.wasmHash,
        salt: hash(Buffer.from("salt")),
        publicKey: this.context.keypair.publicKey(),
        ...basicNodeSigner(this.context.keypair),
      },
    );
    console.log(tx);
    const { result } = await tx.signAndSend();
    console.log(result);
  });
});
