import { expect, beforeAll } from "vitest";
import { contract } from "../../../lib";
import { installContract, rpcUrl, networkPassphrase } from "./util";
import { basicNodeSigner } from "../../../lib/contract";

const INIT_VALUE = 42;

let context: { wasmHash: string; keypair: any };

describe("contract with constructor args", () => {
  beforeAll(async () => {
    const { wasmHash, keypair } = await installContract("increment");
    context = { wasmHash, keypair };
  });

  it("can be instantiated when deployed", async () => {
    const tx = await contract.Client.deploy(
      { counter: INIT_VALUE },
      {
        networkPassphrase,
        rpcUrl,
        allowHttp: true,
        wasmHash: context.wasmHash,
        publicKey: context.keypair.publicKey(),
        ...basicNodeSigner(context.keypair, networkPassphrase),
      },
    );
    const { result: client } = await tx.signAndSend();
    const t = await (client as any).get();
    expect(t.result).toEqual(INIT_VALUE);
  });

  it("fails with useful message if not given arguments", async () => {
    const tx = await contract.Client.deploy(null, {
      networkPassphrase,
      rpcUrl,
      allowHttp: true,
      wasmHash: context.wasmHash,
      publicKey: context.keypair.publicKey(),
      ...basicNodeSigner(context.keypair, networkPassphrase),
    });

    try {
      await tx.signAndSend();
    } catch (error: any) {
      expect(error).toBeInstanceOf(
        contract.AssembledTransaction.Errors.SimulationFailed,
      );
      expect(error.message).toMatch(/MismatchingParameterLen/);
    }
  });
});
