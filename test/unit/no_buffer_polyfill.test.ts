import { describe, expect, it } from "vitest";
import { uint8ArrayToHex } from "uint8array-extras";
import { hash } from "../../src/base/hashing.js";
import { Keypair } from "../../src/base/keypair.js";
import { StrKey } from "../../src/base/strkey.js";
import { Asset } from "../../src/base/asset.js";
import { Memo } from "../../src/base/memo.js";
import { Operation } from "../../src/base/operation.js";
import { Networks } from "../../src/base/network.js";

// Acceptance test for #1457: the SDK must work without a Buffer polyfill and
// hand out plain Uint8Array (never Buffer) from its public byte APIs.

const isNode = typeof globalThis.process?.versions?.node === "string";

function expectPlainBytes(value: unknown): void {
  expect(value).toBeInstanceOf(Uint8Array);
  // Not a subclass like Buffer — exactly Uint8Array.
  expect((value as Uint8Array).constructor).toBe(Uint8Array);
}

describe("runs without a Buffer polyfill", () => {
  it.skipIf(isNode)("has no Buffer global in the browser", () => {
    expect((globalThis as any).Buffer).toBeUndefined();
  });

  it("hashes", () => {
    const digest = hash("hello world");
    expectPlainBytes(digest);
    expect(uint8ArrayToHex(digest)).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    );
  });

  it("signs and verifies", () => {
    const keypair = Keypair.master(Networks.TESTNET);
    const payload = hash("payload");

    const signature = keypair.sign(payload);
    expectPlainBytes(signature);
    expect(keypair.verify(payload, signature)).toBe(true);

    expectPlainBytes(keypair.rawPublicKey());
    expectPlainBytes(keypair.rawSecretKey());
    expectPlainBytes(keypair.signatureHint());
    expectPlainBytes(keypair.signDecorated(payload).signature.toBytes());
  });

  it("signs and verifies SEP-53 messages", () => {
    const keypair = Keypair.random();
    const signature = keypair.signMessage("Hello, World!");
    expectPlainBytes(signature);
    expect(keypair.verifyMessage("Hello, World!", signature)).toBe(true);
  });

  it("round-trips strkeys", () => {
    const keypair = Keypair.random();
    const raw = StrKey.decodeEd25519PublicKey(keypair.publicKey());
    expectPlainBytes(raw);
    expect(StrKey.encodeEd25519PublicKey(raw)).toBe(keypair.publicKey());
  });

  it("builds ManageData operations from raw bytes", () => {
    const value = new Uint8Array([1, 2, 3, 4]);
    const op = Operation.manageData({ name: "bytes", value });
    const decoded = Operation.fromXdrObject(op);
    expect(decoded.type).toBe("manageData");
    if (decoded.type !== "manageData") throw new Error("expected manageData");
    expectPlainBytes(decoded.value);
    expect(decoded.value).toEqual(value);
  });

  it("derives SAC contract IDs", () => {
    const contractId = Asset.native().contractId(Networks.TESTNET);
    expect(StrKey.isValidContract(contractId)).toBe(true);
  });

  it("hands out plain Uint8Array from Memo", () => {
    const bytes = new Uint8Array(32).fill(7);
    const memo = Memo.hash(bytes);
    expectPlainBytes(memo.value);
  });
});
