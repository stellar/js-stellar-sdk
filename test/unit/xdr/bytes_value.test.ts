import { describe, expect, it } from "vitest";
import {
  Hash,
  PoolId,
  Signature,
  DecoratedSignature,
} from "../../../src/xdr/index.js";

const bytes32 = Uint8Array.from({ length: 32 }, (_, i) => i);

describe("BytesValue iteration", () => {
  it("iterates as bytes, so Array.from and spread give the real contents", () => {
    const h = new Hash(bytes32);
    expect(Array.from(h)).toEqual(Array.from(bytes32));
    expect([...h]).toEqual(Array.from(bytes32));
    expect(Array.from(h)).toHaveLength(32);
  });

  it("iterates on every wrapper, not just Hash", () => {
    expect(Array.from(new Signature(new Uint8Array(64).fill(7)))).toHaveLength(
      64,
    );
    const dec = new DecoratedSignature({
      hint: new Uint8Array(4).fill(1),
      signature: new Uint8Array(64).fill(2),
    });
    expect([...dec.hint]).toEqual([1, 1, 1, 1]);
    expect([...dec.signature]).toHaveLength(64);
  });

  // Deliberately absent: `length` would make an index loop run and read
  // `undefined` per byte, since index access needs a Proxy to work.
  it("is not array-like — no length, not indexable", () => {
    const h = new Hash(bytes32) as unknown as {
      length?: number;
      0?: unknown;
    };
    expect(h.length).toBeUndefined();
    expect(h[0]).toBeUndefined();
  });

  it("does not become a Uint8Array", () => {
    const h = new Hash(bytes32);
    expect(h).not.toBeInstanceOf(Uint8Array);
    expect(h.toBytes()).toBeInstanceOf(Uint8Array);
    expect(h.value).toBe(h.toBytes());
  });

  it("leaves encoding, equality and JSON untouched", () => {
    const h = new Hash(bytes32);
    expect(h.toXdr()).toHaveLength(32);
    expect(h.equals(new Hash(bytes32))).toBe(true);
    expect(h.equals(new Hash(new Uint8Array(32)))).toBe(false);
    expect(Hash.fromXdr(h.toXdr()).equals(h)).toBe(true);
    expect(h.toJson()).toBe(h.toJson());
  });

  it("keeps `.equals()` class-aware where iteration is not", () => {
    const h = new Hash(bytes32);
    const p = new PoolId(bytes32);
    // Iteration reduces both to the same bytes...
    expect(Array.from(h)).toEqual(Array.from(p));
    // ...which is exactly why `.equals()` exists.
    expect(h.equals(p as never)).toBe(false);
  });
});
