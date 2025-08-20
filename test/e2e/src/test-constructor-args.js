const { expect } = require("chai");
const { contract } = require("../../../lib");
const { installContract, rpcUrl, networkPassphrase } = require("./util");
const { basicNodeSigner } = require("../../../lib/contract");

const INIT_VALUE = 42;

describe("contract with constructor args", function () {
  before(async function () {
    const { wasmHash, keypair } = await installContract("increment");
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
    const t = await client.get();
    expect(t.result, INIT_VALUE);
  });

  it("fails with useful message if not given arguments", async function () {
    const tx = await contract.Client.deploy(null, {
      networkPassphrase,
      rpcUrl,
      allowHttp: true,
      wasmHash: this.context.wasmHash,
      publicKey: this.context.keypair.publicKey(),
      ...basicNodeSigner(this.context.keypair, networkPassphrase),
    });
    await expect(tx.signAndSend())
      .to.be.rejectedWith(
        // placeholder error type
        contract.AssembledTransaction.Errors.SimulationFailed,
      )
      .then((error) => {
        // Further assertions on the error object
        expect(error).to.be.instanceOf(
          contract.AssembledTransaction.Errors.SimulationFailed,
          `error is not of type 'NeedMoreArgumentsError'; instead it is of type '${error?.constructor.name}'`,
        );

        if (error) {
          // Using regex to check the error message
          expect(error.message).to.match(/MismatchingParameterLen/);
        }
      });
  });
});
