import { expect, describe, it, beforeAll } from "vitest";
import { contract, rpc } from "../../../lib";
import { clientFor, generateFundedKeypair } from "./util";

const amountAToSwap = 2n;
const amountBToSwap = 1n;

let context: {
  root: any;
  alice: any;
  bob: any;
  swapContractAsRoot: any;
  swapId: string;
  tokenA: any;
  tokenAId: string;
  tokenB: any;
  tokenBId: string;
};

describe("Swap Contract Tests", () => {
  beforeAll(async () => {
    const alice = await generateFundedKeypair();
    const bob = await generateFundedKeypair();

    const {
      client: tokenA,
      contractId: tokenAId,
      keypair: root,
    } = await clientFor("token");
    const { client: tokenB, contractId: tokenBId } = await clientFor("token", {
      keypair: root!,
    });
    const { client: swapContractAsRoot, contractId: swapId } = await clientFor(
      "swap",
      { keypair: root! },
    );
    await (
      await (tokenA as any).initialize({
        admin: root!.publicKey(),
        decimal: 0,
        name: "Token A",
        symbol: "A",
      })
    ).signAndSend();
    await (
      await (tokenA as any).mint({
        amount: amountAToSwap,
        to: alice.publicKey(),
      })
    ).signAndSend();

    const tokenBInit = await (tokenB as any).initialize({
      admin: root!.publicKey(),
      decimal: 0,
      name: "Token B",
      symbol: "B",
    });
    await tokenBInit.signAndSend();
    await (
      await (tokenB as any).mint({ amount: amountBToSwap, to: bob.publicKey() })
    ).signAndSend();

    context = {
      root,
      alice,
      bob,
      swapContractAsRoot,
      swapId,
      tokenA,
      tokenAId,
      tokenB,
      tokenBId,
    };
  });

  it("calling `signAndSend()` too soon throws descriptive error", async () => {
    const tx = await context.swapContractAsRoot.swap({
      a: context.alice.publicKey(),
      b: context.bob.publicKey(),
      token_a: context.tokenAId,
      token_b: context.tokenBId,
      amount_a: amountAToSwap,
      min_a_for_b: amountAToSwap,
      amount_b: amountBToSwap,
      min_b_for_a: amountBToSwap,
    });
    await expect(tx.signAndSend()).rejects.toThrow(
      contract.AssembledTransaction.Errors.NeedsMoreSignatures,
    );

    // Test the specific error details
    try {
      await tx.signAndSend();
    } catch (error: any) {
      expect(error).toBeInstanceOf(
        contract.AssembledTransaction.Errors.NeedsMoreSignatures,
      );
      expect(error.message).toMatch(/needsNonInvokerSigningBy/);
    }
  });

  it("alice swaps bob 10 A for 1 B", async () => {
    const tx = await context.swapContractAsRoot.swap({
      a: context.alice.publicKey(),
      b: context.bob.publicKey(),
      token_a: context.tokenAId,
      token_b: context.tokenBId,
      amount_a: amountAToSwap,
      min_a_for_b: amountAToSwap,
      amount_b: amountBToSwap,
      min_b_for_a: amountBToSwap,
    });

    const needsNonInvokerSigningBy = await tx.needsNonInvokerSigningBy();
    expect(needsNonInvokerSigningBy).toHaveLength(2);
    expect(needsNonInvokerSigningBy.indexOf(context.alice.publicKey())).toBe(0);
    expect(needsNonInvokerSigningBy.indexOf(context.bob.publicKey())).toBe(1);

    // root serializes & sends to alice
    const xdrFromRoot = tx.toXDR();
    const { client: clientAlice } = await clientFor("swap", {
      keypair: context.alice,
      contractId: context.swapId,
    });
    const txAlice = clientAlice.txFromXDR(xdrFromRoot);
    await txAlice.signAuthEntries();

    // alice serializes & sends to bob
    const xdrFromAlice = txAlice.toXDR();
    const { client: clientBob } = await clientFor("swap", {
      keypair: context.bob,
      contractId: context.swapId,
    });
    const txBob = clientBob.txFromXDR(xdrFromAlice);
    await txBob.signAuthEntries();

    // bob serializes & sends back to root
    const xdrFromBob = txBob.toXDR();
    const { client: clientRoot } = await clientFor("swap", {
      keypair: context.root,
      contractId: context.swapId,
    });
    const txRoot = clientRoot.txFromXDR(xdrFromBob);

    await txRoot.simulate();
    const result = await txRoot.signAndSend({
      watcher: {
        onSubmitted: () => {
          // console.log(response);
        },
        onProgress: () => {
          // console.log(response);
        },
      },
    });

    expect(result).toHaveProperty("sendTransactionResponse");
    expect(result.sendTransactionResponse).toHaveProperty("status", "PENDING");
    expect(result).toHaveProperty("getTransactionResponseAll");
    expect(Array.isArray(result.getTransactionResponseAll)).toBe(true);
    expect(result.getTransactionResponseAll!.length).toBeGreaterThan(0);
    expect(result.getTransactionResponse).toHaveProperty("status");
    expect(result.getTransactionResponse!.status).not.toBe("FAILED");
    expect(result.getTransactionResponse).toHaveProperty(
      "status",
      rpc.Api.GetTransactionStatus.SUCCESS,
    );

    const aliceTokenABalance = await context.tokenA.balance({
      id: context.alice.publicKey(),
    });
    const aliceTokenBBalance = await context.tokenB.balance({
      id: context.alice.publicKey(),
    });
    const bobTokenABalance = await context.tokenA.balance({
      id: context.bob.publicKey(),
    });
    const bobTokenBBalance = await context.tokenB.balance({
      id: context.bob.publicKey(),
    });

    expect(aliceTokenABalance.result).toBe(0n);
    expect(aliceTokenBBalance.result).toBe(amountBToSwap);
    expect(bobTokenABalance.result).toBe(amountAToSwap);
    expect(bobTokenBBalance.result).toBe(0n);
  });
});
