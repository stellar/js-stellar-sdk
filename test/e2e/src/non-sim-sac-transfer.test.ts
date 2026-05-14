import { expect, describe, it, beforeAll } from "vitest";
import {
  Asset,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  rpc,
} from "../../../lib/esm/index.js";
import { generateFundedKeypair, networkPassphrase, server } from "./util.js";

const TRANSFER_AMOUNT = 1_0000000n; // 1 token with 7 decimals

/**
 * Helper to build, sign, send, and poll a transaction with a single signer.
 */
async function submitTx(
  sourceKeypair: Keypair,
  op: ReturnType<
    | typeof Operation.changeTrust
    | typeof Operation.payment
    | typeof Operation.createStellarAssetContract
  >,
) {
  const account = await server.getAccount(sourceKeypair.publicKey());
  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  }).setTimeout(30);

  builder.addOperation(op);

  const tx = builder.build();
  if (op.body().type === "changeTrust" || op.body().type === "payment") {
    // Classic operations can not be simulated, so we send them directly without simulation to ensure the test setup is complete.
    tx.sign(sourceKeypair);
    const classicResp = await server.sendTransaction(tx);
    const classicResult = await server.pollTransaction(classicResp.hash, {
      attempts: 15,
    });
    if (classicResult.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error(`Classic transaction failed: ${classicResult.status}`);
    }
    return classicResult;
  }
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }
  const assembled = rpc.assembleTransaction(tx, sim).build();
  assembled.sign(sourceKeypair);

  const resp = await server.sendTransaction(assembled);
  const result = await server.pollTransaction(resp.hash, { attempts: 15 });
  if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Transaction failed: ${result.status}`);
  }
  return result;
}

let context: {
  sender: Keypair;
  receiver: Keypair;
  issuer: Keypair;
  customAsset: Asset;
};

// These tests are to ensure that the SAC transfer operation works end-to-end on a real network,
// and to catch any issues with the way the operation is built.
// They are not meant to be exhaustive tests of all possible transfer scenarios,
// but rather a sanity check that basic transfers succeed without errors.
describe("Non-simulated SAC Transfer", () => {
  beforeAll(async () => {
    const sender = await generateFundedKeypair();
    const receiver = await generateFundedKeypair();
    const issuer = await generateFundedKeypair();

    const customAsset = new Asset("TST", issuer.publicKey());

    // 1. Establish trustlines for the custom asset
    await submitTx(sender, Operation.changeTrust({ asset: customAsset }));
    await submitTx(receiver, Operation.changeTrust({ asset: customAsset }));

    // 2. Issuer mints tokens to sender and receiver
    await submitTx(
      issuer,
      Operation.payment({
        destination: sender.publicKey(),
        asset: customAsset,
        amount: "100",
      }),
    );
    await submitTx(
      issuer,
      Operation.payment({
        destination: receiver.publicKey(),
        asset: customAsset,
        amount: "100",
      }),
    );

    // 3. Deploy the Stellar Asset Contract for the custom asset and native
    await submitTx(
      issuer,
      Operation.createStellarAssetContract({ asset: customAsset }),
    );
    await submitTx(
      issuer,
      Operation.createStellarAssetContract({ asset: Asset.native() }),
    );

    context = { sender, receiver, issuer, customAsset };
  });

  describe("native asset transfers", () => {
    it("should transfer native XLM between user accounts", async () => {
      const { sender, receiver } = context;

      const account = await server.getAccount(sender.publicKey());
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .setTimeout(30)
        .addSacTransferOperation(
          receiver.publicKey(),
          Asset.native(),
          TRANSFER_AMOUNT,
        )
        .build();

      tx.sign(sender);

      const response = await server.sendTransaction(tx);
      expect(response.errorResult).toBeUndefined();

      const result = await server.pollTransaction(response.hash, {
        attempts: 10,
      });
      expect(result.status).toBe(rpc.Api.GetTransactionStatus.SUCCESS);
    });

    it("should transfer native XLM from user to contract address", async () => {
      const { sender, customAsset } = context;
      const contractId = customAsset.contractId(networkPassphrase);

      const account = await server.getAccount(sender.publicKey());
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .setTimeout(30)
        .addSacTransferOperation(contractId, Asset.native(), TRANSFER_AMOUNT)
        .build();

      tx.sign(sender);

      const response = await server.sendTransaction(tx);
      expect(response.errorResult).toBeUndefined();

      const result = await server.pollTransaction(response.hash, {
        attempts: 10,
      });
      expect(result.status).toBe(rpc.Api.GetTransactionStatus.SUCCESS);
    });
  });

  describe("custom SAC token transfers", () => {
    it("should transfer a custom SAC token between user accounts", async () => {
      const { sender, receiver, customAsset } = context;

      const account = await server.getAccount(sender.publicKey());
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .setTimeout(30)
        .addSacTransferOperation(
          receiver.publicKey(),
          customAsset,
          TRANSFER_AMOUNT,
        )
        .build();

      tx.sign(sender);

      const response = await server.sendTransaction(tx);
      expect(response.errorResult).toBeUndefined();

      const result = await server.pollTransaction(response.hash, {
        attempts: 10,
      });
      expect(result.status).toBe(rpc.Api.GetTransactionStatus.SUCCESS);
    });

    it("should transfer a custom SAC token from user to contract address", async () => {
      const { sender, customAsset } = context;
      const contractId = customAsset.contractId(networkPassphrase);

      const account = await server.getAccount(sender.publicKey());
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .setTimeout(30)
        .addSacTransferOperation(contractId, customAsset, TRANSFER_AMOUNT)
        .build();

      tx.sign(sender);

      const response = await server.sendTransaction(tx);
      expect(response.errorResult).toBeUndefined();

      const result = await server.pollTransaction(response.hash, {
        attempts: 10,
      });
      expect(result.status).toBe(rpc.Api.GetTransactionStatus.SUCCESS);
    });

    it("should transfer a custom SAC token when sender is the issuer", async () => {
      const { issuer, receiver, customAsset } = context;

      const account = await server.getAccount(issuer.publicKey());
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .setTimeout(30)
        .addSacTransferOperation(
          receiver.publicKey(),
          customAsset,
          TRANSFER_AMOUNT,
        )
        .build();

      tx.sign(issuer);

      const response = await server.sendTransaction(tx);
      expect(response.errorResult).toBeUndefined();

      const result = await server.pollTransaction(response.hash, {
        attempts: 10,
      });
      expect(result.status).toBe(rpc.Api.GetTransactionStatus.SUCCESS);
    });

    it("should transfer a custom SAC token when receiver is the issuer", async () => {
      const { sender, issuer, customAsset } = context;

      const account = await server.getAccount(sender.publicKey());
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .setTimeout(30)
        .addSacTransferOperation(
          issuer.publicKey(),
          customAsset,
          TRANSFER_AMOUNT,
        )
        .build();

      tx.sign(sender);

      const response = await server.sendTransaction(tx);
      expect(response.errorResult).toBeUndefined();

      const result = await server.pollTransaction(response.hash, {
        attempts: 10,
      });
      expect(result.status).toBe(rpc.Api.GetTransactionStatus.SUCCESS);
    });
  });
});
