import { base64ToUint8Array, uint8ArrayToBase64 } from "uint8array-extras";
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
    .toXdr();
}

// A 32-byte stand-in for an auth entry preimage; `signAuthEntry` only hashes
// the bytes, so it does not need to be valid XDR.
const preimage = uint8ArrayToBase64(new Uint8Array(32).fill(7));

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
    const signed = TransactionBuilder.fromXdr(signedTxXdr, networkPassphrase);
    expect(signed.signatures).toHaveLength(1);
    expect(
      keypair.verify(signed.hash(), signed.signatures[0].signature.value),
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

    const signed = TransactionBuilder.fromXdr(signedTxXdr, Networks.TESTNET);
    expect(
      keypair.verify(signed.hash(), signed.signatures[0].signature.value),
    ).toBe(true);
  });

  it("signs an auth entry preimage's hash", async () => {
    const keypair = Keypair.random();
    const signer = new KeypairSigner(keypair, networkPassphrase);

    const { signedAuthEntry, signerAddress } =
      await signer.signAuthEntry(preimage);

    expect(signerAddress).toEqual(keypair.publicKey());
    expect(base64ToUint8Array(signedAuthEntry)).toEqual(
      keypair.sign(hash(base64ToUint8Array(preimage))),
    );
  });

  it("keeps working when its methods are pulled off the instance", async () => {
    // `basicNodeSigner` destructures them and the normalizers read them off the
    // instance, so they must not depend on being called as methods.
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

  it("unwraps a Signer's callbacks", async () => {
    const signer: Signer = {
      address: Keypair.random().publicKey(),
      signTransaction: callback,
      signAuthEntry: authCallback,
    };

    // Delegation, not reference identity: the returned callbacks are bound to
    // the signer, so they are wrappers rather than the originals.
    const signTransaction = toSignTransaction(signer, networkPassphrase);
    const signAuthEntry = toSignAuthEntry(signer, networkPassphrase);
    if (!signTransaction)
      throw new Error("expected a signTransaction callback");
    if (!signAuthEntry) throw new Error("expected a signAuthEntry callback");

    expect(await signTransaction("xdr")).toEqual(await callback("xdr"));
    expect(await signAuthEntry("entry")).toEqual(await authCallback("entry"));
  });

  it("reports a Signer that omits signAuthEntry as absent", () => {
    const signer: Signer = {
      address: Keypair.random().publicKey(),
      signTransaction: callback,
    };

    expect(toSignTransaction(signer, networkPassphrase)).toBeTypeOf("function");
    expect(toSignAuthEntry(signer, networkPassphrase)).toBeUndefined();
  });

  it("wraps a Keypair, signing as that keypair", async () => {
    const keypair = Keypair.random();
    const xdr = buildTxXdr(keypair);

    const signTransaction = toSignTransaction(keypair, networkPassphrase);
    const signAuthEntry = toSignAuthEntry(keypair, networkPassphrase);
    if (!signTransaction)
      throw new Error("expected a signTransaction callback");
    if (!signAuthEntry) throw new Error("expected a signAuthEntry callback");

    expect(await signTransaction(xdr)).toEqual(
      await new KeypairSigner(keypair, networkPassphrase).signTransaction(xdr),
    );
    expect(await signAuthEntry(preimage)).toHaveProperty(
      "signerAddress",
      keypair.publicKey(),
    );
  });

  it("keeps `this` for a Signer implemented with prototype methods", async () => {
    // A class-based Signer is idiomatic, and TypeScript accepts a prototype
    // method for `signTransaction: SignTransaction`. Extracting the bare
    // function reference must not strip its receiver.
    class ClassSigner implements Signer {
      readonly address = Keypair.random().publicKey();
      private secret = "kept";

      async signTransaction() {
        return Promise.resolve({ signedTxXdr: this.secret });
      }

      async signAuthEntry() {
        return Promise.resolve({ signedAuthEntry: this.secret });
      }
    }
    const signer = new ClassSigner();

    const signTransaction = toSignTransaction(signer, networkPassphrase);
    const signAuthEntry = toSignAuthEntry(signer, networkPassphrase);
    if (!signTransaction)
      throw new Error("expected a signTransaction callback");
    if (!signAuthEntry) throw new Error("expected a signAuthEntry callback");

    expect(await signTransaction("xdr")).toEqual({ signedTxXdr: "kept" });
    expect(await signAuthEntry("entry")).toEqual({ signedAuthEntry: "kept" });
  });

  it("passes undefined through", () => {
    expect(toSignTransaction(undefined, networkPassphrase)).toBeUndefined();
    expect(toSignAuthEntry(undefined, networkPassphrase)).toBeUndefined();
  });

  it("recognizes a Keypair from a different copy of the module", async () => {
    // `instanceof` fails when a caller's Keypair comes from a different copy of
    // the module — the CJS and ESM builds have distinct `Keypair` classes, as do
    // duplicate installs — so the check is structural. Simulated here by a
    // distinct object exposing the two members KeypairSigner uses.
    const keypair = Keypair.random();
    const foreign = {
      publicKey: () => keypair.publicKey(),
      sign: (data: Buffer) => keypair.sign(data),
      signDecorated: (data: Buffer) => keypair.signDecorated(data),
    };
    expect(foreign instanceof Keypair).toBe(false);

    const signTransaction = toSignTransaction(
      foreign as unknown as Keypair,
      networkPassphrase,
    );
    const signAuthEntry = toSignAuthEntry(
      foreign as unknown as Keypair,
      networkPassphrase,
    );
    if (!signTransaction)
      throw new Error("expected a signTransaction callback");
    if (!signAuthEntry) throw new Error("expected a signAuthEntry callback");

    // Exercise both callbacks rather than just checking their type: a stand-in
    // missing a member the signing path needs would otherwise pass this test.
    const { signedTxXdr } = await signTransaction(buildTxXdr(keypair));
    const signed = TransactionBuilder.fromXdr(signedTxXdr, networkPassphrase);
    expect(
      keypair.verify(signed.hash(), signed.signatures[0].signature.value),
    ).toBe(true);
    expect(await signAuthEntry(preimage)).toHaveProperty(
      "signerAddress",
      keypair.publicKey(),
    );
  });

  it("rejects a partial keypair that cannot sign an envelope", () => {
    // `Transaction.sign` reaches for `signDecorated`, which `signAuthEntry`
    // never needs. An object with only `publicKey`/`sign` therefore half-works,
    // and must be refused up front rather than producing a `signTransaction`
    // callback that throws `signDecorated is not a function` when used.
    const keypair = Keypair.random();
    const partial = {
      publicKey: () => keypair.publicKey(),
      sign: (data: Buffer) => keypair.sign(data),
    };

    expect(
      toSignTransaction(partial as unknown as Keypair, networkPassphrase),
    ).toBeUndefined();
    expect(
      toSignAuthEntry(partial as unknown as Keypair, networkPassphrase),
    ).toBeUndefined();
  });

  it("treats a non-function signAuthEntry as absent", async () => {
    // A valid `signTransaction` alongside a junk `signAuthEntry`: the usable
    // callback must still come through, and the junk one must not throw.
    const malformed = {
      address: Keypair.random().publicKey(),
      signTransaction: callback,
      signAuthEntry: "nope",
    } as unknown as Signer;

    const signTransaction = toSignTransaction(malformed, networkPassphrase);
    if (!signTransaction)
      throw new Error("expected a signTransaction callback");

    expect(await signTransaction("xdr")).toEqual(await callback("xdr"));
    expect(toSignAuthEntry(malformed, networkPassphrase)).toBeUndefined();
  });

  it("prefers the Signer shape over the Keypair shape", async () => {
    // A Signer that also exposes `sign`/`publicKey` must still route through its
    // own `signTransaction` rather than being mistaken for a keypair.
    const keypair = Keypair.random();
    const hybrid = {
      address: keypair.publicKey(),
      signTransaction: callback,
      publicKey: () => keypair.publicKey(),
      sign: (data: Buffer) => keypair.sign(data),
    };

    const signTransaction = toSignTransaction(hybrid, networkPassphrase);
    if (!signTransaction)
      throw new Error("expected a signTransaction callback");

    // The Signer's own callback returns this sentinel; had it been treated as a
    // keypair, signing would instead try to parse "xdr" as an envelope.
    expect(await signTransaction("xdr")).toEqual({ signedTxXdr: "unused" });
  });

  // Malformed input cannot occur in TypeScript, but the SDK is consumed from
  // plain JavaScript too. Each of these must degrade to `undefined` so the
  // caller raises its own `NoSigner`, rather than throwing from the normalizer.
  it.each([
    ["null", null],
    ["an empty object", {}],
    ["an object with no callbacks", { address: "G..." }],
    ["a null signTransaction", { address: "G...", signTransaction: null }],
    ["a string", "not a signer"],
    ["a number", 42],
    // `?.bind` only guards null/undefined, so a present-but-non-function
    // member would otherwise reach `.bind` and throw.
    ["a string signTransaction", { address: "G...", signTransaction: "nope" }],
    ["a number signTransaction", { address: "G...", signTransaction: 42 }],
    ["an object signTransaction", { address: "G...", signTransaction: {} }],
  ])("degrades to undefined for %s", (_label, malformed) => {
    expect(
      toSignTransaction(malformed as never, networkPassphrase),
    ).toBeUndefined();
    expect(
      toSignAuthEntry(malformed as never, networkPassphrase),
    ).toBeUndefined();
  });
});
