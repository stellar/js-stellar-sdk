const { expect } = require('chai');
const { describe, it, before } = require('mocha');
const { contract, rpc } = require("../../..");
const { clientFor, generateFundedKeypair } = require("./util");

const amountAToSwap = 2n;
const amountBToSwap = 1n;

describe("Swap Contract Tests", function () {

  before(async function () {
    const alice = await generateFundedKeypair();
    const bob = await generateFundedKeypair();

    const {
      client: tokenA,
      contractId: tokenAId,
      keypair: root,
    } = await clientFor("token");
    const { client: tokenB, contractId: tokenBId } = await clientFor("token", {
      keypair: root,
    });
    const { client: swapContractAsRoot, contractId: swapId } = await clientFor(
      "swap",
      { keypair: root },
    );
    await (
      await tokenA.initialize({
        admin: root.publicKey(),
        decimal: 0,
        name: "Token A",
        symbol: "A",
      })
    ).signAndSend();
    await (
      await tokenA.mint({ amount: amountAToSwap, to: alice.publicKey() })
    ).signAndSend();

    await tokenB.initialize({
      admin: root.publicKey(),
      decimal: 0,
      name: "Token B",
      symbol: "B",
    }).then(t => t.signAndSend());
    await (
      await tokenB.mint({ amount: amountBToSwap, to: bob.publicKey() })
    ).signAndSend();

    this.context = {
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

  it("calling `signAndSend()` too soon throws descriptive error", async function() {
    const tx = await this.context.swapContractAsRoot.swap({
      a: this.context.alice.publicKey(),
      b: this.context.bob.publicKey(),
      token_a: this.context.tokenAId,
      token_b: this.context.tokenBId,
      amount_a: amountAToSwap,
      min_a_for_b: amountAToSwap,
      amount_b: amountBToSwap,
      min_b_for_a: amountBToSwap,
    });
    await expect(tx.signAndSend()).to.be.rejectedWith(contract.AssembledTransaction.Errors.NeedsMoreSignatures).then((error) => {
      // Further assertions on the error object
      expect(error).to.be.instanceOf(contract.AssembledTransaction.Errors.NeedsMoreSignatures,
        `error is not of type 'NeedsMoreSignaturesError'; instead it is of type '${error?.constructor.name}'`);
      
      if (error) {
        // Using regex to check the error message
        expect(error.message).to.match(/needsNonInvokerSigningBy/);
      }
    });
  });

  it("alice swaps bob 10 A for 1 B", async function() {
    const tx = await this.context.swapContractAsRoot.swap({
      a: this.context.alice.publicKey(),
      b: this.context.bob.publicKey(),
      token_a: this.context.tokenAId,
      token_b: this.context.tokenBId,
      amount_a: amountAToSwap,
      min_a_for_b: amountAToSwap,
      amount_b: amountBToSwap,
      min_b_for_a: amountBToSwap,
    });

    const needsNonInvokerSigningBy = await tx.needsNonInvokerSigningBy();
    expect(needsNonInvokerSigningBy).to.have.lengthOf(2);
    expect(needsNonInvokerSigningBy.indexOf(this.context.alice.publicKey())).to.equal(0, "needsNonInvokerSigningBy does not have alice's public key!");
    expect(needsNonInvokerSigningBy.indexOf(this.context.bob.publicKey())).to.equal(1, "needsNonInvokerSigningBy does not have bob's public key!");

    // root serializes & sends to alice
    const xdrFromRoot = tx.toXDR();
    const { client: clientAlice } = await clientFor("swap", {
      keypair: this.context.alice,
      contractId: this.context.swapId,
    });
    const txAlice = clientAlice.txFromXDR(xdrFromRoot);
    await txAlice.signAuthEntries();

    // alice serializes & sends to bob
    const xdrFromAlice = txAlice.toXDR();
    const { client: clientBob } = await clientFor("swap", {
      keypair: this.context.bob,
      contractId: this.context.swapId,
    });
    const txBob = clientBob.txFromXDR(xdrFromAlice);
    await txBob.signAuthEntries();

    // bob serializes & sends back to root
    const xdrFromBob = txBob.toXDR();
    const { client: clientRoot } = await clientFor("swap", {
      keypair: this.context.root,
      contractId: this.context.swapId,
    });
    const txRoot = clientRoot.txFromXDR(xdrFromBob);

  await txRoot.simulate();
  const result = await txRoot.signAndSend({force: true});

    expect(result).to.have.property('sendTransactionResponse');
    expect(result.sendTransactionResponse).to.have.property('status', 'PENDING');
    expect(result).to.have.property('getTransactionResponseAll').that.is.an('array').that.is.not.empty;
    expect(result.getTransactionResponse).to.have.property('status').that.is.not.equal('FAILED');
    expect(result.getTransactionResponse).to.have.property('status', rpc.Api.GetTransactionStatus.SUCCESS);

    const aliceTokenABalance = await this.context.tokenA.balance({ id: this.context.alice.publicKey() });
    const aliceTokenBBalance = await this.context.tokenB.balance({ id: this.context.alice.publicKey() });
    const bobTokenABalance = await this.context.tokenA.balance({ id: this.context.bob.publicKey() });
    const bobTokenBBalance = await this.context.tokenB.balance({ id: this.context.bob.publicKey() });

    expect(aliceTokenABalance.result).to.equal(0n);
    expect(aliceTokenBBalance.result).to.equal(amountBToSwap);
    expect(bobTokenABalance.result).to.equal(amountAToSwap);
    expect(bobTokenBBalance.result).to.equal(0n);
  });
});
