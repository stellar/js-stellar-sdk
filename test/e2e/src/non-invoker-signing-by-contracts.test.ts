import { expect, beforeAll } from "vitest";
import { clientFor } from "./util";

let context: { tx: any; signingContractId: string };

describe("cross-contract auth", () => {
  beforeAll(async () => {
    const { contractId: signingContractId, keypair } =
      await clientFor("doesSigning");
    const { client: needsSignature } = await clientFor("needsSignature", {
      keypair: keypair!,
    });

    const tx = await (needsSignature as any).hello({
      to: keypair!.publicKey(),
      user_signer: keypair!.publicKey(),
      contract_signer: signingContractId,
    });
    context = { tx, signingContractId };
  });

  describe("needsNonInvokerSigningBy", () => {
    it("does not assume stellar accounts", () => {
      expect(context.tx.needsNonInvokerSigningBy()[0]).toBe(
        context.signingContractId,
      );
    });
  });

  describe("sign", () => {
    it("doesn't throw error when nonInvokerSigningBy returns a contract", async () => {
      await expect(
        context.tx.sign({ force: true }),
      ).resolves.not.toThrow();
    });
  });

  describe("signAuthEntries with custom authorizeEntry", () => {
    it("allows signing twice", async () => {
      const authorizeEntry = (entry: any) => entry;
      await context.tx.signAuthEntries({
        address: context.signingContractId,
        authorizeEntry,
      });
      await context.tx.signAuthEntries({
        address: context.signingContractId,
        authorizeEntry,
      });
    });
  });
});
