import { expect, describe, it, beforeAll } from "vitest";
import {
  Asset,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  rpc,
} from "../../../lib/esm/index.js";
import {
  clientFor,
  generateFundedKeypair,
  networkPassphrase,
  server,
} from "./util.js";

/**
 * Deploy the Stellar Asset Contract (SAC) for the given asset and return its
 * contract id. `createStellarAssetContract` is a Soroban operation, so it must
 * be simulated and assembled before being sent.
 */
async function deploySac(asset: Asset, source: Keypair): Promise<string> {
  const account = await server.getAccount(source.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .setTimeout(30)
    .addOperation(Operation.createStellarAssetContract({ asset }))
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`SAC deploy simulation failed: ${sim.error}`);
  }
  const assembled = rpc.assembleTransaction(tx, sim).build();
  assembled.sign(source);

  const resp = await server.sendTransaction(assembled);
  const result = await server.pollTransaction(resp.hash, { attempts: 15 });
  if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`SAC deploy failed: ${result.status}`);
  }
  return asset.contractId(networkPassphrase);
}

// Happy-path coverage for `rpc.Server.queryContract` against a real network,
// exercising both branches of the contract.Client.from SAC detection: a regular
// Wasm contract and a built-in Stellar Asset Contract.
describe("Server#queryContract", () => {
  describe("Wasm contract", () => {
    let contractId: string;

    beforeAll(async () => {
      ({ contractId } = await clientFor("customTypes"));
    });

    it("reads a zero-arg method and decodes the result", async () => {
      const { result: count, isReadCall } = await server.queryContract<number>(
        contractId,
        "get_count",
      );
      expect(count).toBe(0);
      expect(isReadCall).toBe(true);
    });

    it("reads a method that takes arguments", async () => {
      const { result } = await server.queryContract<number>(
        contractId,
        "multi_args",
        { a: 1, b: true },
      );
      expect(result).toBe(1);
    });

    it("lists the contract's methods and signatures", async () => {
      const methods = await server.getContractMethods(contractId);
      const byName = new Map(methods.map((m) => [m.name, m]));

      // The same methods exercised by queryContract above must show up.
      expect(byName.get("get_count")).toMatchObject({ inputs: [] });
      expect(byName.get("multi_args")?.inputs.map((i) => i.name)).toEqual([
        "a",
        "b",
      ]);
    });
  });

  describe("Stellar Asset Contract (SAC)", () => {
    let sacId: string;
    let issuer: Keypair;

    beforeAll(async () => {
      issuer = await generateFundedKeypair();
      const asset = new Asset("TST", issuer.publicKey());
      sacId = await deploySac(asset, issuer);
    });

    it("reads decimals from the embedded SAC spec", async () => {
      const { result, isReadCall } = await server.queryContract<number>(
        sacId,
        "decimals",
      );
      expect(result).toBe(7);
      expect(isReadCall).toBe(true);
    });

    it("reads symbol from the embedded SAC spec", async () => {
      const { result } = await server.queryContract<string>(sacId, "symbol");
      expect(result).toBe("TST");
    });

    it("reads name from the embedded SAC spec", async () => {
      const { result } = await server.queryContract<string>(sacId, "name");
      expect(result).toBe(`TST:${issuer.publicKey()}`);
    });

    it("lists the built-in SAC methods from the embedded spec", async () => {
      const names = (await server.getContractMethods(sacId)).map((m) => m.name);
      // A representative subset of the well-known SAC interface.
      expect(names).toEqual(
        expect.arrayContaining(["decimals", "name", "balance", "transfer"]),
      );
    });
  });
});
