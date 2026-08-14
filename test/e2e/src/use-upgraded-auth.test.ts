import { expect, describe, it, beforeAll } from "vitest";
import { inspectAuthEntry } from "../../../lib/esm/index.js";
import { clientFor, generateFundedKeypair } from "./util.js";

// TEMP (CAP-71 transition): verifies that the RPC honors the deprecated
// `useUpgradedAuth` simulation flag, which the SDK now sends as `true` by
// default so simulation records v2 address credentials. Requires an RPC built
// with stellar/stellar-rpc#783 on protocol >= 27; on older hosts the flag is
// silently ignored and the v2 assertions fail. Delete this file once protocol
// 28 activates and the flag becomes a no-op.

let context: { client: any; userSigner: any; contractSigner: any };

const credentialTypes = (tx: any): string[] =>
  tx.simulationData.result.auth.map(
    (entry: any) => inspectAuthEntry(entry).credentialType,
  );

describe("useUpgradedAuth simulation flag (temp, CAP-71)", () => {
  beforeAll(async () => {
    const { client } = await clientFor("needsSignature");
    // recording-mode simulation does not run __check_auth, so plain funded
    // accounts work for both signers; they only need to differ from the
    // invoker so the recorded entries carry address (not source-account)
    // credentials
    const userSigner = await generateFundedKeypair();
    const contractSigner = await generateFundedKeypair();
    context = { client, userSigner, contractSigner };
  });

  const hello = (methodOptions?: object) =>
    context.client.hello(
      {
        to: "world",
        user_signer: context.userSigner.publicKey(),
        contract_signer: context.contractSigner.publicKey(),
      },
      methodOptions,
    );

  it("records v2 address credentials by default", async () => {
    const tx = await hello();
    const types = credentialTypes(tx);
    expect(types.length).toBeGreaterThan(0);
    expect(types).toEqual(types.map(() => "addressV2"));
  });

  it("records legacy v1 address credentials when disabled as a method option", async () => {
    const tx = await hello({ useUpgradedAuth: false });
    const types = credentialTypes(tx);
    expect(types.length).toBeGreaterThan(0);
    expect(types).toEqual(types.map(() => "address"));
  });

  it("records legacy v1 address credentials when disabled per simulate() call", async () => {
    // skip the automatic simulation: once a simulation's auth entries are
    // assembled onto the transaction, a re-simulation runs in enforce mode,
    // where the flag has no effect
    const tx = await hello({ simulate: false });
    await tx.simulate({ useUpgradedAuth: false });
    const types = credentialTypes(tx);
    expect(types.length).toBeGreaterThan(0);
    expect(types).toEqual(types.map(() => "address"));
  });
});
