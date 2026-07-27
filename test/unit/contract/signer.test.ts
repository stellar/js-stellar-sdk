import { describe, it, expect } from "vitest";
import {
  Account,
  Asset,
  BASE_FEE,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  hash,
} from "../../../src/index.js";
import {
  KeypairSigner,
  toSignAuthEntry,
  toSignTransaction,
} from "../../../src/contract/signer.js";
import type { Signer } from "../../../src/contract/signer.js";
import { basicNodeSigner } from "../../../src/contract/basic_node_signer.js";
import type {
  SignAuthEntry,
  SignTransaction,
} from "../../../src/contract/types.js";

const networkPassphrase = Networks.TESTNET;

function buildTxXdr(source: Keypair): string {
  return new TransactionBuilder(new Account(source.publicKey(), "1"), {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: Keypair.random().publicKey(),
        asset: Asset.native(),
        amount: "1",
      }),
    )
    .setTimeout(30)
    .build()
    .toXDR();
}

// A 32-byte stand-in for an auth entry preimage; `signAuthEntry` only hashes
// the bytes, so it does not need to be valid XDR.
const preimage = Buffer.alloc(32, 7).toString("base64");

describe("KeypairSigner", () => {
  it("exposes the keypair's address as its identity", () => {
    const keypair = Keypair.random();
    expect(new KeypairSigner(keypair, networkPassphrase).address).toEqual(
      keypair.publicKey(),
    );
  });

  it("signs a transaction with the keypair", async () => {
    const keypair = Keypair.random();
    const signer = new KeypairSigner(keypair, networkPassphrase);

    const { signedTxXdr, signerAddress } = await signer.signTransaction(
      buildTxXdr(keypair),
    );

    expect(signerAddress).toEqual(keypair.publicKey());
    const signed = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
    expect(signed.signatures).toHaveLength(1);
    expect(
      keypair.verify(signed.hash(), signed.signatures[0].signature()),
    ).toBe(true);
  });

  it("prefers the passphrase passed at signing time over its own", async () => {
    const keypair = Keypair.random();
    // Constructed for PUBLIC, but asked to sign for TESTNET. The passphrase
    // feeds into the signature payload, so only one of the two can verify.
    const signer = new KeypairSigner(keypair, Networks.PUBLIC);

    const { signedTxXdr } = await signer.signTransaction(buildTxXdr(keypair), {
      networkPassphrase: Networks.TESTNET,
    });

    const signed = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
    expect(
      keypair.verify(signed.hash(), signed.signatures[0].signature()),
    ).toBe(true);
  });

  it("signs an auth entry preimage's hash", async () => {
    const keypair = Keypair.random();
    const signer = new KeypairSigner(keypair, networkPassphrase);

    const { signedAuthEntry, signerAddress } =
      await signer.signAuthEntry(preimage);

    expect(signerAddress).toEqual(keypair.publicKey());
    expect(Buffer.from(signedAuthEntry, "base64")).toEqual(
      keypair.sign(hash(Buffer.from(preimage, "base64"))),
    );
  });

  it("keeps working when its methods are pulled off the instance", async () => {
    // `basicNodeSigner` spreads them and the normalizers extract them, so they
    // must not depend on being called as methods.
    const keypair = Keypair.random();
    const { signTransaction, signAuthEntry } = new KeypairSigner(
      keypair,
      networkPassphrase,
    );

    expect(await signTransaction(buildTxXdr(keypair))).toHaveProperty(
      "signerAddress",
      keypair.publicKey(),
    );
    expect(await signAuthEntry(preimage)).toHaveProperty(
      "signerAddress",
      keypair.publicKey(),
    );
  });
});

describe("basicNodeSigner", () => {
  it("produces the same signatures as KeypairSigner", async () => {
    const keypair = Keypair.random();
    const xdr = buildTxXdr(keypair);
    const legacy = basicNodeSigner(keypair, networkPassphrase);
    const signer = new KeypairSigner(keypair, networkPassphrase);

    expect(await legacy.signTransaction(xdr)).toEqual(
      await signer.signTransaction(xdr),
    );
    expect(await legacy.signAuthEntry(preimage)).toEqual(
      await signer.signAuthEntry(preimage),
    );
  });
});

describe("signer normalization", () => {
  const callback: SignTransaction = () =>
    Promise.resolve({ signedTxXdr: "unused" });
  const authCallback: SignAuthEntry = () =>
    Promise.resolve({ signedAuthEntry: "unused" });

  it("passes a raw callback through untouched", () => {
    expect(toSignTransaction(callback, networkPassphrase)).toBe(callback);
    expect(toSignAuthEntry(authCallback, networkPassphrase)).toBe(authCallback);
  });

  it("unwraps a Signer's callbacks", () => {
    const signer: Signer = {
      address: Keypair.random().publicKey(),
      signTransaction: callback,
      signAuthEntry: authCallback,
    };

    expect(toSignTransaction(signer, networkPassphrase)).toBe(callback);
    expect(toSignAuthEntry(signer, networkPassphrase)).toBe(authCallback);
  });

  it("reports a Signer that omits signAuthEntry as absent", () => {
    const signer: Signer = {
      address: Keypair.random().publicKey(),
      signTransaction: callback,
    };

    expect(toSignTransaction(signer, networkPassphrase)).toBe(callback);
    expect(toSignAuthEntry(signer, networkPassphrase)).toBeUndefined();
  });

  it("wraps a Keypair, signing as that keypair", async () => {
    const keypair = Keypair.random();
    const xdr = buildTxXdr(keypair);

    const signTransaction = toSignTransaction(keypair, networkPassphrase);
    const signAuthEntry = toSignAuthEntry(keypair, networkPassphrase);
    if (!signAuthEntry) throw new Error("expected a signAuthEntry callback");

    expect(await signTransaction(xdr)).toEqual(
      await new KeypairSigner(keypair, networkPassphrase).signTransaction(xdr),
    );
    expect(await signAuthEntry(preimage)).toHaveProperty(
      "signerAddress",
      keypair.publicKey(),
    );
  });

  it("passes undefined through", () => {
    expect(toSignTransaction(undefined, networkPassphrase)).toBeUndefined();
    expect(toSignAuthEntry(undefined, networkPassphrase)).toBeUndefined();
  });
});
